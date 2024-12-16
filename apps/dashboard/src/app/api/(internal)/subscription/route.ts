import { createAdminClient } from "@/apps/web/lib/db/admin";
import { createClient } from "@/apps/web/lib/db/server";
import { stripe } from "@/apps/web/lib/stripe/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createAdminClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has an active subscription
    const { data: subscription } = await supabase
      .from("subscription")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (subscription && subscription.status === "active") {
      return NextResponse.json(
        { success: false, error: "User already has an active subscription" },
        { status: 400 }
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
    } else {
      await stripe.customers.update(customerId, {
        metadata: {
          user_id: user.id,
        },
      });
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
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Failed to create subscription entry", upsertError);
      return NextResponse.json(
        { success: false, error: "Failed to create subscription entry" },
        { status: 500 }
      );
    }

    const headers = req.headers;
    const origin = headers.get("origin") || "http://localhost:3000";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_update: {
        address: "auto",
        name: "auto",
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
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
      metadata: {
        user_id: user.id,
      },
      payment_method_collection: "if_required",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
};
