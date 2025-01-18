import type { Bindings } from "@/common/variables";
import { getCurrencyBeacon } from "@/lib/currencyBeacon";
import { createClient } from "@guilders/database/server";

export async function insertRates(env: Bindings) {
  const currencyBeacon = getCurrencyBeacon(env);
  const rates = await currencyBeacon.getLatestRates("USD");
  const supabase = await createClient({
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    ssr: false,
  });

  // First, fetch all supported currencies from the currency table
  const { data: supportedCurrencies, error: fetchError } = await supabase
    .from("currency")
    .select("code");

  if (fetchError) {
    console.error("Error fetching supported currencies", fetchError);
    return;
  }

  // Create a Set of supported currency codes for faster lookups
  const supportedCurrencyCodes = new Set(
    supportedCurrencies.map((currency) => currency.code),
  );

  // Filter rates to only include supported currencies
  const filteredRates = [
    ...Object.entries(rates.rates)
      .filter(([currencyCode]) => supportedCurrencyCodes.has(currencyCode))
      .map(([currencyCode, rate]) => ({
        currency_code: currencyCode,
        rate,
      })),
  ];

  if (filteredRates.length === 0) {
    console.log("No supported currencies found in rates");
    return;
  }

  const { error } = await supabase.from("rate").upsert(filteredRates);

  if (error) {
    console.error("Error inserting rates", error);
    return;
  }
}
