import { env } from "@/lib/env";
import { createClient } from "@guilders/database/server";
import { getProvider } from "@guilders/database/utils";
import { providerName, saltedge } from "./client";
import type { Provider } from "./types";

export const insertSaltEdgeInstitutions = async () => {
  const supabase = await createClient({ admin: true });
  const provider = await getProvider(supabase, providerName);

  if (!provider) {
    throw new Error(`Failed to fetch providers for ${providerName}`);
  }

  const institutions = await saltedge.getProviders();

  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.supported_iframe_embedding &&
      (env.NODE_ENV !== "development" ? !isDemoInstitution(inst) : true),
  );

  const entries = filteredInstitutions.map((institution) => ({
    provider_id: provider.id,
    provider_institution_id: institution.code,
    name: institution.name,
    logo_url: institution.logo_url,
    country: !isDemoInstitution(institution) ? institution.country_code : null,
    demo: isDemoInstitution(institution),
  }));

  const { error } = await supabase.from("institution").upsert(entries, {
    onConflict: "provider_id,provider_institution_id",
  });

  if (error) throw error;
};

const isDemoInstitution = (institution: Provider) => {
  return (
    ["XF", "XO"].includes(institution.country_code) ||
    institution.status !== "active"
  );
};
