import { createClient } from "@/lib/supabase/server";
import { anthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const supabase = await createClient();

  // Get user and their accounts
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let accountsContext = "No account information available.";

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not authenticated" },
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

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20241022"),
    system: systemMessage,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
