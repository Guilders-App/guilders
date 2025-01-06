import { z } from "@hono/zod-openapi";

export const CurrencySchema = z
  .object({
    code: z.string().length(3).openapi({
      example: "USD",
    }),
    name: z.string().openapi({
      example: "United States Dollar",
    }),
    country: z.string().openapi({
      example: "United States",
    }),
  })
  .openapi("Currency");

export const CurrenciesSchema = z.array(CurrencySchema);

// Export inferred types
export type Currency = z.infer<typeof CurrencySchema>;
export type Currencies = z.infer<typeof CurrenciesSchema>;
