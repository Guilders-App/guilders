"use server";

import { createClient } from "./server";

export const getProviders = async () => {
  // TODO: Add proper caching
  // "use cache";
  const supabase = await createClient();
  const { data: providers } = await supabase.from("provider").select("*");

  if (!providers) {
    return null;
  }

  return providers;
};

export const getProvider = async (providerName: string) => {
  const providers = await getProviders();
  const provider = providers?.find((p) => p.name === providerName);

  if (!provider) {
    return null;
  }

  return provider;
};
