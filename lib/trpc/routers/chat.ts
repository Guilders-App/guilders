import { createAdminClient } from "@/lib/db/admin";
import { anthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";
import { protectedProcedure, router } from "../server";

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
}

const getAccountsContext = async (user_id: string): Promise<string> => {
  const supabase = await createAdminClient();

  const { data: accounts } = await supabase
    .from("account")
    .select("*")
    .eq("user_id", user_id);

  const { data: transactions } = await supabase
    .from("transaction")
    .select("*, account!inner(*)")
    .eq("account.user_id", user_id)
    .order("date", { ascending: false })
    .limit(50);

  if (!accounts || accounts.length === 0) {
    return "No financial information available.";
  }

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
          .slice(0, 5)
          .map((t) => ({
            date: t.date,
            amount: t.amount,
            category: t.category,
            description: t.description,
          })) || [],
    })),
    primaryCurrency: accounts[0]?.currency || "USD",
  };

  return `
Financial Overview:
- Net Worth: ${summary.netWorth} ${summary.primaryCurrency}
- Number of Accounts: ${summary.accounts.length}

Account Details:
${summary.accounts
  .map(
    (acc) => `
• ${acc.name} (${acc.type}/${acc.subtype})
  - Value: ${acc.value} ${acc.currency}
  ${acc.cost ? `  - Cost Basis: ${acc.cost} ${acc.currency}` : ""}
  ${
    acc.recentTransactions.length > 0
      ? `
  Recent Activity:
  ${acc.recentTransactions
    .map((t) => `  - ${t.date}: ${t.amount} ${acc.currency} (${t.category})`)
    .join("\n")}`
      : ""
  }
`
  )
  .join("")}

Use this financial data to provide personalized advice and insights when relevant.
`;
};

export const chatRouter = router({
  chat: protectedProcedure
    .input(
      z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input: messages }) => {
      const accountsContext = await getAccountsContext(ctx.user.id);
      const systemMessage = `
      You are a knowledgeable financial advisor with access to the user's current financial data.
      Provide accurate, actionable advice while being direct and concise.
      Focus on personal finance, investments, and retirement planning.

      ${accountsContext}

      When discussing amounts, always specify the currency but used the symbol where applicable.
      Base your advice on the user's actual financial situation as shown in their data.
      If asked about topics outside of the provided financial data, make that clear in your response.
      `;

      const stream = await streamText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        system: systemMessage,
        messages: convertToCoreMessages(messages),
      });

      return stream;
    }),
});
