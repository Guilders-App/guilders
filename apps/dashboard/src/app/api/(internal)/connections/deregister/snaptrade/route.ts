import { providerName } from "@/lib/providers/snaptrade/client";
import { deregisterSnapTradeUser } from "@/lib/providers/snaptrade/deregister";
import { deregisterConnection } from "../../common";

export async function POST() {
  return deregisterConnection(providerName, deregisterSnapTradeUser);
}
