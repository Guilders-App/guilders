import { env } from "@/env";
import { getProvider } from "@/providers";
import type { Providers } from "@/providers/types";
import { createClient } from "@guilders/database/server";
import { getProvider as getProviderDb } from "@guilders/database/utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  await insertInstitutions();

  return new Response("OK");
}

async function insertInstitutions() {
  const supabase = await createClient({
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    admin: true,
    ssr: false,
  });
  const providers: Providers[] = ["SnapTrade"];

  for (const providerName of providers) {
    const providerDb = await getProviderDb(supabase, providerName);
    const provider = getProvider(providerName);

    if (!providerDb) {
      console.error(`Failed to fetch providers for ${providerName}`);
      throw new Error(`Failed to fetch providers for ${providerName}`);
    }

    const institutions = await provider.getInstitutions();

    if (!institutions || institutions.length === 0) {
      console.error(`Failed to fetch brokerages for ${providerName}`);
      throw new Error(`Failed to fetch brokerages for ${providerName}`);
    }

    await supabase.from("institution").upsert(
      institutions.map((institution) => ({
        ...institution,
        provider_id: providerDb.id,
      })),
      { onConflict: "provider_id,provider_institution_id" },
    );

    console.log(
      `Inserted ${institutions.length} institutions for ${providerName}`,
    );
  }
}

insertInstitutions();
