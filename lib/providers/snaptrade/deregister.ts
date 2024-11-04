import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { ConnectionProviderFunction } from "../types";
import { providerName, snaptrade } from "./client";

export const deregisterSnapTradeUser: ConnectionProviderFunction = async (
  userId: string
) => {
  const supabase = await createClient();
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
  console.log(response);

  if (!response || response.status !== 200) {
    console.error(`${providerName} deregistration error:`, response);
    return {
      success: false,
      error: `Failed to deregister ${providerName} user`,
    };
  }

  const { error } = await supabase
    .from("provider_connection")
    .delete()
    .eq("user_id", userId)
    .eq("provider_id", provider.id);

  if (error) {
    console.error(`${providerName} deregistration error:`, error);
    return {
      success: false,
      error: `Failed to remove ${providerName} connection`,
    };
  }

  return { success: true };
};
