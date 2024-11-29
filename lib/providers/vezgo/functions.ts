import { createAdminClient } from "@/lib/db/admin";
import { getProvider } from "@/lib/db/utils";
import { providerName, vezgoClient } from "./client";

export const insertVezgoInstitutions = async () => {
  const supabase = await createAdminClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    throw new Error(`Failed to fetch providers for ${providerName}`);
  }
  const institutions = await vezgoClient.getProviders();

  if (!institutions || institutions.length === 0) {
    throw new Error("Failed to fetch crypto providers");
  }

  const entries = institutions
    .filter(
      (institution) =>
        institution.name && institution.display_name && institution.logo
    )
    .map((institution) => ({
      provider_id: provider.id,
      provider_institution_id: institution.name!,
      name: institution.display_name!,
      logo_url: institution.logo!,
      enabled: true,
      countries: [],
    }));

  const { error } = await supabase.from("institution").upsert(entries, {
    onConflict: "provider_id,provider_institution_id",
  });

  if (error) throw error;
};

insertVezgoInstitutions();
