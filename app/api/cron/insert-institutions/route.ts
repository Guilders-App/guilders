import {
  providerName as saltEdgeProviderName,
  saltedge,
} from "@/lib/providers/saltedge/client";
import {
  snaptrade,
  providerName as snaptradeProviderName,
} from "@/lib/providers/snaptrade/client";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/supabase/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  await insertSnapTradeInstitutions();
  await insertSaltEdgeInstitutions();
  return new Response("OK");
}

const insertSaltEdgeInstitutions = async () => {
  const supabase = await createClient();
  const provider = await getProvider(saltEdgeProviderName);

  if (!provider) {
    console.error(`Failed to fetch providers for ${saltEdgeProviderName}`);
    return new Response(
      `Failed to fetch providers for ${saltEdgeProviderName}`,
      {
        status: 500,
      }
    );
  }

  const institutions = (await saltedge.getProviders()).filter(
    (inst) => inst.supported_iframe_embedding
  );

  const entries = institutions.map((institution) => ({
    provider_id: provider.id,
    institution_id: institution.id,
    name: institution.name,
    logo_url: institution.logo_url,
    countries: [institution.country_code.toLowerCase()],
  }));

  await supabase.from("institution").upsert(entries);
};

const insertSnapTradeInstitutions = async () => {
  const supabase = await createClient();

  const provider = await getProvider(snaptradeProviderName);

  if (!provider) {
    console.error(`Failed to fetch providers for ${saltEdgeProviderName}`);
    return new Response(
      `Failed to fetch providers for ${saltEdgeProviderName}`,
      {
        status: 500,
      }
    );
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
      institution_id: institution.id!,
      name: institution.name!,
      logo_url: institution.aws_s3_square_logo_url!,
      enabled: institution.enabled!,
      countries: [],
    }));

  await supabase.from("institution").upsert(entries);
};
