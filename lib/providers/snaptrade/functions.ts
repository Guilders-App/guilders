"use server";

import { createAdminClient } from "@/lib/db/admin";
import { getProvider } from "@/lib/db/utils";
import { providerName, snaptrade } from "./client";

export const insertSnapTradeInstitutions = async (): Promise<Response> => {
  const supabase = await createAdminClient();
  const provider = await getProvider(providerName);

  if (!provider) {
    console.error(`Failed to fetch providers for ${providerName}`);
    return new Response(`Failed to fetch providers for ${providerName}`, {
      status: 500,
    });
  }

  const institutions = await snaptrade.referenceData.listAllBrokerages();

  if (!institutions.data || institutions.data.length === 0) {
    return new Response("Failed to fetch brokerages", { status: 500 });
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
      countries: [],
    }));

  const response = await supabase.from("institution").upsert(entries, {
    onConflict: "provider_id,provider_institution_id",
  });

  if (response.error) {
    return new Response("Failed to insert institutions", { status: 500 });
  }

  return new Response("OK");
};
