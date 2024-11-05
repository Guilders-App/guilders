import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { ConnectionProviderFunction, ConnectionResult } from "../types";
import { providerName, saltedge } from "./client";

export const registerSaltEdgeUser: ConnectionProviderFunction = async (
  userId: string
): Promise<ConnectionResult> => {
  const supabase = await createClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    return {
      success: false,
      error: `${providerName} provider not found`,
    };
  }

  const connection = await supabase
    .from("provider_connection")
    .select("*")
    .eq("user_id", userId)
    .eq("provider_id", provider.id);

  if (connection.data) {
    return {
      success: true,
    };
  }

  const response = await saltedge.createCustomer(userId);
  console.log(response);

  if (!response) {
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
      secret: response.customer_id,
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

  return { success: true, data: registeredConnection };
};
