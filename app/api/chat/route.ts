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
  let accountsContext = "No account information available.";

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const { data: accounts } = await supabase
    .from("account")
    .select("*")
    .eq("user_id", user.id);

  if (accounts && accounts.length > 0) {
    accountsContext = `User's accounts:\n${accounts
      .map((acc) => `- ${acc.name} (${acc.type}): ${acc.value} ${acc.currency}`)
      .join("\n")}`;
  }

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
