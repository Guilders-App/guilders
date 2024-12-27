import { z } from "@hono/zod-openapi";

// Define subscription status enum from database types
const SubscriptionStatusEnum = z.enum([
  "unsubscribed",
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
  "paused",
]);

const UserSettingsSchema = z
  .object({
    currency: z.string(),
    api_key: z.string().nullable(),
    profile_url: z.string().nullable(),
  })
  .openapi("UserSettings");

const UserSubscriptionSchema = z
  .object({
    status: SubscriptionStatusEnum.nullable(),
  })
  .openapi("UserSubscription");

export const UserSchema = z
  .object({
    email: z.string().email(),
    settings: UserSettingsSchema,
    subscription: UserSubscriptionSchema,
  })
  .openapi("User");

export const UpdateUserSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    settings: z
      .object({
        currency: z.string().optional(),
        api_key: z.string().nullable().optional(),
      })
      .optional(),
  })
  .openapi("UpdateUser");

export const DeleteResponseSchema = z.object({}).openapi("DeleteResponse");

// Export inferred types
export type User = z.infer<typeof UserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
