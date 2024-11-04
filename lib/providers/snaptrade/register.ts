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
      error: `Failed to register ${providerName} user`,
    };
  }

  const provider = await getProvider(providerName);
  if (!provider) {
    return {
      success: false,
      error: `${providerName} provider not found`,
    };
  }

  const { error } = await supabase.from("provider_connection").insert({
    user_id: userId,
    secret: response.data.userSecret,
    provider_id: provider.id,
  });

  if (error) {
    console.error(`${providerName} registration error:`, error);
    return {
      success: false,
      error: `Failed to save ${providerName} connection`,
    };
  }

  return { success: true };
};
