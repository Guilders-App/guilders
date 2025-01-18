import type { Bindings } from "@/common/variables";
import { EnableBankingClient } from "@/providers/enablebanking/client";
import { EnableBankingProvider } from "@/providers/enablebanking/provider";
import { createClient } from "@guilders/database/server";

const supabase = await createClient({
  admin: true,
  ssr: false,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  url: process.env.SUPABASE_URL!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

const enablebankingProvider = new EnableBankingProvider(
  supabase,
  process.env as Bindings,
);

const enablebankingClient = new EnableBankingClient(
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  process.env.ENABLEBANKING_CLIENT_ID!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  process.env.ENABLEBANKING_CLIENT_PRIVATE_KEY!,
);

const connect = async (userId: string, institutionId: number) => {
  const result = await enablebankingProvider.connect({
    userId,
    institutionId,
  });

  console.log(result);
};

const getSession = async (sessionId: string) => {
  const result = await enablebankingClient.getSession({
    sessionId,
  });

  console.log(result);
};

const getAccountBalances = async (accountId: string) => {
  const result = await enablebankingClient.getAccountBalances({
    accountId,
  });

  console.log(result);
};

const getAccountDetails = async (accountId: string) => {
  const result = await enablebankingClient.getAccountDetails({
    accountId,
  });

  console.log(result);
};

const getAccounts = async (userId: string, connectionId: number) => {
  const result = await enablebankingProvider.getAccounts({
    userId,
    connectionId,
  });

  console.log(result);
};

const getAccountTransactions = async (userId: string, accountId: string) => {
  // const result = await enablebankingClient.getAccountTransactions({
  //   accountId,
  // });
  const result = await enablebankingProvider.getTransactions({
    userId,
    accountId,
  });

  console.log(result);
};

// const userId = "c95a25ff-fa95-4c1c-a06a-08886e86f261";
const userId = "bc7214a2-54c5-4a32-83fa-ae4246a4cc45";
const institutionId = 833;
const sessionId = "1421c724-1dad-452f-801a-169268b789ac";
const accountId = "56a5d057-845e-4dc7-a132-8e400c1e325a";
connect(userId, institutionId);
// getSession(sessionId);
// getAccountBalances(accountId);
// getAccounts(userId, sessionId);
// getAccountDetails(accountId);
// getAccountTransactions(userId, accountId);
