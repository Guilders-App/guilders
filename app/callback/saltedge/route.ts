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
  console.log("Accounts:", accounts);
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
        account_id: account.id,
      };
    }),
    { onConflict: "institution_connection_id,account_id" }
  );

  if (accountsError) {
    console.error("Error inserting accounts:", accountsError);
    return NextResponse.json(
      { success: false, error: "Error inserting accounts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
