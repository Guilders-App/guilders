import { SupabaseClient } from "@supabase/supabase-js";
import { snaptrade } from "./snaptrade";

export interface ConnectionResult {
  success: boolean;
  error?: string;
}

export interface ConnectionProviderFunction {
  (supabase: SupabaseClient, userId: string): Promise<ConnectionResult>;
}

export const registerSnapTradeUser: ConnectionProviderFunction = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const response = await snaptrade.authentication.registerSnapTradeUser({
    userId,
  });

  if (!response || !response.data || !response.data.userSecret) {
    console.error("SnapTrade registration error:", response);
    return {
      success: false,
      error: "Failed to register SnapTrade user",
    };
  }

  const registerConnection = await supabase.from("connection").insert({
    user_id: userId,
    secret: response.data.userSecret,
    aggregator: "SnapTrade",
  });

  if (!registerConnection) {
    console.error("SnapTrade registration error:", registerConnection);
    return {
      success: false,
      error: "Failed to save SnapTrade connection",
    };
  }

  return { success: true };
};
