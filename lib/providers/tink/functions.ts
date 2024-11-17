"use server";

import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { TinkClient, providerName } from "./client";

export const insertTinkInstitutions = async (): Promise<Response> => {
  const supabase = await createClient();
  const client = new TinkClient({
    clientId: process.env.TINK_CLIENT_ID,
    clientSecret: process.env.TINK_CLIENT_SECRET,
  });

  const provider = await getProvider(providerName);

  if (!provider) {
    console.error(`Failed to fetch providers for ${providerName}`);
    return new Response(`Failed to fetch providers for ${providerName}`, {
      status: 500,
    });
  }

  const supportedCountries = ["BE", "NL"];
  for (const country of supportedCountries) {
    const response = await client.getProviders(country);
    console.log("response", response);

    const entries = response.providers.map((institution) => ({
      provider_id: provider.id,
      provider_institution_id: institution.financialInstitutionId,
      name: institution.displayName,
      logo_url: institution.images?.icon ?? "",
      enabled: true,
      countries: [institution.market],
      demo: true,
    }));

    const insertResponse = await supabase.from("institution").upsert(entries, {
      onConflict: "provider_id,provider_institution_id",
    });

    console.log("Tink insert response", insertResponse);

    if (insertResponse.error) {
      return new Response("Failed to insert institutions", { status: 500 });
    }
  }

  return new Response("OK");
};
