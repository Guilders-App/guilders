import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { ConnectionProviderFunction } from "../types";
import { providerName, saltedge } from "./client";

export const registerSaltEdgeUser: ConnectionProviderFunction = async (
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

  const response = await saltedge.createCustomer(userId);

  if (!response) {
    console.error(`${providerName} registration error:`, response);
    return {
      success: false,
      error: "Failed to register SnapTrade user",
    };
  }

  const registerConnection = await supabase.from("connection").insert({
    user_id: userId,
    secret: response.customer_id,
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
