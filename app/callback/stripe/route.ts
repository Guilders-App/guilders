import { createAdminClient } from "@/lib/db/admin";
import { stripe } from "@/lib/stripe/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headers = await req.headers;
  const signature = headers.get("stripe-signature");

  console.log("Webhook received");
  console.log(body);

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const supabase = await createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.metadata?.user_id) {
          await supabase.from("subscription").upsert({
            user_id: session.metadata.user_id,
            stripe_customer_id: session.customer as string,
            status: "active",
            current_period_start: new Date(
              session.created * 1000
            ).toISOString(),
            current_period_end: new Date(
              (session.created + 30 * 24 * 60 * 60) * 1000
            ).toISOString(),
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );

          await supabase.from("subscription").upsert({
            stripe_customer_id: invoice.customer as string,
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase.from("subscription").upsert({
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
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        });
        break;
      }

      case "customer.subscription.paused": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase.from("subscription").upsert({
          stripe_customer_id: subscription.customer as string,
          status: "paused",
        });
        break;
      }

      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase.from("subscription").upsert({
          stripe_customer_id: subscription.customer as string,
          status: "active",
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase.from("subscription").upsert({
          stripe_customer_id: subscription.customer as string,
          status: "canceled",
          canceled_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
        });
        break;
      }
      case "customer.deleted": {
        const customer = event.data.object as Stripe.Customer;
        await supabase
          .from("subscription")
          .delete()
          .eq("stripe_customer_id", customer.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
