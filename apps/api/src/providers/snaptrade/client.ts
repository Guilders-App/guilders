import type { Bindings } from "@/common/variables";
import { Snaptrade } from "snaptrade-typescript-sdk";

export const getSnaptrade = (env: Bindings) =>
  new Snaptrade({
    clientId: env.SNAPTRADE_CLIENT_ID,
    consumerKey: env.SNAPTRADE_CLIENT_SECRET,
  });
