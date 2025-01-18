import { z } from "@hono/zod-openapi";

export const SubscriptionSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    user_id: z.string().openapi({
      example: "user_123",
    }),
    stripe_customer_id: z.string().openapi({
      example: "cus_123",
    }),
    status: z
      .enum([
        "unsubscribed",
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
        "paused",
      ])
      .nullable()
      .openapi({
        example: "active",
      }),
    created_at: z.string().openapi({
      example: "2024-03-14T12:00:00.000Z",
    }),
    current_period_start: z.string().openapi({
      example: "2024-03-14T12:00:00.000Z",
    }),
    current_period_end: z.string().openapi({
      example: "2024-04-14T12:00:00.000Z",
    }),
    trial_start: z.string().nullable().openapi({
      example: "2024-03-14T12:00:00.000Z",
    }),
    trial_end: z.string().nullable().openapi({
      example: "2024-03-28T12:00:00.000Z",
    }),
    cancel_at: z.string().nullable().openapi({
      example: "2024-04-14T12:00:00.000Z",
    }),
    canceled_at: z.string().nullable().openapi({
      example: "2024-03-14T12:00:00.000Z",
    }),
    ended_at: z.string().nullable().openapi({
      example: "2024-04-14T12:00:00.000Z",
    }),
    cancel_at_period_end: z.boolean().nullable().openapi({
      example: false,
    }),
  })
  .openapi("Subscription");

export const PortalResponseSchema = z
  .object({
    url: z.string().openapi({
      example: "https://billing.stripe.com/session/xyz",
    }),
  })
  .openapi("PortalResponse");

export const CheckoutResponseSchema = PortalResponseSchema;

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type PortalResponse = z.infer<typeof PortalResponseSchema>;
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
