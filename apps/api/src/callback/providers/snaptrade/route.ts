import type { Bindings } from "@/common/variables";
import { getEnv } from "@/env";
import { getSnaptrade } from "@/providers/snaptrade/client";
import { createClient } from "@guilders/database/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type Context, Hono } from "hono";
import type { Position } from "snaptrade-typescript-sdk";
import type {
  AccountHoldingsUpdatedWebhook,
  AccountRemovedWebhook,
  AccountTransactionsInitialUpdateWebhook,
  AccountTransactionsUpdatedWebhook,
  ConnectionAddedWebhook,
  ConnectionBrokenWebhook,
  ConnectionDeletedWebhook,
  ConnectionFixedWebhook,
  NewAccountAvailableWebhook,
  SnapTradeWebhook,
} from "./types";

const providerName = "SnapTrade";
const app = new Hono<{ Bindings: Bindings }>().post("/", async (c) => {
  const body = (await c.req.json()) as SnapTradeWebhook;
  const env = getEnv(c.env);

  if (!body || !body.eventType) {
    return c.json({ error: "Invalid webhook payload" }, 400);
  }

  if (
    !body.webhookSecret ||
    body.webhookSecret !== env.SNAPTRADE_WEBHOOK_SECRET
  ) {
    return c.json({ error: "Invalid webhook secret" }, 401);
  }

  const supabase = await createClient({
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    admin: true,
    ssr: false,
  });

  try {
    switch (body.eventType) {
      case "CONNECTION_ADDED":
        await handleConnectionAdded(c, body, supabase);
        break;
      case "CONNECTION_DELETED":
        await handleConnectionDeleted(c, body, supabase);
        break;
      case "CONNECTION_BROKEN":
        await handleConnectionBroken(c, body, supabase);
        break;
      case "CONNECTION_FIXED":
        await handleConnectionFixed(c, body, supabase);
        break;
      case "NEW_ACCOUNT_AVAILABLE":
      case "ACCOUNT_TRANSACTIONS_INITIAL_UPDATE":
      case "ACCOUNT_TRANSACTIONS_UPDATED":
      case "ACCOUNT_HOLDINGS_UPDATED":
        await handleAccountUpdate(c, body, supabase);
        break;
      case "ACCOUNT_REMOVED":
        await handleAccountRemoved(c, body, supabase);
        break;
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return c.json({ error: "Error processing webhook" }, 500);
  }
});

async function handleConnectionAdded(
  c: Context,
  body: ConnectionAddedWebhook,
  supabase: SupabaseClient,
) {
  const { data: provider } = await supabase
    .from("provider")
    .select("*")
    .eq("name", providerName)
    .single();

  if (!provider) {
    return c.json({ error: "Provider not found" }, 500);
  }

  const { data: institution } = await supabase
    .from("institution")
    .select()
    .eq("provider_id", provider.id)
    .eq("provider_institution_id", body.brokerageId)
    .single();

  if (!institution) {
    return c.json({ error: "Institution not found" }, 500);
  }

  const { data: provider_connection } = await supabase
    .from("provider_connection")
    .select()
    .eq("user_id", body.userId)
    .eq("provider_id", provider.id)
    .single();

  if (!provider_connection) {
    return c.json({ error: "Provider connection not found" }, 500);
  }

  const { error } = await supabase.from("institution_connection").upsert({
    institution_id: institution.id,
    provider_connection_id: provider_connection.id,
    connection_id: body.brokerageAuthorizationId,
  });

  if (error) {
    return c.json({ error: "Error inserting institution connection" }, 500);
  }
}

async function handleConnectionDeleted(
  c: Context,
  body: ConnectionDeletedWebhook,
  supabase: SupabaseClient,
) {
  const { data: provider } = await supabase
    .from("provider")
    .select()
    .eq("name", providerName)
    .single();

  if (!provider) {
    return c.json({ error: "Provider not found" }, 500);
  }

  const { data: providerConnection } = await supabase
    .from("provider_connection")
    .select()
    .eq("provider_id", provider.id)
    .eq("user_id", body.userId)
    .single();

  if (!providerConnection) {
    return c.json({ error: "Provider connection not found" }, 500);
  }

  const { error } = await supabase
    .from("institution_connection")
    .delete()
    .eq("institution_id", body.brokerageId)
    .eq("provider_connection_id", providerConnection.id);

  if (error) {
    return c.json({ error: "Error deleting institution connection" }, 500);
  }
}

async function handleConnectionBroken(
  c: Context,
  body: ConnectionBrokenWebhook,
  supabase: SupabaseClient,
) {
  const { error } = await supabase
    .from("institution_connection")
    .update({ broken: true })
    .eq("connection_id", body.brokerageAuthorizationId);

  if (error) {
    return c.json({ error: "Error updating institution connection" }, 500);
  }
}

async function handleConnectionFixed(
  c: Context,
  body: ConnectionFixedWebhook,
  supabase: SupabaseClient,
) {
  const { error } = await supabase
    .from("institution_connection")
    .update({ broken: false })
    .eq("connection_id", body.brokerageAuthorizationId);

  if (error) {
    return c.json({ error: "Error updating institution connection" }, 500);
  }
}

async function handleAccountRemoved(
  c: Context,
  body: AccountRemovedWebhook,
  supabase: SupabaseClient,
) {
  const { error } = await supabase
    .from("account")
    .delete()
    .eq("provider_account_id", body.accountId)
    .eq("institution_connection_id", body.brokerageId);

  if (error) {
    return c.json({ error: "Error deleting account" }, 500);
  }
}

async function handleAccountUpdate(
  c: Context,
  body:
    | NewAccountAvailableWebhook
    | AccountHoldingsUpdatedWebhook
    | AccountTransactionsInitialUpdateWebhook
    | AccountTransactionsUpdatedWebhook,
  supabase: SupabaseClient,
) {
  const { data: provider } = await supabase
    .from("provider")
    .select()
    .eq("name", providerName)
    .single();

  if (!provider) {
    return c.json({ error: "Provider not found" }, 500);
  }

  const { data: providerConnection } = await supabase
    .from("provider_connection")
    .select()
    .eq("provider_id", provider.id)
    .eq("user_id", body.userId)
    .single();

  if (!providerConnection || !providerConnection.secret) {
    return c.json({ error: "Provider connection not found" }, 500);
  }

  const { data: institution, error: institution_error } = await supabase
    .from("institution")
    .select()
    .eq("provider_id", provider.id)
    .eq("provider_institution_id", body.brokerageId)
    .single();

  if (institution_error) {
    return c.json({ error: "Error getting institution" }, 500);
  }

  const { data: institutionConnection } = await supabase
    .from("institution_connection")
    .select()
    .eq("provider_connection_id", providerConnection.id)
    .eq("institution_id", institution.id)
    .single();

  if (!institutionConnection) {
    return c.json({ error: "Institution connection not found" }, 500);
  }

  const snaptrade = getSnaptrade(c.env);

  const { data: accountResponse } =
    await snaptrade.accountInformation.getUserHoldings({
      userId: body.userId,
      userSecret: providerConnection.secret,
      accountId: body.accountId,
    });

  if (!accountResponse || !accountResponse.account) {
    return c.json({ error: "SnapTrade account not found" }, 500);
  }

  if (
    body.eventType === "NEW_ACCOUNT_AVAILABLE" &&
    (!accountResponse.account?.sync_status.holdings?.initial_sync_completed ||
      !accountResponse.account?.sync_status.transactions
        ?.initial_sync_completed)
  ) {
    return c.json({ error: "SnapTrade account not fully synced" }, 500);
  }

  const snapTradeAccount = accountResponse.account;
  const { data: account, error } = await supabase
    .from("account")
    .upsert(
      {
        type: "asset",
        subtype: "brokerage",
        user_id: body.userId,
        name: snapTradeAccount.institution_name,
        value: snapTradeAccount.balance.total?.amount ?? 0,
        currency:
          snapTradeAccount.balance.total?.currency?.toUpperCase() ?? "EUR",
        cost:
          accountResponse.positions?.reduce(
            (acc: number, holding: Position) =>
              acc +
              (holding.average_purchase_price ?? 0) * (holding.units ?? 0),
            0,
          ) ??
          snapTradeAccount.balance.total?.amount ??
          null,
        institution_connection_id: institutionConnection.id,
        provider_account_id: snapTradeAccount.id,
        image: institution.logo_url,
      },
      { onConflict: "institution_connection_id,provider_account_id" },
    )
    .select()
    .single();

  if (error) {
    return c.json({ error: "Error inserting account" }, 500);
  }

  // Add account holdings
  if (accountResponse.positions && accountResponse.positions.length > 0) {
    for (const holding of accountResponse.positions) {
      const { error } = await supabase
        .from("account")
        .upsert(
          {
            type: "asset",
            subtype: "stock",
            user_id: body.userId,
            parent: account.id,
            name: holding.symbol?.symbol?.description ?? "Stock",
            value: (holding.price ?? 0) * (holding.units ?? 0),
            cost: (holding.average_purchase_price ?? 0) * (holding.units ?? 0),
            units: holding.units ?? 0,
            currency:
              holding.symbol?.symbol?.currency.code?.toUpperCase() ?? "EUR",
            ticker: holding.symbol?.symbol?.raw_symbol ?? null,
            institution_connection_id: institutionConnection.id,
            image: holding.symbol?.symbol?.logo_url,
          },
          { onConflict: "parent,name" },
        )
        .single();

      if (error) {
        return c.json({ error: "Error inserting account holding" }, 500);
      }
    }
  }
}

export default app;
