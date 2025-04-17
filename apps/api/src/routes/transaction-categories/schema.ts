import { z } from "@hono/zod-openapi";

export const TransactionCategorySchema = z
  .object({
    id: z.number().openapi({
      example: 89,
    }),
    name: z.string().openapi({
      example: "fast food",
    }),
    display_name: z.string().openapi({
      example: "Fast Food",
    }),
    emoji: z.string().openapi({
      example: "🍔",
    }),
  })
  .openapi("TransactionCategory");

export const TransactionCategoriesSchema = z.array(TransactionCategorySchema);

// Export inferred types
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;
export type TransactionCategories = z.infer<typeof TransactionCategoriesSchema>;
