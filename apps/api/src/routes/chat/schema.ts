import { z } from "@hono/zod-openapi";
import { AccountSchema } from "../accounts/schema";
import { DocumentSchema } from "../documents/schema";
import { RateSchema } from "../rates/schema";
import { TransactionSchema } from "../transactions/schema";

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const MessagesSchema = z.array(MessageSchema);

export const ChatRequestSchema = z.object({
  messages: MessagesSchema,
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type Message = z.infer<typeof MessageSchema>;

export const FinancialSummarySchema = z.object({
  netWorth: z.number(),
  accounts: z.array(AccountSchema),
  transactions: z.array(TransactionSchema),
  documents: z.array(DocumentSchema),
  exchangeRates: z.array(RateSchema),
  primaryCurrency: z.string(),
});

export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;
