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

  const { error: connectionError } = await supabase
    .from("institution_connection")
    .insert({
      institution_id: Number(stateObj.institutionId),
      provider_connection_id: providerConnection.id,
      connection_id: session.session_id,
    });

  if (connectionError) {
    console.error(connectionError);
    return c.json({ error: "Failed to create institution connection" }, 500);
  }

  return c.json({
    message: "Hello World",
  });
});

export default app;
