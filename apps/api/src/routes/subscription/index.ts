import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { getEnv } from "@/env";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@guilders/database/server";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CheckoutResponseSchema, PortalResponseSchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables; Bindings: Bindings }>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Subscription"],
      summary: "Create a subscription checkout session",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "Checkout session created successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(CheckoutResponseSchema),
            },
          },
        },
        400: {
          description: "User already has an active subscription",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const env = getEnv(c.env);
        const supabaseAdmin = await createClient({
          url: env.SUPABASE_URL,
          key: env.SUPABASE_SERVICE_ROLE_KEY,
          ssr: false,
        });
        const stripe = getStripe(env);

        // Check if user already has an active subscription
        const { data: subscription } = await supabase
          .from("subscription")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (
          subscription?.status &&
          ["active", "trialing"].includes(subscription.status)
        ) {
          return c.json(
            {
              data: null,
              error: "User already has an active subscription",
            },
            400,
          );
        }

        let customerId = subscription?.stripe_customer_id;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              user_id: user.id,
            },
          });
          customerId = customer.id;
        }

        const { error: upsertError } = await supabaseAdmin
          .from("subscription")
          .upsert(
            {
              user_id: user.id,
              stripe_customer_id: customerId,
              status: "incomplete",
            },
            {
              onConflict: "user_id",
            },
          )
          .select()
          .single();

        if (upsertError) {
          console.error("Failed to create subscription entry", upsertError);
          return c.json(
            {
              data: null,
              error: "Failed to create subscription entry",
            },
            500,
          );
        }

        const origin = c.req.header("origin") || "http://localhost:3001";

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          customer_update: {
            address: "auto",
            name: "auto",
          },
          line_items: [
            {
              price: env.STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${origin}/settings/subscription?success=true`,
          cancel_url: `${origin}/settings/subscription?canceled=true`,
          automatic_tax: { enabled: true },
          subscription_data: {
            trial_settings: {
              end_behavior: { missing_payment_method: "cancel" },
            },
            trial_period_days: 14,
            metadata: {
              user_id: user.id,
            },
          },
          payment_method_collection: "if_required",
          metadata: {
            user_id: user.id,
          },
        });

        if (!session.url) {
          return c.json(
            { data: null, error: "Failed to create checkout session" },
            500,
          );
        }

        return c.json({ data: { url: session.url }, error: null }, 200);
      } catch (error) {
        console.error("Subscription error:", error);
        return c.json({ data: null, error: (error as Error).message }, 500);
      }
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/portal",
      tags: ["Subscription"],
      summary: "Create a billing portal session",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "Portal session created successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(PortalResponseSchema),
            },
          },
        },
        404: {
          description: "No subscription found",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const stripe = getStripe(c.env);

        const { data: subscription } = await supabase
          .from("subscription")
          .select("stripe_customer_id")
          .eq("user_id", user.id)
          .single();

        if (!subscription?.stripe_customer_id) {
          return c.json({ data: null, error: "No subscription found" }, 404);
        }

        const origin = c.req.header("origin") || "http://localhost:3001";

        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.stripe_customer_id,
          return_url: `${origin}/settings/subscription`,
        });

        if (!session.url) {
          return c.json(
            { data: null, error: "Failed to create portal session" },
            500,
          );
        }

        return c.json({ data: { url: session.url }, error: null }, 200);
      } catch (error) {
        return c.json({ data: null, error: (error as Error).message }, 500);
      }
    },
  );

export default app;
