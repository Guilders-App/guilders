import { z } from "@hono/zod-openapi";

export const ProviderSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    name: z.string().openapi({
      example: "Plaid",
    }),
    logo_url: z.string().openapi({
      example: "https://example.com/logo.png",
    }),
  })
  .openapi("Provider");

export const ProvidersSchema = z.array(ProviderSchema);

// Export inferred types
export type Provider = z.infer<typeof ProviderSchema>;
export type Providers = z.infer<typeof ProvidersSchema>;
