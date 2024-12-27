import { getApiClient } from "@/lib/api";
import { authenticate } from "@/lib/api/auth";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@guilders/database/server";
import type { Account } from "@guilders/database/types";
import {
  type CoreMessage,
  type ImagePart,
  type Message,
  convertToCoreMessages,
  streamText,
} from "ai";
import { type NextRequest, NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface FinancialSummary {
  netWorth: number;
  accounts: {
    id: number;
    name: string;
    type: string;
    subtype: string;
    value: number;
    currency: string;
    cost?: number;
    documents?: string[];
    children: {
      id: number;
      name: string;
      type: string;
      subtype: string;
      value: number;
      currency: string;
      cost?: number;
      documents?: string[];
      recentTransactions: {
        date: string;
        amount: number;
        category: string;
        description: string;
        documents?: string[];
      }[];
    }[];
    recentTransactions: {
      date: string;
      amount: number;
      category: string;
      description: string;
      documents?: string[];
    }[];
  }[];
  primaryCurrency: string;
  exchangeRates: {
    currency_code: string;
    rate: number;
  }[];
}

/**
 * @swagger
 * /api/chat:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Chat with the AI financial advisor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully streamed chat response
 */
export async function POST(request: NextRequest) {
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  }

  // Check subscription status
  const { data: subscription } = await client
    .from("subscription")
    .select("status")
    .eq("user_id", userId)
    .single();

  const isSubscribed =
    subscription?.status === "active" || subscription?.status === "trialing";

  if (!isSubscribed) {
    return NextResponse.json(
      {
        success: false,
        error:
          "This feature requires a Pro subscription. Please upgrade to continue.",
      },
      { status: 403 },
    );
  }

  let messages: Message[];
  try {
    ({ messages } = await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  const accountsContext = await getAccountsContext(userId);

  // Create the complete messages array with system message first
  const imageMessages: CoreMessage[] = [
    {
      role: "user",
      content: [
        ...accountsContext.images.map(
          (url) =>
            ({
              type: "image",
              image: url,
            }) as ImagePart,
        ),
      ],
    },
  ];

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    // model: google("gemini-2.0-flash-exp"),
    system: accountsContext.text,
    messages: [...imageMessages, ...convertToCoreMessages(messages)],
  });

  return result.toDataStreamResponse();
}

const getAccountsContext = async (userId: string) => {
  const supabase = await createClient();
  const api = await getApiClient();
  const exchangeRatesResponse = await api.rates.$get({
    query: { base: "EUR" },
  });

  if (exchangeRatesResponse.status !== 200) {
    console.error("Failed to fetch exchange rates");
    throw new Error("Failed to fetch exchange rates");
  }

  const { data: exchangeRates } = await exchangeRatesResponse.json();

  // Get all accounts with their connections
  const { data: allAccounts } = await supabase
    .from("account")
    .select(
      `
      *,
      institution_connection (
        broken,
        institution (
          name,
          logo_url,
          provider (
            id,
            name
          )
        )
      )
    `,
    )
    .eq("user_id", userId);

  // Get transactions
  const { data: transactions } = await supabase
    .from("transaction")
    .select("*, account!inner(*)")
    .eq("account.user_id", userId)
    .order("date", { ascending: false })
    .limit(50);

  // Get user settings
  const { data: userSettings } = await supabase
    .from("user_setting")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!allAccounts || allAccounts.length === 0) {
    return {
      text: "No financial information available.",
      images: [],
    };
  }

  // Get signed URLs for all documents
  const getSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("user_files")
      .createSignedUrl(path, 600);

    if (error || !data) return null;
    return data.signedUrl;
  };

  // Collect and sign all document URLs
  const documentUrls: string[] = [];
  for (const account of allAccounts) {
    if (account.documents) {
      for (const doc of account.documents) {
        const signedUrl = await getSignedUrl(doc);
        if (signedUrl) documentUrls.push(signedUrl);
      }
    }
  }

  if (transactions) {
    for (const transaction of transactions) {
      if (transaction.documents && transaction.documents.length > 0) {
        for (const doc of transaction.documents) {
          const signedUrl = await getSignedUrl(doc);
          if (signedUrl) {
            documentUrls.push(signedUrl);
          }
        }
      }
    }
  }

  // Create a map of all accounts with their children
  const accountsMap = new Map();
  for (const acc of allAccounts) {
    accountsMap.set(acc.id, {
      ...acc,
      children: [],
      institution_connection: acc.institution_connection?.institution
        ? {
            broken: acc.institution_connection.broken,
            institution: {
              name: acc.institution_connection.institution.name,
              logo_url: acc.institution_connection.institution.logo_url,
            },
            provider: acc.institution_connection.institution.provider
              ? {
                  id: acc.institution_connection.institution.provider.id,
                  name: acc.institution_connection.institution.provider.name,
                }
              : undefined,
          }
        : null,
    });
  }

  // Build the hierarchy
  const topLevelAccounts: Account[] = [];
  for (const acc of allAccounts) {
    if (acc.parent) {
      const parentAccount = accountsMap.get(acc.parent);
      if (parentAccount) {
        parentAccount.children.push(accountsMap.get(acc.id));
      }
    } else {
      topLevelAccounts.push(accountsMap.get(acc.id));
    }
  }

  // Create structured financial summary with hierarchical accounts
  const summary: FinancialSummary = {
    netWorth: topLevelAccounts.reduce(
      (sum, acc) => sum + (acc.type === "asset" ? acc.value : -acc.value),
      0,
    ),
    accounts: topLevelAccounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      value: account.value,
      currency: account.currency,
      cost: account.cost || undefined,
      documents: account.documents || [],
      children: account.children.map((child) => ({
        id: child.id,
        name: child.name,
        type: child.type,
        subtype: child.subtype,
        value: child.value,
        currency: child.currency,
        cost: child.cost || undefined,
        documents: child.documents || [],
        recentTransactions:
          transactions
            ?.filter((t) => t.account_id === child.id)
            .map((t) => ({
              date: t.date,
              amount: t.amount,
              category: t.category,
              description: t.description,
              documents: t.documents || [],
            })) || [],
      })),
      recentTransactions:
        transactions
          ?.filter((t) => t.account_id === account.id)
          .map((t) => ({
            date: t.date,
            amount: t.amount,
            category: t.category,
            description: t.description,
            documents: t.documents || [],
          })) || [],
    })),
    exchangeRates,
    primaryCurrency: userSettings?.currency || "EUR",
  };

  return {
    text: generatePrompt(summary),
    images: documentUrls,
  };
};

