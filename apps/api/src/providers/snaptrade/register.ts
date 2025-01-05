import { createClient } from "@guilders/database/server";
import { getProvider } from "@guilders/database/utils";
import type { ConnectionProviderFunction, ConnectionResult } from "../types";
import { providerName, snaptrade } from "./client";

export const registerSnapTradeUser: ConnectionProviderFunction = async (
  userId: string,
): Promise<ConnectionResult> => {
  const supabase = await createClient();
  const provider = await getProvider(supabase, providerName);

  if (!provider) {
    return {
      success: false,
      error: `${providerName} provider not found`,
    };
  }

  const { data: connection } = await supabase
    .from("provider_connection")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_id", provider.id)
    .single();

  if (connection) {
    return {
      success: true,
      data: connection,
    };
  }

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

  const { data: registeredConnection, error } = await supabase
    .from("provider_connection")
    .insert({
      user_id: userId,
      secret: response.data.userSecret,
      provider_id: provider.id,
    })
    .select()
    .single();

  if (error) {
    console.error(`${providerName} registration error:`, error);
    return {
      success: false,
      error: `Failed to save ${providerName} connection`,
    };
  }

  return {
    success: true,
    data: registeredConnection,
  };
};
