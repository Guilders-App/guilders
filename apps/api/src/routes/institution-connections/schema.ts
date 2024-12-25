import { z } from "@hono/zod-openapi";
import { InstitutionSchema } from "../institutions/schema";
import { ProviderConnectionSchema } from "../provider-connections/schema";

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
  .openapi("InstitutionConnection");

export const InstitutionConnectionsSchema = z.array(
  InstitutionConnectionSchema,
);

// Export inferred types
export type Institution = z.infer<typeof InstitutionSchema>;
export type ProviderConnection = z.infer<typeof ProviderConnectionSchema>;
export type InstitutionConnection = z.infer<typeof InstitutionConnectionSchema>;
export type InstitutionConnections = z.infer<
  typeof InstitutionConnectionsSchema
>;
