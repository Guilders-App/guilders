import { z } from "@hono/zod-openapi";

export const ProviderConnectionSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    user_id: z.string().openapi({
      example: "user_123456",
    }),
    provider_id: z.number().openapi({
      example: 1,
    }),
    secret: z.string().nullable().openapi({
      example: "secret_123456",
    }),
    created_at: z.string().openapi({
      example: "2024-01-01T00:00:00Z",
    }),
    updated_at: z.string().openapi({
      example: "2024-01-01T00:00:00Z",
    }),
  })
  .openapi("ProviderConnection");

export const ProviderConnectionsSchema = z.array(ProviderConnectionSchema);

// Export inferred types
export type ProviderConnection = z.infer<typeof ProviderConnectionSchema>;
export type ProviderConnections = z.infer<typeof ProviderConnectionsSchema>;
