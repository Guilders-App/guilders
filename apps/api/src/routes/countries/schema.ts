import { z } from "@hono/zod-openapi";

export const CountrySchema = z
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
  .openapi("CountrySchema");

export const CountriesSchema = z
  .array(CountrySchema)
  .openapi("CountriesSchema");
