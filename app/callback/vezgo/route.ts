import { createAdminClient } from "@/lib/db/admin";
import { VezgoCallbackBody } from "./types";

import { providerName } from "@/lib/providers/vezgo/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body: VezgoCallbackBody = await request.json();

  // TODO: Remove this after testing
  console.log(body);
  console.log(request.body);
  console.log(request.headers);

  if (body.hook === "SyncError") {
    return NextResponse.json({ success: true });
  }

  const supabase = await createAdminClient();

  const { data: provider } = await supabase
    .from("provider")
    .select("*")
    .eq("name", providerName)
    .single();

  if (!provider) {
    console.error("Provider not found");
    return NextResponse.json({ error: "Provider not found" }, { status: 500 });
  }

  const { data: institution } = await supabase
    .from("institution")
    .select()
    .eq("provider_id", provider.id)
    .eq("provider_institution_id", body.account.provider)
    .single();

  if (!institution) {
    console.error("Institution not found");
    return NextResponse.json(
      { error: "Institution not found" },
      { status: 500 }
    );
  }

  const { data: provider_connection } = await supabase
    .from("provider_connection")
    .upsert({
      user_id: body.user.loginName,
      provider_id: provider.id,
      secret: body.user.id,
    })
    .select()
    .single();

  if (!provider_connection) {
    console.error("Provider connection not found");
    return NextResponse.json(
      { error: "Provider connection not found" },
      { status: 500 }
    );
  }

  const { error } = await supabase.from("institution_connection").upsert({
    institution_id: institution.id,
    provider_connection_id: provider_connection.id,
    connection_id: body.account.id,
  });

  if (error) {
    console.error("Error inserting institution connection:", error);
    return NextResponse.json(
      { error: "Error inserting institution connection" },
      { status: 500 }
    );
  }

  // const connection = await vezgo.reconnect(body.account.id);
  // const accounts = await connection.accounts.getList();

  // console.log("Vezgo Accounts: ", accounts);

  // const { data: account, error } = await supabase
  //   .from("account")
  //   .upsert(
  //     accounts.map((account) => ({
  //       type: "asset",
  //       subtype: "brokerage",
  //       user_id: body.user.loginName,
  //       name: account.id,
  //       value: account.balances,
  //       currency: account.balance.total?.currency?.toUpperCase() ?? "USD",
  //       institution_connection_id: institution.id,
  //       provider_account_id: account.id,
  //     })),
  //     { onConflict: "institution_connection_id,provider_account_id" }
  //   )
  //   .select();

  return NextResponse.json({ success: true });
}
