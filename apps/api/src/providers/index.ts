import type { Bindings } from "@/common/variables";
import { EnableBankingProvider } from "./enablebanking/provider";
import { SnapTradeProvider } from "./snaptrade/provider";
import type { IProvider, Providers } from "./types";

export const getProvider = (provider: Providers, env: Bindings): IProvider => {
  switch (provider) {
    case "SnapTrade":
      return new SnapTradeProvider(env);
    case "EnableBanking":
      return new EnableBankingProvider(env);
    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
};
