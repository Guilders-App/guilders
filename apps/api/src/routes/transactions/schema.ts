import { z } from "@hono/zod-openapi";

export const TransactionSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    account_id: z.number().openapi({
      example: 1,
    }),
    amount: z.number().openapi({
      example: 100.5,
    }),
    category: z.string().openapi({
      example: "Food",
    }),
    currency: z.string().openapi({
      example: "USD",
    }),
    date: z.string().openapi({
      example: "2024-01-01T00:00:00Z",
    }),
    description: z.string().openapi({
      example: "Grocery shopping",
    }),
    documents: z
      .array(z.string())
      .nullable()
      .openapi({
        example: ["path/to/document.pdf"],
      }),
    provider_transaction_id: z.string().nullable().openapi({
      example: "tx_123456",
    }),
  })
  .openapi("Transaction");

export const TransactionsSchema = z.array(TransactionSchema);
export const CreateTransactionSchema = TransactionSchema.omit({
  id: true,
  documents: true,
  provider_transaction_id: true,
}).openapi("CreateTransaction");

// Export inferred types
export type Transaction = z.infer<typeof TransactionSchema>;
export type Transactions = z.infer<typeof TransactionsSchema>;
export type TransactionInsert = z.infer<typeof CreateTransactionSchema>;
