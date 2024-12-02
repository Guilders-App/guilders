import { saltedge } from "@/lib/providers/saltedge/client";
import { createAdminClient } from "./admin";

export const getProviders = async () => {
  // TODO: Add proper caching
  // "use cache";
  const supabase = await createAdminClient();
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

export const getRates = async () => {
  // TODO: Add proper caching
  // "use cache";
  const rates = await saltedge.getRates();

  return rates.map(({ currency_code, rate }) => ({
    currency_code,
    rate,
  }));
};
