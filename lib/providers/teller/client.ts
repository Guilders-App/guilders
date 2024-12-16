import {
  AuthenticatedRequest,
  DisconnectAccountRequest,
  GetAccountBalanceRequest,
  GetAccountBalanceResponse,
  GetAccountsResponse,
  GetInstitutionsResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  TellerConfig,
} from "./types";

export class TellerApi {
  private baseUrl: string;

  constructor(private config: TellerConfig) {
    this.baseUrl = config.baseUrl || "https://api.teller.io";
  }

  async getHealthCheck() {
    try {
      await fetch(`${this.baseUrl}/health`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAccounts({
    accessToken,
  }: AuthenticatedRequest): Promise<GetAccountsResponse> {
    const accounts: GetAccountsResponse = await this.#get(
      "/accounts",
      accessToken
    );

    return Promise.all(
      accounts?.map(async (account) => {
        const balance = await this.getAccountBalance({
          accountId: account.id,
          accessToken,
        });

        return { ...account, balance };
      })
    );
  }

  async getTransactions({
    accountId,
    accessToken,
    latest,
    count,
  }: GetTransactionsRequest): Promise<GetTransactionsResponse> {
    const result = await this.#get<GetTransactionsResponse>(
      `/accounts/${accountId}/transactions`,
      accessToken,
      {
        count: latest ? 100 : count,
      }
    );

    // NOTE: Remove pending transactions until upsert issue is fixed
    return result.filter((transaction) => transaction.status !== "pending");
  }

  async getAccountBalance({
    accountId,
    accessToken,
  }: GetAccountBalanceRequest): Promise<GetAccountBalanceResponse> {
    const transactions = await this.getTransactions({
      accountId,
      accessToken,
      count: 20,
    });

    const amount = transactions.find(
      (transaction) => transaction.running_balance !== null
    )?.running_balance;

    return {
      currency: "USD",
      amount: +(amount ?? 0),
    };
  }

  async getInstitutions(): Promise<GetInstitutionsResponse> {
    return this.#get("/institutions");
  }

  async deleteAccounts({
    accessToken,
  }: DisconnectAccountRequest): Promise<void> {
    await fetch(`${this.baseUrl}/accounts`, {
      method: "delete",
      headers: new Headers({
        Authorization: `Basic ${btoa(`${accessToken}:`)}`,
      }),
    });
  }

  async #get<TResponse>(
    path: string,
    token?: string,
    params?: Record<string, string | number | undefined>
  ): Promise<TResponse> {
    const url = new URL(`${this.baseUrl}/${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) {
          url.searchParams.append(key, value.toString());
        }
      }
    }

    return <TResponse>fetch(url.toString(), {
      headers: new Headers({
        Authorization: `Basic ${btoa(`${token}:`)}`,
      }),
      ...{
        cert: this.config.certificate.cert,
        key: this.config.certificate.key,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const error = data.error;

        if (error) {
          throw new Error(error);
        }

        return data as TResponse;
      });
  }
}

export const teller = new TellerApi({
  baseUrl: "https://api.teller.io",
  certificate: {
    cert: process.env.TELLER_CERTIFICATE,
    key: process.env.TELLER_PRIVATE_KEY,
  },
});
