import { createClient } from "@/lib/supabase/server";
import { AccountInsert } from "@/lib/supabase/types";
import { ExchangeRateResponse } from "../exchange-rates/[slug]/route";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const baseUrl = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000";

    const { name, subtype, value, currency }: AccountInsert =
      await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch the exchange rate
    const exchangeRateResponse = await fetch(
      `${baseUrl}/api/exchange-rates/${currency.toUpperCase()}`
    );
    if (!exchangeRateResponse.ok) {
      throw new Error(`HTTP error! status: ${exchangeRateResponse.status}`);
    }
    const exchangeRateData =
      (await exchangeRateResponse.json()) as ExchangeRateResponse;
    const exchangeRate = exchangeRateData.rates[currency.toUpperCase()];

    const { data: newAccount, error } = await supabase
      .from("account")
      .insert({
        name,
        subtype,
        value,
        currency,
        type:
          subtype === "creditcard" || subtype === "loan"
            ? "liability"
            : "asset",
        user_id: user.id,
        exchange_rate: exchangeRate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { success: false, error: "Error adding account" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, account: newAccount });
  } catch (error) {
    console.error("Error adding account:", error);
    return Response.json(
      { success: false, error: "Error adding account" },
      { status: 500 }
    );
  }
}

export async function GET(_: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch all accounts for the user
    const { data: accounts, error } = await supabase
      .from("account")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { success: false, error: "Error fetching accounts" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return Response.json(
      { success: false, error: "Error fetching accounts" },
      { status: 500 }
    );
  }
}
