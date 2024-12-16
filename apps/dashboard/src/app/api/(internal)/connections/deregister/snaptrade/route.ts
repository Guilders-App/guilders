import { providerName } from "@/apps/web/lib/providers/snaptrade/client";
import { deregisterSnapTradeUser } from "@/apps/web/lib/providers/snaptrade/deregister";
import { deregisterConnection } from "../../common";

export async function POST() {
  return deregisterConnection(providerName, deregisterSnapTradeUser);
}
