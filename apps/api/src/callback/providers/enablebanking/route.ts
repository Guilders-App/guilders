import type { Bindings } from "@/common/variables";
import { getEnv } from "@/env";
import { getProvider } from "@/providers";
import { EnableBankingClient } from "@/providers/enablebanking/client";
import type { ConnectionState } from "@/providers/enablebanking/types";
import { createClient } from "@guilders/database/server";
import { Hono } from "hono";
import { errorResponse, successResponse } from "./template";

const app = new Hono<{ Bindings: Bindings }>().get("/", async (c) => {
  const env = getEnv(c.env);
  const { code, state } = await c.req.query();

  if (!code || !state) {
    console.error("Missing required parameters: code or state");
    return errorResponse("Missing required parameters. Please try again.");
  }

  const stateObj: ConnectionState = JSON.parse(state);

  if (!stateObj.userId || !stateObj.institutionId) {
    console.error("Missing required state parameters: userId or institutionId");
    return errorResponse("Invalid connection state. Please try again.");
  }

  const supabase = await createClient({
    admin: true,
    ssr: false,
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
  });

  const provider = await getProvider("EnableBanking", supabase, env);

  const { data: providerDb, error: providerDbError } = await supabase
    .from("provider")
    .select("id")
    .eq("name", provider.name)
    .single();

  if (providerDbError) {
    console.error("Provider not found:", providerDbError);
    return errorResponse(
      "Provider configuration error. Please try again later.",
    );
  }

  const { data: providerConnection, error: providerConnectionError } =
    await supabase
      .from("provider_connection")
      .upsert(
        {
          provider_id: providerDb.id,
          user_id: stateObj.userId,
          secret: code,
        },
        {
          onConflict: "provider_id,user_id",
        },
      )
      .select("id")
      .single();

  if (providerConnectionError) {
    console.error(
      "Failed to create provider connection:",
      providerConnectionError,
    );
    return errorResponse("Failed to establish connection. Please try again.");
  }

  try {
    const enablebankingClient = new EnableBankingClient(
      env.ENABLEBANKING_CLIENT_ID,
      env.ENABLEBANKING_CLIENT_PRIVATE_KEY,
    );

    const session = await enablebankingClient.authorizeSession({
      code,
    });

    const { data: connection, error: connectionError } = await supabase
      .from("institution_connection")
      .insert({
        institution_id: Number(stateObj.institutionId),
        provider_connection_id: providerConnection.id,
        connection_id: session.session_id,
      })
      .select("id")
      .single();

    if (connectionError) {
      console.error(
        "Failed to create institution connection:",
        connectionError,
      );
      return errorResponse(
        "Failed to establish bank connection. Please try again.",
      );
    }

    const accounts = await provider.getAccounts({
      userId: stateObj.userId,
      connectionId: connection.id,
    });

    const { error: accountsInsertError } = await supabase
      .from("account")
      .insert(accounts)
      .select();

    if (accountsInsertError) {
      console.error("Failed to create accounts:", accountsInsertError);
      return errorResponse("Failed to import accounts. Please try again.");
    }

    for (const account of accounts) {
      if (!account.provider_account_id) {
        console.error("Account missing provider_account_id:", account);
        continue;
      }

      const transactions = await provider.getTransactions({
        userId: stateObj.userId,
        accountId: account.provider_account_id,
      });

      const { error: transactionsInsertError } = await supabase
        .from("transaction")
        .insert(transactions)
        .select();

      if (transactionsInsertError) {
        console.error(
          "Failed to create transactions for account:",
          account.provider_account_id,
          transactionsInsertError,
        );
      }
    }

    return successResponse("Successfully connected your bank account!");
  } catch (error) {
    console.error("Unexpected error during connection process:", error);
    return errorResponse(
      "An unexpected error occurred. Please try again later.",
    );
  }
});

export default app;
