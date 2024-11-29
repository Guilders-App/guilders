import { z } from "zod";
import { Account, Provider, Transaction } from "./types";

export const providerName = "Vezgo";

const AuthResponseSchema = z.object({
  token: z.string(),
});

export class VezgoClient {
  private baseUrl = "https://api.vezgo.com/v1";
  private connectUrl = "https://connect.vezgo.com";
  private clientId: string;
  private clientSecret: string;
  private token: string | null = null;

  constructor(clientId: string, clientSecret: string) {
    if (!clientId || !clientSecret) {
      throw new Error("Vezgo client ID and secret are required");
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getHeaders(userId?: string): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (userId) {
      const token = await this.getToken(userId);
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async getToken(userId: string): Promise<string> {
    if (this.token) return this.token;

    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        loginName: userId,
      },
      body: JSON.stringify({
        clientId: this.clientId,
        secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get auth token: ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = AuthResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error("Invalid auth response from Vezgo");
    }

    this.token = parsed.data.token;
    return this.token;
  }

  // Connect URL
  getConnectUrl(userId: string, institutionId?: string): string {
    const url = `${this.connectUrl}/connect${
      institutionId ? `/${institutionId}` : ""
    }?clientId=${this.clientId}&token=${this.getToken(userId)}`;

    return url;
  }

  // Accounts
  async getAccounts(userId: string): Promise<Account[]> {
    const response = await fetch(`${this.baseUrl}/accounts`, {
      headers: await this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`Failed to get accounts: ${response.statusText}`);
    }

    return response.json();
  }

  async addAccount(userId: string, accountId: string): Promise<void> {
    // POST /accounts
    throw new Error("Enterprise feature not implemented yet");
  }

  async getAccount(userId: string, accountId: string): Promise<Account> {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
      headers: await this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`Failed to get account: ${response.statusText}`);
    }

    return response.json();
  }

  async updateAccount(userId: string, accountId: string): Promise<void> {
    // PUT /accounts/{accountId}
    throw new Error("Enterprise feature not implemented yet");
  }

  async removeAccount(userId: string, accountId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
      method: "DELETE",
      headers: await this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove account: ${response.statusText}`);
    }
  }

  async pollAccount(userId: string, accountId: string): Promise<void> {
    // GET /accounts/{accountId}/poll
    throw new Error("Enterprise feature not implemented yet");
  }

  // Account data is updated asynchronously, most of the time it's not available immediately
  async syncAccount(userId: string, accountId: string): Promise<Account> {
    const response = await fetch(`${this.baseUrl}/accounts/${accountId}/sync`, {
      headers: await this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync account: ${response.statusText}`);
    }

    return response.json();
  }

  async getBalanceHistory(userId: string, accountId: string): Promise<void> {
    // GET /accounts/{accountId}/history
    throw new Error("Feature not implemented yet");
  }

  // Transactions
  async getTransactions(
    userId: string,
    accountId: string
  ): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    let lastTransactionId: string | undefined;

    while (true) {
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}/transactions?from=2005-01-01&limit=100${lastTransactionId ? `&last=${lastTransactionId}` : ""}`,
        {
          headers: await this.getHeaders(userId),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      const transactions: Transaction[] = await response.json();

      if (transactions.length === 0) {
        break;
      }

      allTransactions.push(...transactions);

      if (transactions.length < 100) {
        break;
      }

      lastTransactionId = transactions[transactions.length - 1].id;
    }

    return allTransactions;
  }

  async getTransaction(
    userId: string,
    accountId: string,
    transactionId: string
  ): Promise<Transaction> {
    const response = await fetch(
      `${this.baseUrl}/accounts/${accountId}/transactions/${transactionId}`,
      {
        headers: await this.getHeaders(userId),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get transaction: ${response.statusText}`);
    }

    return response.json();
  }

  // Orders
  async getOrders(userId: string, accountId: string): Promise<any[]> {
    // GET /accounts/{accountId}/orders
    // Only available to Binance, needs to be enabled by Vezgo
    throw new Error("Feature not implemented yet");
  }

  async getOrder(
    userId: string,
    accountId: string,
    orderId: string
  ): Promise<any> {
    // GET /accounts/{accountId}/orders/{orderId}
    // Only available to Binance, needs to be enabled by Vezgo
    throw new Error("Feature not implemented yet");
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    const response = await fetch(`${this.baseUrl}/providers`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get providers: ${response.statusText}`);
    }

    return response.json();
  }

  async getProvider(providerId: string): Promise<Provider> {
    const response = await fetch(`${this.baseUrl}/providers/${providerId}`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get provider: ${response.statusText}`);
    }

    return response.json();
  }

  // Users
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/users/me`, {
      method: "DELETE",
      headers: await this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }
}

export const vezgoClient = new VezgoClient(
  process.env.VEZGO_CLIENT_ID,
  process.env.VEZGO_CLIENT_SECRET
);
