import { createAdminClient } from "@/lib/db/admin";
import { getProvider } from "@/lib/db/utils";
import { providerName, saltedge } from "./client";

export const insertSaltEdgeInstitutions = async () => {
  const supabase = await createAdminClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    throw new Error(`Failed to fetch providers for ${providerName}`);
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

  const { error } = await supabase.from("institution").upsert(entries, {
    onConflict: "provider_id,provider_institution_id",
  });

  if (error) throw error;
};
