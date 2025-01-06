import { z } from "@hono/zod-openapi";

const BaseAccountSchema = z
  .object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: "Checking Account" }),
    type: z.enum(["asset", "liability"]).openapi({ example: "asset" }),
    subtype: z.string().openapi({ example: "checking" }),
    value: z.number().openapi({ example: 1000.5 }),
    currency: z.string().length(3).openapi({ example: "USD" }),
    user_id: z.string().openapi({ example: "user_123" }),
    parent: z.number().nullish().openapi({ example: null }),
    documents: z
      .array(z.string())
      .nullish()
      .openapi({ example: ["path/to/document.pdf"] }),
    institution_connection_id: z.number().nullish().openapi({ example: null }),
    cost: z.number().nullish().openapi({ example: null }),
    created_at: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
    image: z.string().nullish().openapi({ example: null }),
    investable: z
      .enum(["non_investable", "investable_easy_convert", "investable_cash"])
      .default("investable_cash")
      .openapi({ example: "investable_cash" }),
    notes: z.string().default("").openapi({ example: "" }),
    provider_account_id: z.string().nullish().openapi({ example: null }),
    tax_rate: z.number().default(0).nullish().openapi({ example: null }),
    taxability: z
      .enum(["taxable", "tax_free", "tax_deferred"])
      .default("tax_free")
      .openapi({ example: "taxable" }),
    ticker: z.string().nullish().openapi({ example: null }),
    units: z.number().nullish().openapi({ example: null }),
    updated_at: z.string().openapi({ example: "2024-01-01T00:00:00Z" }),
    institution_connection: z
      .object({
        broken: z.boolean(),
        institution: z.object({
          name: z.string(),
          logo_url: z.string(),
        }),
        provider: z
          .object({
            id: z.number(),
            name: z.string(),
          })
          .optional(),
      })
      .nullish(),
  })
  .openapi("BaseAccount");

export const AccountSchema = BaseAccountSchema.extend({
  children: z.array(BaseAccountSchema).default([]).optional(),
}).openapi("Account");

export const AccountsSchema = z.array(AccountSchema);

export const CreateAccountSchema = AccountSchema.omit({
  id: true,
  user_id: true,
  documents: true,
  children: true,
  institution_connection: true,
  institution_connection_id: true,
  created_at: true,
  updated_at: true,
})
  .partial({
    cost: true,
    image: true,
    investable: true,
    notes: true,
    provider_account_id: true,
    tax_rate: true,
    taxability: true,
    ticker: true,
    units: true,
    parent: true,
  })
  .required({
    type: true,
    name: true,
    subtype: true,
    value: true,
    currency: true,
  })
  .openapi("CreateAccount");

export const UpdateAccountSchema = AccountSchema.omit({
  id: true,
  user_id: true,
  children: true,
  institution_connection: true,
})
  .partial()
  .openapi("UpdateAccount");

export type Account = z.infer<typeof AccountSchema>;
export type Accounts = z.infer<typeof AccountsSchema>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
