import type { Bindings } from "@/common/variables";
import type { DatabaseClient } from "@guilders/database/types";
import { EnableBankingProvider } from "./enablebanking/provider";
import { SnapTradeProvider } from "./snaptrade/provider";
import type { IProvider, Providers } from "./types";

export const getProvider = (
  provider: Providers,
  supabase: DatabaseClient,
  env: Bindings,
): IProvider => {
  switch (provider) {
    case "SnapTrade":
      return new SnapTradeProvider(supabase, env);
    case "EnableBanking":
      return new EnableBankingProvider(supabase, env);
    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
};
