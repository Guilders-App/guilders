import type { Bindings } from "@/common/variables";
import { getEnv } from "@/env";
import { getProvider } from "@/providers";
import { EnableBankingClient } from "@/providers/enablebanking/client";
import type { ConnectionState } from "@/providers/enablebanking/types";
import { createClient } from "@guilders/database/server";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Bindings }>().get("/", async (c) => {
  const env = getEnv(c.env);
  const { code, state } = await c.req.query();

  if (!code || !state) {
    return c.json({ error: "Code and state are required" }, 400);
  }

  const stateObj: ConnectionState = JSON.parse(state);

  if (!stateObj.userId || !stateObj.institutionId) {
    return c.json({ error: "User ID and institution ID are required" }, 400);
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
    console.error(providerDbError);
    return c.json({ error: "Provider not found" }, 500);
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
    console.error(providerConnectionError);
    return c.json({ error: "Failed to create provider connection" }, 500);
  }

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
    console.error(connectionError);
    return c.json({ error: "Failed to create institution connection" }, 500);
  }

  const sessionData = await enablebankingClient.getSession({
    sessionId: session.session_id,
  });

  const accountIdMapping: Record<string, number> = {};

  for (const account of sessionData.accounts ?? []) {
    const balances = await enablebankingClient.getAccountBalances({
      accountId: account,
    });

    for (const balance of balances) {
      const { data: accountData, error: accountError } = await supabase
        .from("account")
        .insert({
          type: "asset",
          subtype: "depository",
          user_id: stateObj.userId,
          name: "Bank Account",
          value: Number(balance.balance_amount.amount),
          currency: balance.balance_amount.currency,
          institution_connection_id: connection.id,
          provider_account_id: account,
        })
        .select("id")
        .single();

      if (accountError) {
        console.error(accountError);
        return c.json({ error: "Failed to create account" }, 500);
      }

      accountIdMapping[account] = accountData.id;
    }

    const transactions = await enablebankingClient.getAccountTransactions({
      accountId: account,
    });

    for (const transaction of transactions) {
      const { error: transactionError } = await supabase
        .from("transaction")
        .insert({
          date: transaction.booking_date,
          amount: Number(transaction.transaction_amount.amount),
          currency: transaction.transaction_amount.currency,
          description: transaction.remittance_information?.join(", ") ?? "",
          category: "Uncategorized",
          account_id: Number(accountIdMapping[account]),
          provider_transaction_id: transaction.transaction_id,
        });

      if (transactionError) {
        console.error(transactionError);
        return c.json({ error: "Failed to create transaction" }, 500);
      }
    }
  }

  return c.text("You can close this window now");
});

export default app;
