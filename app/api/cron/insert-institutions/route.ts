import { snaptrade } from "@/lib/providers/snaptrade";
import { TablesInsert } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { getProviders } from "@/lib/supabase/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  await insertSnapTradeInstitutions();
  await insertGocardlessInstitutions();
  return new Response("OK");
}

const insertGocardlessInstitutions = async () => {
  const providerName = "GoCardless";
  const supabase = await createClient();
  const providers = await getProviders();
  const provider = providers?.find((p) => p.name === providerName);

  if (!provider) {
    return new Response("Provider not found", { status: 500 });
  }
};

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

  const institutions: TablesInsert<"institution">[] = brokerages.data
    .map((institution) => {
      if (
        !institution.id ||
        !institution.name ||
        !institution.aws_s3_square_logo_url ||
        !institution.enabled
      )
        return null;
      return {
        provider_id: provider.id,
        institution_id: institution.id,
        name: institution.name,
        logo_url: institution.aws_s3_square_logo_url,
        enabled: institution.enabled,
        countries: [],
      };
    })
    .filter((institution) => institution !== null);

  await supabase.from("institution").upsert(institutions);
};