const generatePrompt = (summary: FinancialSummary) => {
  return `Financial Overview:
- Net Worth: ${summary.netWorth} ${summary.primaryCurrency}
- Number of Accounts: ${summary.accounts.length}

Exchange Rates (Base: USD):
${summary.exchangeRates.map((rate) => `- 1 USD = ${rate.rate} ${rate.currency_code}`).join("\n")}

Account Details:${summary.accounts
    .map(
      (acc) => `
• ${acc.name} (${acc.type}/${acc.subtype})
  - Value: ${acc.value} ${acc.currency}${
    acc.cost
      ? `
  - Cost Basis: ${acc.cost} ${acc.currency}`
      : ""
  }${
    acc.recentTransactions.length > 0
      ? `\n  Recent Activity:
${acc.recentTransactions
  .map(
    (t) =>
      `  - ${t.date}: ${t.amount} ${acc.currency} (${t.category}) - ${t.description}${
        t.documents?.length
          ? `\n    Documents: ${t.documents.map((d) => `\n      - ${d}`).join("")}`
          : ""
      }`,
  )
  .join("\n")}`
      : ""
  }${
    acc.documents?.length
      ? `\n  Documents: ${acc.documents.map((d) => `\n    - ${d}`).join("")}`
      : ""
  }${
    acc.children.length > 0
      ? `\n  Sub-Accounts:${acc.children
          .map(
            (child) => `
    • ${child.name} (${child.type}/${child.subtype})
      - Value: ${child.value} ${child.currency}${
        child.cost
          ? `
      - Cost Basis: ${child.cost} ${child.currency}`
          : ""
      }${
        child.recentTransactions.length > 0
          ? `\n      Recent Activity:${child.recentTransactions
              .map(
                (t) =>
                  `\n        - ${t.date}: ${t.amount} ${child.currency} (${t.category}) - ${t.description}${
                    t.documents?.length
                      ? `\n          Documents: ${t.documents.map((d) => `\n            - ${d}`).join("")}`
                      : ""
                  }`,
              )
              .join("")}`
          : ""
      }${
        child.documents?.length
          ? `\n      Documents: ${child.documents.map((d) => `\n        - ${d}`).join("")}`
          : ""
      }`,
          )
          .join("")}`
      : ""
  }`,
    )
    .join("")}

I have access to documents and receipts for some accounts and transactions.
I'll reference these when relevant to our discussion.
Refer to the documents by their base name, not the full path.
Make the connection to the encoded URI from the path name.
Every document has an encoded URI of the form: $BASE_URL/storage/v1/object/sign/user_files/$FILE_PATH?token=$TOKEN, learn to make the association, but don't mention the URI in your response.

Use this financial data, documents, and exchange rates to provide personalized advice and insights when relevant.
Consider exchange rates when discussing amounts in different currencies.`;
};
