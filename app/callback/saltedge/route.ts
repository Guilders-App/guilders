"use server";

import { providerName, saltedge } from "@/lib/providers/saltedge/client";

import { NextRequest, NextResponse } from "next/server";
import { SaltEdgeCallbackBody } from "./types";
import { NATURE_TO_TYPE_SUBTYPE } from "./utils";

import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request: NextRequest) {
  const { data }: SaltEdgeCallbackBody = await request.json();

  if (data.stage !== "finish") {
    return NextResponse.json({ message: "Hello, World!" });
  }

  const supabase = await createAdminClient();
  const { data: provider } = await supabase
    .from("provider")
    .select()
    .eq("name", providerName)
    .single();

  if (!provider) {
    console.error("Provider not found");
    return NextResponse.json({ error: "Provider not found" }, { status: 500 });
  }

  const { data: providerConnection } = await supabase
    .from("provider_connection")
    .select()
    .eq("provider_id", provider.id)
    .eq("user_id", data.custom_fields.user_id)
    .single();

  if (!providerConnection) {
    console.error("Provider connection not found");
    return NextResponse.json(
      { error: "Provider connection not found" },
      { status: 500 }
    );
  }

  const { data: institutionConnection, error: institutionConnectionError } =
    await supabase
      .from("institution_connection")
      .upsert({
        institution_id: Number(data.custom_fields.institution_id),
        connection_id: data.connection_id,
        provider_connection_id: providerConnection.id,
      })
      .select()
      .single();

  if (institutionConnectionError) {
    console.error(
      "Error inserting institution connection:",
      institutionConnectionError
    );
    return NextResponse.json(
      { success: false, error: "Error inserting institution connection" },
      { status: 500 }
    );
  }

  const accounts = await saltedge.getAccounts(
    data.customer_id,
    data.connection_id
  );

  // TODO: Remove debug logs
  const { error: accountsError } = await supabase.from("account").upsert(
    accounts.map((account) => {
      const typeMapping = NATURE_TO_TYPE_SUBTYPE[account.nature];
      return {
        type: typeMapping.type,
        subtype: typeMapping.subtype,
        user_id: data.custom_fields.user_id,
        name: account.name,
        value: account.balance,
        currency: account.currency_code,
        institution_connection_id: institutionConnection.id,
        provider_account_id: account.id,
      };
    }),
    { onConflict: "institution_connection_id,provider_account_id" }
  );

  accounts.map(async (account) => {
    const transactions = await saltedge.getTransactions(
      data.connection_id,
      account.id
    );

    // Get the account record from the database
    const { data: dbAccount } = await supabase
      .from("account")
      .select()
      .eq("provider_account_id", account.id)
      .eq("institution_connection_id", institutionConnection.id)
      .single();

    if (!dbAccount) {
      console.error("Account not found:", account.id);
      return;
    }

    const { error: transactionsError } = await supabase
      .from("transaction")
      .upsert(
        transactions.map((transaction) => {
          return {
            date: transaction.made_on,
            amount: transaction.amount,
            currency: transaction.currency_code,
            description: transaction.description,
            category: transaction.category,
            account_id: dbAccount.id,
            provider_transaction_id: transaction.id,
          };
        }),
        { onConflict: "provider_transaction_id,account_id" }
      );

    if (transactionsError) {
      console.error("Error inserting transactions:", transactionsError);
      return NextResponse.json(
        { success: false, error: "Error inserting transactions" },
        { status: 500 }
      );
    }
  });

  if (accountsError) {
    console.error("Error inserting accounts:", accountsError);
    return NextResponse.json(
      { success: false, error: "Error inserting accounts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
