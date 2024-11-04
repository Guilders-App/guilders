import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { ConnectionProviderFunction } from "../types";
import { providerName, saltedge } from "./client";

export const deregisterSaltEdgeUser: ConnectionProviderFunction = async (
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

  const { data: secret, error: secretError } = await supabase
    .from("provider_connection")
    .select("secret")
    .eq("user_id", userId)
    .eq("provider_id", provider.id)
    .single();

  if (secretError) {
    console.error(`${providerName} deregistration error:`, secretError);
    return {
      success: false,
      error: `Failed to get ${providerName} connection secret`,
    };
  }

  const response = await saltedge.removeCustomer(secret.secret);
  console.log(response);

  if (!response.deleted) {
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
