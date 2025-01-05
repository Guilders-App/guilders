import type { SupabaseClient } from "@supabase/supabase-js";

export const getProviders = async (supabase: SupabaseClient) => {
  const { data: providers } = await supabase.from("provider").select("*");

  if (!providers) {
    return null;
  }

  return providers;
};

export const getProvider = async (
  supabase: SupabaseClient,
  providerName: string,
) => {
  const providers = await getProviders(supabase);
  const provider = providers?.find((p) => p.name === providerName);

  if (!provider) {
    return null;
  }

  return provider;
};
