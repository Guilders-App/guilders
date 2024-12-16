import { Snaptrade } from "snaptrade-typescript-sdk";

export const providerName = "SnapTrade";

export const snaptrade = new Snaptrade({
  clientId: process.env.SNAPTRADE_CLIENT_ID,
  consumerKey: process.env.SNAPTRADE_CLIENT_SECRET,
});
