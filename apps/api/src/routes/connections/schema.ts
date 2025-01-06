import { z } from "@hono/zod-openapi";

export const CreateConnectionSchema = z
  .object({
    provider_id: z.string().openapi({
      example: "1",
      description: "Provider identifier",
    }),
    institution_id: z.string().openapi({
      example: "inst_123",
      description: "Institution ID to connect to",
    }),
  })
  .openapi("CreateConnection");

export const ReconnectSchema = z
  .object({
    provider_id: z.string().openapi({
      example: "1",
      description: "Provider identifier",
    }),
    institution_id: z.string().openapi({
      example: "inst_123",
      description: "Institution ID to reconnect to",
    }),
    account_id: z.string().openapi({
      example: "acc_123",
      description: "Account ID to reconnect",
    }),
  })
  .openapi("Reconnect");

export const ConnectionResponseSchema = z
  .object({
    redirectURI: z.string().openapi({
      example: "https://connect.example.com/auth",
      description: "URI to redirect the user to complete connection",
    }),
  })
  .openapi("ConnectionResponse");

export const RegisterConnectionSchema = z
  .object({
    provider_id: z.string().openapi({
      example: "1",
      description: "Provider identifier",
    }),
  })
  .openapi("RegisterConnection");

export const RegisterResponseSchema = z
  .object({
    secret: z.string().openapi({
      example: "user_secret_123",
      description: "Provider-specific user secret",
    }),
  })
  .openapi("RegisterResponse");

export const RefreshConnectionSchema = z
  .object({
    provider_id: z.string().openapi({
      example: "1",
      description: "Provider identifier",
    }),
    connection_id: z.string().openapi({
      example: "conn_123",
      description: "Connection ID to refresh",
    }),
  })
  .openapi("RefreshConnection");

// Export inferred types
export type CreateConnection = z.infer<typeof CreateConnectionSchema>;
export type Reconnect = z.infer<typeof ReconnectSchema>;
export type ConnectionResponse = z.infer<typeof ConnectionResponseSchema>;
export type RegisterConnection = z.infer<typeof RegisterConnectionSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
