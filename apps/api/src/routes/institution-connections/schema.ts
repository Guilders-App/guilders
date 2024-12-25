import { z } from "@hono/zod-openapi";

// Institution schema for the nested relationship
const InstitutionSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo_url: z.string().url(),
  country: z.string().nullable(),
  demo: z.boolean(),
  enabled: z.boolean(),
  provider_id: z.number(),
  provider_institution_id: z.string(),
});

// Provider connection schema for the nested relationship
const ProviderConnectionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  provider_id: z.number(),
  secret: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const InstitutionConnectionSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    broken: z.boolean().openapi({
      example: false,
    }),
    connection_id: z.string().nullable().openapi({
      example: "conn_123456",
    }),
    created_at: z.string().openapi({
      example: "2024-01-01T00:00:00Z",
    }),
    institution_id: z.number().openapi({
      example: 1,
    }),
    provider_connection_id: z.number().nullable().openapi({
      example: 1,
    }),
    institution: InstitutionSchema,
    provider_connection: ProviderConnectionSchema.nullable(),
  })
  .openapi("InstitutionConnectionSchema");

export const InstitutionConnectionsSchema = z
  .array(InstitutionConnectionSchema)
  .openapi("InstitutionConnectionsSchema");
