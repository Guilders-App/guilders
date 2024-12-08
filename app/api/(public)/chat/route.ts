import { createAdminClient } from "@/lib/db/admin";
import { createClient } from "@/lib/db/server";
import { getRates } from "@/lib/db/utils";
import { anthropic } from "@ai-sdk/anthropic";
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
  const { messages } = await request.json();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const accountsContext = await getAccountsContext(user.id);
  const systemMessage = `
  You are a knowledgeable financial advisor with access to the user's current financial data.
  Provide accurate, actionable advice while being direct and concise.
  Focus on personal finance, investments, and retirement planning.

  ${accountsContext}

  When discussing amounts, always specify the currency but used the symbol where applicable.
  Base your advice on the user's actual financial situation as shown in their data.
  If asked about topics outside of the provided financial data, make that clear in your response.
  `;

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: systemMessage,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}

const getAccountsContext = async (user_id: string): Promise<string> => {
  const supabase = await createAdminClient();
  const exchangeRates = await getRates();

  const { data: accounts } = await supabase
    .from("account")
    .select("*")
    .eq("user_id", user_id);

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user_id)
    .single();

  const { data: transactions } = await supabase
    .from("transaction")
    .select("*, account!inner(*)")
    .eq("account.user_id", user_id)
    .order("date", { ascending: false })
    .limit(50);

  if (!accounts || accounts.length === 0) {
    return "No financial information available.";
  }

  // Create structured financial summary
  const summary: FinancialSummary = {
    netWorth: accounts.reduce(
      (sum, acc) => sum + (acc.type === "asset" ? acc.value : -acc.value),
      0
    ),
    accounts: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
      subtype: account.subtype,
      value: account.value,
      currency: account.currency,
      cost: account.cost || undefined,
      recentTransactions:
        transactions
          ?.filter((t) => t.account_id === account.id)
          // .slice(0, 5) // Only include 5 most recent transactions per account
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
  }`
    )
    .join("")}

Use this financial data and exchange rates to provide personalized advice and insights when relevant.
  Consider exchange rates when discussing amounts in different currencies.`;
};
