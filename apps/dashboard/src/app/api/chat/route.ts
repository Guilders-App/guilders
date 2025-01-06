import { env } from "@/lib/env";
import { anthropic } from "@ai-sdk/anthropic";
import type { Account, Document, Transaction } from "@guilders/api/types";
import { createClient } from "@guilders/database/server";
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
  accounts: Account[];
  transactions: Transaction[];
  documents: Document[];
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );
  }

  // Check subscription status
  const { data: subscription } = await supabase
    .from("subscription")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const isSubscribed =
    subscription?.status === "active" ||
    subscription?.status === "trialing" ||
    env.NEXT_PUBLIC_ALLOW_PREMIUM_FEATURES;

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

  const accountsContext = await getAccountsContext(user.id);

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

  const { data: allAccounts, error: allAccountsError } = await supabase
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
  const { data: transactions, error: transactionsError } = await supabase
    .from("transaction")
    .select("*, account!inner(*)")
    .eq("account.user_id", userId)
    .order("date", { ascending: false })
    .limit(50);

  // Get documents
  const { data: documents, error: documentsError } = await supabase
    .from("document")
    .select("*")
    .eq("user_id", userId);

  // Get user settings
  const { data: userSettings, error: userSettingsError } = await supabase
    .from("user_setting")
    .select("*")
    .eq("user_id", userId)
    .single();

  const { data: exchangeRates, error: exchangeRatesError } = await supabase
    .from("rate")
    .select("*");

  if (
    transactionsError ||
    documentsError ||
    userSettingsError ||
    exchangeRatesError ||
    allAccountsError
  ) {
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
  const documentUrls = new Map<string, string>();
  if (documents) {
    for (const doc of documents) {
      const signedUrl = await getSignedUrl(doc.path);
      if (signedUrl) {
        documentUrls.set(doc.path, signedUrl);
      }
    }
  }

  // Create structured financial summary
  const summary: FinancialSummary = {
    netWorth: allAccounts.reduce(
      (sum, acc) => sum + (acc.type === "asset" ? acc.value : -acc.value),
      0,
    ),
    accounts: allAccounts,
    transactions: transactions || [],
    documents: documents || [],
    exchangeRates,
    primaryCurrency: userSettings?.currency || "EUR",
  };

  const prompt = generatePrompt(summary);

  console.log(prompt);

  return {
    text: prompt,
    images: Array.from(documentUrls.values()),
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
  }`,
    )
    .join("")}

Recent Transactions:${summary.transactions
    .map(
      (t) => `
• Account ID ${t.account_id}:
  - ${t.date}: ${t.amount} ${t.currency} (${t.category}) - ${t.description}${
    t.documents?.length
      ? `
    Documents: ${t.documents.join(", ")}`
      : ""
  }`,
    )
    .join("")}

Documents are linked to either accounts or transactions through their entity_id and entity_type fields:${summary.documents
    .map(
      (d) => `
• ${d.name} (${d.entity_type} ID: ${d.entity_id})`,
    )
    .join("")}

I have access to documents and receipts for some accounts and transactions.
I'll reference these when relevant to our discussion.
Documents can be referenced by their name, and I can associate them with the correct account or transaction using their entity information.

Use this financial data, documents, and exchange rates to provide personalized advice and insights when relevant.
Consider exchange rates when discussing amounts in different currencies.`;
};
