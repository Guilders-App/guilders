import type { Bindings } from "@/common/variables";
import { getEnv } from "@/env";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@guilders/database/server";
import { Hono } from "hono";
import type Stripe from "stripe";

const app = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("stripe-signature");
  const env = getEnv(c.env);
  const stripe = getStripe(env);

  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    console.log("Missing stripe signature");
    return c.json({ error: "Missing stripe signature" }, 400);
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Webhook Error:", err);
    return c.json({ error: `Webhook Error: ${(err as Error).message}` }, 400);
  }

  const supabase = await createClient({
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    admin: true,
    ssr: false,
  });

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        if (!subscription.metadata.user_id) {
          console.log("Missing user_id in metadata");
          return c.json({ error: "Missing user_id in metadata" }, 400);
        }

        const { error } = await supabase.from("subscription").upsert(
          {
            user_id: subscription.metadata.user_id,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status,
            cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            trial_start: subscription.trial_start
              ? new Date(subscription.trial_start * 1000).toISOString()
              : null,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
          },
          { onConflict: "user_id" },
        );
        if (error) {
          console.log("Error upserting subscription:", error);
          throw error;
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { error } = await supabase
          .from("subscription")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer as string);
        if (error) {
          console.log("Error updating subscription:", error);
          throw error;
        }
        break;
      }
      case "customer.deleted": {
        const customer = event.data.object as Stripe.Customer;
        const { error } = await supabase
          .from("subscription")
          .delete()
          .eq("stripe_customer_id", customer.id);
        if (error) {
          console.log("Error deleting subscription:", error);
          throw error;
        }
        break;
      }
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

export default app;
