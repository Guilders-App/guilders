import { createAdminClient } from "@/apps/web/lib/db/admin";
import { getProvider } from "@/apps/web/lib/db/utils";
import { providerName, snaptrade } from "./client";

export const insertSnapTradeInstitutions = async () => {
  const supabase = await createAdminClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    throw new Error(`Failed to fetch providers for ${providerName}`);
  }

  const institutions = await snaptrade.referenceData.listAllBrokerages();

  if (!institutions.data || institutions.data.length === 0) {
    throw new Error("Failed to fetch brokerages");
  }

  const entries = institutions.data
    .filter(
      (institution) =>
        institution.id &&
        institution.name &&
        institution.aws_s3_square_logo_url &&
        institution.enabled
    )
    .map((institution) => ({
      provider_id: provider.id,
      provider_institution_id: institution.id!,
      name: institution.name!,
      logo_url: institution.aws_s3_square_logo_url!,
      enabled: institution.enabled!,
      country: null,
    }));

  const { error } = await supabase.from("institution").upsert(entries, {
    onConflict: "provider_id,provider_institution_id",
  });

  if (error) throw error;
};
