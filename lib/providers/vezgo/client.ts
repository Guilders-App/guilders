import Vezgo from "vezgo-sdk-js";

export const providerName = "Vezgo";

export const vezgo = Vezgo.init({
  clientId: process.env.VEZGO_CLIENT_ID,
  secret: process.env.VEZGO_CLIENT_SECRET,
  hideWalletConnectWallets: false,
});
