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
  // TODO: Add proper caching
  // "use cache";
  const supabase = await createClient();
  const { data: provider } = await supabase
    .from("provider")
    .select("*")
    .eq("name", providerName)
    .single();

  if (!provider) {
    return null;
  }

  return provider;
};
