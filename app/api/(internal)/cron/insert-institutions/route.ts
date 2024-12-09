import { insertSaltEdgeInstitutions } from "@/lib/providers/saltedge/functions";
import { insertSnapTradeInstitutions } from "@/lib/providers/snaptrade/functions";
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
