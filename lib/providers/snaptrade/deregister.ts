import { getProvider } from "@/lib/supabase/utils";
import { ConnectionProviderFunction } from "../types";
import { providerName, snaptrade } from "./client";

export const deregisterSnapTradeUser: ConnectionProviderFunction = async (
  userId: string
) => {
  const provider = await getProvider(providerName);

  if (!provider) {
    return {
      success: false,
      error: `${providerName} provider not found`,
    };
  }

  const response = await snaptrade.authentication.deleteSnapTradeUser({
    userId,
  });
  if (!response || response.status !== 200) {
    console.error(`${providerName} deregistration error:`, response);
    return {
      success: false,
      error: `Failed to deregister ${providerName} user`,
    };
  }

  return { success: true };
};
