import { authenticate } from "@/lib/api/auth";
import { createClient } from "@/lib/db/server";
import { Account } from "@/lib/db/types";
import { getRates } from "@/lib/db/utils";
import { google } from "@ai-sdk/google";
import { convertToCoreMessages, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

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
    children: {
      id: number;
      name: string;
      type: string;
      subtype: string;
      value: number;
      currency: string;
      cost?: number;
      recentTransactions: {
        date: string;
        amount: number;
        category: string;
        description: string;
      }[];
    }[];
    recentTransactions: {
      date: string;
      amount: number;
      category: string;
      description: string;
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
      { status: 401 }
    );
  }

  let messages;
  try {
    ({ messages } = await request.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const accountsContext = await getAccountsContext(userId);
  const systemMessage = `
    You are a knowledgeable financial advisor with access to the user's current financial data.
    Provide accurate, actionable advice while being direct and concise.
    Focus on personal finance, investments, and retirement planning.

    ${accountsContext}

    When discussing amounts, always specify the currency but used the symbol where applicable.
    Base your advice on the user's actual financial situation as shown in their data.
    If asked about topics outside of the provided financial data, make that clear in your response.
  `;

  console.log(accountsContext);
  const result = streamText({
    // model: anthropic("claude-3-5-sonnet-20241022"),
    model: google("gemini-2.0-flash-exp"),
    system: systemMessage,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}

const getAccountsContext = async (userId: string): Promise<string> => {
  const supabase = await createClient();
  const exchangeRates = await getRates();

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
    `
    )
    .eq("user_id", userId);

  // Get transactions
  const { data: transactions } = await supabase
    .from("transaction")
    .select(`*, account!inner(*)`)
    .eq("account.user_id", userId)
    .order("date", { ascending: false })
    .limit(50);

  // Get user settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!allAccounts || allAccounts.length === 0) {
    return "No financial information available.";
  }

  // Create a map of all accounts with their children
  const accountsMap = new Map();
  allAccounts.forEach((acc) => {
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
  });

  // Build the hierarchy
  const topLevelAccounts: Account[] = [];
  allAccounts.forEach((acc) => {
    if (acc.parent) {
      const parentAccount = accountsMap.get(acc.parent);
      if (parentAccount) {
        parentAccount.children.push(accountsMap.get(acc.id));
      }
    } else {
      topLevelAccounts.push(accountsMap.get(acc.id));
    }
  });

  // Create structured financial summary with hierarchical accounts
  const summary: FinancialSummary = {
    netWorth: topLevelAccounts.reduce(
      (sum, acc) => sum + (acc.type === "asset" ? acc.value : -acc.value),
      0
    ),
    accounts: topLevelAccounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      value: account.value,
      currency: account.currency,
      cost: account.cost || undefined,
      children: account.children.map((child) => ({
        id: child.id,
        name: child.name,
        type: child.type,
        subtype: child.subtype,
        value: child.value,
        currency: child.currency,
        cost: child.cost || undefined,
        recentTransactions:
          transactions
            ?.filter((t) => t.account_id === child.id)
            .map((t) => ({
              date: t.date,
              amount: t.amount,
              category: t.category,
              description: t.description,
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
          })) || [],
    })),
    exchangeRates,
    primaryCurrency: userSettings?.currency || "EUR",
  };

  return generatePrompt(summary);
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
  .map((t) => `  - ${t.date}: ${t.amount} ${acc.currency} (${t.category})`)
  .join("\n")}`
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
          ? `\n      Recent Activity:
${child.recentTransactions
  .map(
    (t) => `      - ${t.date}: ${t.amount} ${child.currency} (${t.category})`
  )
  .join("\n")}`
          : ""
      }`
          )
          .join("")}`
      : ""
  }`
    )
    .join("")}

Use this financial data and exchange rates to provide personalized advice and insights when relevant.
Consider exchange rates when discussing amounts in different currencies.`;
};
