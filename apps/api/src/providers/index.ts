import { SnapTradeProvider } from "./snaptrade/provider";
import type { IProvider, Providers } from "./types";

export const getProvider = (provider: Providers): IProvider => {
  switch (provider) {
    case "SnapTrade":
      return new SnapTradeProvider();
    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
};
