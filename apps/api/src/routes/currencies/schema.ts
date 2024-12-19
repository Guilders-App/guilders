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
  .openapi("CurrencySchema");

export const CurrenciesSchema = z
  .array(CurrencySchema)
  .openapi("CurrenciesSchema");
