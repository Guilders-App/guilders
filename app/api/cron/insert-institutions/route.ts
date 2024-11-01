import { snaptrade } from "@/lib/providers/snaptrade";
import { createClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/supabase/utils";
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
  return new Response("OK");
}

const insertSnapTradeInstitutions = async () => {
  const providerName = "SnapTrade";
  const supabase = await createClient();

  const providers = await getProviders();
  const provider = providers?.find((p) => p.name === providerName);

  if (!provider) {
    return new Response("Failed to fetch providers", { status: 500 });
  }

  const brokerages = await snaptrade.referenceData.listAllBrokerages();

  if (!brokerages.data || brokerages.data.length === 0) {
    return new Response("Failed to fetch brokerages", { status: 500 });
  }

  const institutions = brokerages.data
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

  await supabase.from("institution").upsert(institutions);
};
