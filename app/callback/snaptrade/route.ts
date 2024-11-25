"use server";

import { createAdminClient } from "@/lib/db/admin";
import { providerName, snaptrade } from "@/lib/providers/snaptrade/client";
import { NextResponse } from "next/server";
import type {
  AccountHoldingsUpdatedWebhook,
  AccountRemovedWebhook,
  AccountTransactionsInitialUpdateWebhook,
  AccountTransactionsUpdatedWebhook,
  ConnectionAddedWebhook,
  ConnectionDeletedWebhook,
  NewAccountAvailableWebhook,
  SnapTradeWebhook,
  UserDeletedWebhook,
} from "./types";

export async function POST(request: Request) {
  const body = (await request
    .json()
    .catch(() => null)) as SnapTradeWebhook | null;

  if (!body || !body.eventType || !body.webhookSecret) {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    );
  }

  if (body.webhookSecret !== process.env.SNAPTRADE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Invalid webhook secret" },
      { status: 400 }
    );
  }

  switch (body.eventType) {
    case "USER_REGISTERED":
      // User registration is handled when we /register or /connect
      break;
    case "USER_DELETED":
      await handleUserDeleted(body);
      break;
    case "CONNECTION_ATTEMPTED":
      // Ignore
      break;
    case "CONNECTION_ADDED":
      await handleConnectionAdded(body);
      break;
    case "CONNECTION_DELETED":
      await handleConnectionDeleted(body);
      break;
    case "CONNECTION_BROKEN":
      // TODO: Handle?
      break;
    case "CONNECTION_FIXED":
      // TODO: Handle?
      break;
    case "CONNECTION_UPDATED":
      // TODO: Handle?
      break;
    case "CONNECTION_FAILED":
      // TODO: Handle?
      break;
    case "NEW_ACCOUNT_AVAILABLE":
      await handleAccountUpdate(body);
      break;

    case "ACCOUNT_TRANSACTIONS_INITIAL_UPDATE":
      await handleAccountUpdate(body);
      break;

    case "ACCOUNT_TRANSACTIONS_UPDATED":
      await handleAccountUpdate(body);
      break;

    case "ACCOUNT_REMOVED":
      await handleAccountRemoved(body);
      break;

    case "TRADES_PLACED":
      // Ignore
      break;

    case "ACCOUNT_HOLDINGS_UPDATED":
      await handleAccountUpdate(body);
      break;

    default:
      return NextResponse.json(
        { error: "Unknown event type" },
        { status: 400 }
      );
  }

  return NextResponse.json({ success: true });
}

async function handleUserDeleted(body: UserDeletedWebhook) {
  const supabase = await createAdminClient();

  // Remove _deleted suffix from userId
  const userId = body.userId.replace("_deleted", "");

  const { data: provider } = await supabase
    .from("provider")
    .select("*")
    .eq("name", providerName)
    .single();

  if (!provider) {
    console.error("Provider not found");
    return NextResponse.json({ error: "Provider not found" }, { status: 500 });
  }

  const { error } = await supabase
    .from("provider_connection")
    .delete()
    .eq("user_id", userId)
    .eq("provider_id", provider.id);

  if (error) {
    console.error("Error deleting provider connection:", error);
    return NextResponse.json(
      { error: "Error deleting provider connection" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

async function handleConnectionAdded(body: ConnectionAddedWebhook) {
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
    .eq("provider_institution_id", body.brokerageId)
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
    .select()
    .eq("user_id", body.userId)
    .eq("provider_id", provider.id)
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
    connection_id: body.brokerageAuthorizationId,
  });

  if (error) {
    console.error("Error inserting institution connection:", error);
    return NextResponse.json(
      { error: "Error inserting institution connection" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

async function handleConnectionDeleted(body: ConnectionDeletedWebhook) {
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
    .eq("user_id", body.userId)
    .single();

  if (!providerConnection) {
    console.error("Provider connection not found");
    return NextResponse.json(
      { error: "Provider connection not found" },
      { status: 500 }
    );
  }

  const { error } = await supabase
    .from("institution_connection")
    .delete()
    .eq("institution_id", body.brokerageId)
    .eq("provider_connection_id", providerConnection.id);

  if (error) {
    console.error("Error deleting institution connection:", error);
    return NextResponse.json(
      { error: "Error deleting institution connection" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

async function handleAccountRemoved(body: AccountRemovedWebhook) {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("account")
    .delete()
    .eq("account_id", body.accountId)
    .eq("institution_connection_id", body.brokerageId);

  if (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Error deleting account" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

async function handleAccountUpdate(
  body:
    | NewAccountAvailableWebhook
    | AccountHoldingsUpdatedWebhook
    | AccountTransactionsInitialUpdateWebhook
    | AccountTransactionsUpdatedWebhook
) {
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
    .eq("user_id", body.userId)
    .single();

  if (!providerConnection || !providerConnection.secret) {
    console.error("Provider connection not found");
    return NextResponse.json(
      { error: "Provider connection not found" },
      { status: 500 }
    );
  }

  const { data: institution, error: institution_error } = await supabase
    .from("institution")
    .select()
    .eq("provider_id", provider.id)
    .eq("provider_institution_id", body.brokerageId)
    .single();

  if (institution_error) {
    console.error("Error getting institution:", institution_error);
    return NextResponse.json(
      { error: "Error getting institution" },
      { status: 500 }
    );
  }

  const { data: institutionConnection } = await supabase
    .from("institution_connection")
    .select()
    .eq("provider_connection_id", providerConnection.id)
    .eq("institution_id", institution.id)
    .single();

  if (!institutionConnection) {
    console.error("Institution connection not found");
    return NextResponse.json(
      { error: "Institution connection not found" },
      { status: 500 }
    );
  }

  const { data: accountResponse } =
    await snaptrade.accountInformation.getUserHoldings({
      userId: body.userId,
      userSecret: providerConnection.secret,
      accountId: body.accountId,
    });

  if (!accountResponse || !accountResponse.account) {
    console.error("SnapTrade account not found");
    return NextResponse.json(
      { error: "SnapTrade account not found" },
      { status: 500 }
    );
  }

  if (
    body.eventType === "NEW_ACCOUNT_AVAILABLE" &&
    (!accountResponse.account?.sync_status.holdings?.initial_sync_completed ||
      !accountResponse.account?.sync_status.transactions
        ?.initial_sync_completed)
  ) {
    console.error("SnapTrade account not fully synced");
    return NextResponse.json(
      { error: "SnapTrade account not fully synced" },
      { status: 500 }
    );
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
          snapTradeAccount.balance.total?.currency?.toUpperCase() ?? "USD",
        cost:
          accountResponse.positions?.reduce(
            (acc, holding) =>
              acc +
              (holding.average_purchase_price ?? 0) * (holding.units ?? 0),
            0
          ) ?? 0,
        institution_connection_id: institutionConnection.id,
        provider_account_id: snapTradeAccount.id,
        image: institution.logo_url,
      },
      { onConflict: "institution_connection_id,provider_account_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Error inserting account:", error);
    return NextResponse.json(
      { error: "Error inserting account" },
      { status: 500 }
    );
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
              holding.symbol?.symbol?.currency.code?.toUpperCase() ?? "USD",
            ticker: holding.symbol?.symbol?.raw_symbol ?? null,
            institution_connection_id: institutionConnection.id,
            image: holding.symbol?.symbol?.logo_url,
          },
          { onConflict: "parent,name" }
        )
        .single();

      if (error) {
        console.error("Error inserting account holding:", error);
        return NextResponse.json(
          { error: "Error inserting account holding" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ success: true });
}
