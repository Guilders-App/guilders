"use server";

import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { providerName, saltedge } from "./client";

export const insertSaltEdgeInstitutions = async (): Promise<Response> => {
  const supabase = await createClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    console.error(`Failed to fetch providers for ${providerName}`);
    return new Response(`Failed to fetch providers for ${providerName}`, {
      status: 500,
    });
  }

  const institutions = (await saltedge.getProviders()).filter(
    (inst) => inst.supported_iframe_embedding
  );

  const entries = institutions.map((institution) => ({
    provider_id: provider.id,
    provider_institution_id: institution.code,
    name: institution.name,
    logo_url: institution.logo_url,
    countries: [institution.country_code.toLowerCase()],
    demo: true,
  }));

  await supabase.from("institution").upsert(entries, {
    onConflict: "provider_id,provider_institution_id",
  });

  return new Response("OK");
};
