import { z } from "@hono/zod-openapi";

export const RateSchema = z
  .object({
    currency_code: z.string().length(3).openapi({
      example: "EUR",
    }),
    rate: z.number().openapi({
      example: 0.92,
    }),
  })
  .openapi("Rate");

export const RatesSchema = z.array(RateSchema);

// Export inferred types
export type Rate = z.infer<typeof RateSchema>;
export type Rates = z.infer<typeof RatesSchema>;
