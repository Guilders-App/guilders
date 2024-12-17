import { env } from "@/env";
import { Snaptrade } from "snaptrade-typescript-sdk";

export const providerName = "SnapTrade";

export const snaptrade = new Snaptrade({
  clientId: env.SNAPTRADE_CLIENT_ID,
  consumerKey: env.SNAPTRADE_CLIENT_SECRET,
});
