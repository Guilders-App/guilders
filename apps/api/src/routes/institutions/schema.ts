import { z } from "@hono/zod-openapi";

export const InstitutionSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    name: z.string().openapi({
      example: "Demo Bank",
    }),
    country: z.string().nullable().openapi({
      example: "US",
    }),
    demo: z.boolean().default(false).openapi({
      example: false,
    }),
    enabled: z.boolean().default(true).openapi({
      example: true,
    }),
    logo_url: z.string().url().openapi({
      example: "https://example.com/logo.png",
    }),
    provider_id: z.number().openapi({
      example: 1,
    }),
    provider_institution_id: z.string().openapi({
      example: "ins_123456",
    }),
  })
  .openapi("InstitutionSchema");

export const InstitutionsSchema = z
  .array(InstitutionSchema)
  .openapi("InstitutionsSchema");
