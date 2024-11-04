import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { ConnectionProviderFunction } from "../types";
import { providerName, snaptrade } from "./client";

export const registerSnapTradeUser: ConnectionProviderFunction = async (
  userId: string
) => {
  const supabase = await createClient();
  const response = await snaptrade.authentication.registerSnapTradeUser({
    userId,
  });

  if (!response || !response.data || !response.data.userSecret) {
    console.error(`${providerName} registration error:`, response);
    return {
      success: false,
      error: "Failed to register SnapTrade user",
    };
  }

  const provider = await getProvider(providerName);
  if (!provider) {
    return {
      success: false,
      error: `${providerName} provider not found`,
    };
  }

  const registerConnection = await supabase.from("connection").insert({
    user_id: userId,
    secret: response.data.userSecret,
    provider_id: provider.id,
  });

  if (!registerConnection) {
    console.error(`${providerName} registration error:`, registerConnection);
    return {
      success: false,
      error: `Failed to save ${providerName} connection`,
    };
  }

  return { success: true };
};
