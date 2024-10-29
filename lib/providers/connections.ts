import { createClient } from "../supabase/server";
import { getProviders } from "../supabase/utils";
import { snaptrade } from "./snaptrade";

export interface ConnectionResult {
  success: boolean;
  error?: string;
}

export interface ConnectionProviderFunction {
  (userId: string): Promise<ConnectionResult>;
}

export const registerSnapTradeUser: ConnectionProviderFunction = async (
  userId: string
) => {
  const providerName = "SnapTrade";
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

  const providers = await getProviders();
  if (!providers) {
    return {
      success: false,
      error: "Providers could not be retrieved",
    };
  }

  const provider = providers?.find((p) => p.name === providerName);
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
