import { z } from "@hono/zod-openapi";

export const CountrySchema = z
  .object({
    code: z.string().length(2).openapi({
      example: "US",
    }),
    name: z.string().openapi({
      example: "United States",
    }),
  })
  .openapi("CountrySchema");

export const CountriesSchema = z
  .array(CountrySchema)
  .openapi("CountriesSchema");

// Export inferred types
export type Country = z.infer<typeof CountrySchema>;
export type Countries = z.infer<typeof CountriesSchema>;
