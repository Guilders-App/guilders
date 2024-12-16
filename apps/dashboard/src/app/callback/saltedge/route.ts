"use server";

import { providerName, saltedge } from "@/lib/providers/saltedge/client";
import { createClient } from "@guilders/database/server";
import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import type {
  SaltEdgeCallback,
  SaltEdgeDestroyCallback,
  SaltEdgeFailureCallback,
  SaltEdgeProviderCallback,
  SaltEdgeSuccessCallback,
} from "./types";
import { NATURE_TO_TYPE_SUBTYPE } from "./utils";

export async function POST(request: NextRequest) {
  const callback: SaltEdgeCallback = await request.json();

  // Authenticate callback
  const auth = request.headers.get("Authorization");
  const signature = request.headers.get("signature");
  const url = request.url.includes("localhost")
    ? "https://badly-mutual-pigeon.ngrok-free.app/callback/saltedge"
    : request.url;
  const callbackCredentials = Buffer.from(
    `${process.env.SALTEDGE_CALLBACK_USERNAME}:${process.env.SALTEDGE_CALLBACK_PASSWORD}`,
  ).toString("base64");

  if (!auth || auth !== `Basic ${callbackCredentials}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!signature || !verifySaltEdgeSignature(url, callback, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle provider status changes
  if ("provider_status" in callback.data) {
    return handleProviderStatusChange(callback as SaltEdgeProviderCallback);
  }

  // Handle destroy callbacks
  if (!("stage" in callback.data) && !("error_class" in callback.data)) {
    return handleConnectionDestroy(callback as SaltEdgeDestroyCallback);
  }

  // Handle failure callbacks
  if ("error_class" in callback.data) {
    return handleFailure(callback as SaltEdgeFailureCallback);
  }

  // Handle success/notify callbacks
  if (callback.data.stage === "finish") {
    return handleSuccess(callback as SaltEdgeSuccessCallback);
  }

  // For other stages, just acknowledge
  return NextResponse.json({ success: true });
}

async function handleProviderStatusChange(callback: SaltEdgeProviderCallback) {
  const { data } = callback;
  const supabase = await createClient({ admin: true });

  // Get provider
  const { data: provider, error: providerError } = await supabase
    .from("provider")
    .select()
    .eq("name", providerName)
    .single();

  if (providerError || !provider) {
    console.error("Provider not found");
    return NextResponse.json({ error: "Provider not found" }, { status: 500 });
  }

  // TODO: What to do when a provider that has connections is disabled?
  const { error: institutionError } = await supabase
    .from("institution")
    .update({
      enabled: data.provider_status === "active",
    })
    .eq("provider_id", provider.id)
    .eq("provider_institution_id", data.provider_code);

  if (institutionError) {
    console.error("Error updating institution:", institutionError);
    return NextResponse.json(
      { success: false, error: "Error updating institution" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

async function handleConnectionDestroy(callback: SaltEdgeDestroyCallback) {
  const { data } = callback;
  const supabase = await createClient({ admin: true });

  const { data: provider, error: providerError } = await supabase
    .from("provider")
    .select()
    .eq("name", providerName)
    .single();

  if (providerError || !provider) {
    console.error("Provider not found");
    return NextResponse.json({ error: "Provider not found" }, { status: 500 });
  }

  const { data: providerConnection, error: providerConnectionError } =
    await supabase
      .from("provider_connection")
      .select()
      .eq("secret", data.customer_id)
      .eq("provider_id", provider.id)
      .single();

  if (providerConnectionError || !providerConnection) {
    console.error("Provider connection not found");
    return NextResponse.json(
      { error: "Provider connection not found" },
      { status: 500 },
    );
  }

  // Delete institution connection
  // TODO: Should we also delete the provider connection if there are
  // no more institution connections for this user?
  // TODO: Maybe we should mark it as broken instead?
  const { error: institutionConnectionError } = await supabase
    .from("institution_connection")
    .delete()
    .eq("connection_id", data.connection_id)
    .eq("provider_connection_id", providerConnection.id);

  if (institutionConnectionError) {
    console.error(
      "Error deleting institution connection:",
      institutionConnectionError,
    );
    return NextResponse.json(
      { success: false, error: "Error deleting institution connection" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

async function handleFailure(callback: SaltEdgeFailureCallback) {
  // Ignored
  // TODO: Maybe remove the provider connection?
  return NextResponse.json({ success: true });
}

async function handleSuccess(callback: SaltEdgeSuccessCallback) {
  const { data } = callback;
  const supabase = await createClient({ admin: true });

  // Get provider
  const { data: provider } = await supabase
    .from("provider")
    .select()
    .eq("name", providerName)
    .single();

  if (!provider) {
    console.error("Provider not found");
    return NextResponse.json({ error: "Provider not found" }, { status: 500 });
  }

  // Get provider connection
  const { data: providerConnection, error: providerConnectionError } =
    await supabase
      .from("provider_connection")
      .select()
      .eq("provider_id", provider.id)
      .eq("user_id", data.custom_fields.user_id)
      .single();

  if (providerConnectionError || !providerConnection) {
    console.error("Provider connection not found");
    return NextResponse.json(
      { error: "Provider connection not found" },
      { status: 500 },
    );
  }

  // Upsert institution connection
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
      institutionConnectionError,
    );
    return NextResponse.json(
      { success: false, error: "Error inserting institution connection" },
      { status: 500 },
    );
  }

  // Get and process accounts
  const accounts = await saltedge.getAccounts(
    data.customer_id,
    data.connection_id,
  );

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
    { onConflict: "institution_connection_id,provider_account_id" },
  );

  // Process transactions for each account
  await Promise.all(
    accounts.map(async (account) => {
      const transactions = await saltedge.getTransactions(
        data.connection_id,
        account.id,
      );

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
          transactions.map((transaction) => ({
            date: transaction.made_on,
            amount: transaction.amount,
            currency: transaction.currency_code,
            description: transaction.description,
            category: transaction.category,
            account_id: dbAccount.id,
            provider_transaction_id: transaction.id,
          })),
          { onConflict: "provider_transaction_id,account_id" },
        );

      if (transactionsError) {
        console.error("Error inserting transactions:", transactionsError);
        throw transactionsError;
      }
    }),
  );

  if (accountsError) {
    console.error("Error inserting accounts:", accountsError);
    return NextResponse.json(
      { success: false, error: "Error inserting accounts" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

function verifySaltEdgeSignature(
  url: string,
  body: unknown,
  signature: string,
) {
  const publicKey = process.env.SALTEDGE_CALLBACK_SIGNATURE;
  const dataToVerify = `${url}|${JSON.stringify(body)}`;
  const verifier = crypto.createVerify("SHA256");
  verifier.update(dataToVerify);

  if (!publicKey) {
    throw new Error("SALTEDGE_CALLBACK_SIGNATURE is not set");
  }

  try {
    // Verify the signature
    const signatureBuffer = Buffer.from(signature, "base64");
    const isValid = verifier.verify(publicKey, signatureBuffer);
    return isValid;
  } catch (error) {
    console.error("Verification error:", error);
    return false;
  }
}
