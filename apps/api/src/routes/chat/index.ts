import { ErrorSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import type { Account, Document } from "@/types";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { DatabaseClient } from "@guilders/database/types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  type CoreMessage,
  type ImagePart,
  convertToCoreMessages,
  streamText,
} from "ai";
import { stream } from "hono/streaming";
import { ChatRequestSchema, type FinancialSummary } from "./schema";

const app = new OpenAPIHono<{
  Variables: Variables;
  Bindings: Bindings;
}>().openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Chat"],
    summary: "Chat with the AI financial advisor",
    security: [{ Bearer: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: ChatRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Successfully streamed chat response",
        content: {
          "text/event-stream": {
            schema: z.any(),
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      403: {
        description: "Forbidden - Requires subscription",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
      500: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const supabase = c.get("supabase");
    const user = c.get("user");

    // Check subscription status
    const { data: subscription } = await supabase
      .from("subscription")
      .select("status")
      .eq("user_id", user.id)
      .single();

    const allowPremiumFeatures = c.env.ALLOW_PREMIUM_FEATURES === "true";

    const isSubscribed =
      subscription?.status === "active" ||
      subscription?.status === "trialing" ||
      allowPremiumFeatures;

    if (!isSubscribed) {
      return c.json(
        {
          data: null,
          error:
            "This feature requires a Pro subscription. Please upgrade to continue.",
        },
        403,
      );
    }

    try {
      const { messages } = await c.req.json();

      const accountsContext = await getAccountsContext(user.id, supabase);

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

      const anthropic = createAnthropic({
        apiKey: c.env.ANTHROPIC_API_KEY,
      });

      const result = streamText({
        model: anthropic("claude-3-7-sonnet-20250219"),
        system: accountsContext.text,
        messages: [...imageMessages, ...convertToCoreMessages(messages)],
        onError(error) {
          console.error(error);
        },
      });

      c.header("x-vercel-ai-data-stream", "v1");
      c.header("content-type", "text/plain; charset=utf-8");
      c.header("content-encoding", "identity");
      c.header("transfer-encoding", "chunked");

      return stream(c, async (stream) => {
        await stream.pipe(result.toDataStream());
      });
    } catch (error) {
      console.error(error);
      return c.json(
        {
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
        500,
      );
    }
  },
);

interface AccountsContext {
  text: string;
  images: string[];
}

const getAccountsContext = async (
  userId: string,
  supabase: DatabaseClient,
): Promise<AccountsContext> => {
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

  // Calculate net worth safely
  const calculateNetWorth = (accounts: Account[]): number => {
    return accounts.reduce((sum: number, acc: Account) => {
      return sum + (acc.type === "asset" ? acc.value : -acc.value);
    }, 0);
  };

  // Create structured financial summary
  const summary: FinancialSummary = {
    netWorth: calculateNetWorth(allAccounts || []),
    accounts: allAccounts || [],
    transactions: transactions || [],
    documents: documents || [],
    exchangeRates: exchangeRates || [],
    primaryCurrency: userSettings?.currency || "EUR",
  };

  const prompt = generatePrompt(summary);

  return {
    text: prompt,
    images: Array.from(documentUrls.values()),
  };
};

const generatePrompt = (summary: FinancialSummary): string => {
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
      (d: Document) => `
• ${d.name} (${d.entity_type} ID: ${d.entity_id})`,
    )
    .join("")}

I have access to documents and receipts for some accounts and transactions.
I'll reference these when relevant to our discussion.
Documents can be referenced by their name, and I can associate them with the correct account or transaction using their entity information.

Use this financial data, documents, and exchange rates to provide personalized advice and insights when relevant.
Consider exchange rates when discussing amounts in different currencies.`;
};

export default app;
