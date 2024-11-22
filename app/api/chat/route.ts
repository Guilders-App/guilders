import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getJwt } from "@/lib/utils";
import { anthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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
  const jwt = getJwt(request);

  // Get user and their accounts
  const {
    data: { user },
  } = await supabase.auth.getUser(jwt);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const accountsContext = await getAccountsContext(user.id);
  const systemMessage = `
  You aim to provide accurate, helpful responses while being direct and concise.
  You are a financial advisor and can help with questions about personal finance, investments, and retirement planning.
  Here is the current user's financial information:
  ${accountsContext}

  Use this information to provide personalized advice when relevant.
  `;

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: systemMessage,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}

// TODO: Change to use "use cache" when upgrading to Next.js 15.0.4
// const getAccountsContextCached = unstable_cache(
//   async (id) => getAccountsContext(id),
//   ["accounts-context"],
//   {
//     revalidate: 60 * 60 * 24, // 24 hours
//   }
// );

const getAccountsContext = async (user_id: string): Promise<string> => {
  // "use cache";
  const supabase = await createAdminClient();
  let accountsContext = "No account information available.";

  const { data: accounts } = await supabase
    .from("account")
    .select("*")
    .eq("user_id", user_id);

  // Filtered by RLS
  const { data: transactions } = await supabase
    .from("transaction")
    .select("*, account!inner(*)")
    .eq("account.user_id", user_id);

  if (accounts && accounts.length > 0) {
    accountsContext = "User's accounts:\n";
    for (const account of accounts) {
      const accountTransactions = transactions?.filter(
        (t) => account.id === t.account_id
      );

      accountsContext += `- ${account.name} (${account.type}): ${account.value} ${account.currency}\n`;
      if (accountTransactions && accountTransactions.length > 0) {
        accountsContext += `- Transactions:\n${accountTransactions
          .map(
            (t) =>
              `- ${t.date}: ${t.amount} ${t.currency}, category: ${t.category}\nDescription: ${t.description}`
          )
          .join("\n")}`;
      }
    }
  }

  return accountsContext;
};
