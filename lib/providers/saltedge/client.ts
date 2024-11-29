import * as crypto from "crypto";
import {
  Account,
  Country,
  CreateConnectionRequest,
  CreateConnectionResponse,
  Customer,
  Provider,
  RemoveCustomerResponse,
  SaltEdgeConfig,
  SaltEdgeResponse,
  SignedHeaders,
  Transaction,
} from "./types";

export class SaltEdgeClient {
  private baseUrl: string;
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  constructor(private config: SaltEdgeConfig) {
    this.baseUrl = config.baseUrl || "https://www.saltedge.com/api/v6";
  }

  private async getPrivateKey(): Promise<string> {
    if (!this.privateKey) {
      this.privateKey = process.env.SALTEDGE_PRIVATE_KEY;
    }
    return this.privateKey;
  }

  private async getPublicKey(): Promise<string> {
    if (!this.publicKey) {
      this.publicKey = process.env.SALTEDGE_PUBLIC_KEY;
    }
    return this.publicKey!;
  }

  private async getSignedHeaders(
    url: string,
    method: string,
    body?: any
  ): Promise<SignedHeaders> {
    // Clean URL: remove trailing slash and empty query parameters
    const cleanUrl = url.replace(/\/+$/, "").replace(/\?$/, "");
    const expiresAt = Math.floor(Date.now() / 1000 + 60);
    const bodyStr = body ? JSON.stringify({ data: body }) : "";
    const payload = `${expiresAt}|${method}|${cleanUrl}|${bodyStr}`;
    const privateKey = await this.getPrivateKey();
    const signer = crypto.createSign("SHA256");
    signer.update(payload, "utf8");
    const signature = signer.sign(privateKey, "base64");

    return {
      Accept: "application/json",
      "App-id": this.config.appId,
      "Content-Type": "application/json",
      "Expires-at": expiresAt.toString(),
      Secret: this.config.secret,
      Signature: signature,
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit & {
      params?: Record<string, any>;
      data?: any;
      isArray?: boolean;
    } = {}
  ): Promise<T> {
    const { params, data, isArray = false, ...fetchOptions } = options;
    let allData: any[] = [];
    let currentFromId: string | null = null;

    do {
      const queryParams: Record<string, any> = {
        ...params,
        ...(currentFromId ? { from_id: currentFromId } : {}),
      };

      const queryString = queryParams
        ? "?" + new URLSearchParams(queryParams).toString()
        : "";
      const url = `${this.baseUrl}${path}${queryString}`;

      const method = options.method || "GET";
      const headers = await this.getSignedHeaders(url, method, data);

      const response = await fetch(url, {
        ...fetchOptions,
        body: data ? JSON.stringify({ data: data }) : undefined,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        console.error(await response.json());
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SaltEdgeResponse<T> = await response.json();
      allData = allData.concat(result.data);
      currentFromId = result.meta?.next_id || null;
    } while (currentFromId);

    return isArray ? (allData as T) : (allData[0] as T);
  }

  // Countries
  async getCountries(): Promise<Country[]> {
    return this.request<Country[]>("/countries");
  }

  // Providers
  async getProviders(countryCode?: string): Promise<Provider[]> {
    return this.request<Provider[]>("/providers", {
      params: {
        exclude_inactive: true,
        ...(countryCode ? { country_code: countryCode } : {}),
      },
      isArray: true,
    });
  }

  // Customers
  async createCustomer(identifier: string): Promise<Customer> {
    return this.request<Customer>("/customers", {
      method: "POST",
      data: { identifier },
      isArray: false,
    });
  }

  async getCustomers(): Promise<Customer[]> {
    return this.request<Customer[]>("/customers", {
      isArray: true,
    });
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return this.request<Customer>(`/customers/${customerId}`, {
      isArray: false,
    });
  }

  async removeCustomer(customerId: string): Promise<RemoveCustomerResponse> {
    return this.request<RemoveCustomerResponse>(`/customers/${customerId}`, {
      method: "DELETE",
      isArray: false,
    });
  }

  async createConnection(
    customerId: string,
    institutionId: string,
    customFields?: Record<string, any>
  ): Promise<CreateConnectionResponse> {
    return this.request<CreateConnectionResponse>("/connections/connect", {
      method: "POST",
      data: {
        customer_id: customerId,
        provider: {
          code: institutionId,
        },
        consent: {
          scopes: ["accounts", "transactions"],
        },
        kyc: {
          type_of_account: "personal",
        },
        widget: {
          javascript_callback_type: "post_message",
        },
        attempt: {
          custom_fields: customFields,
        },
      } as CreateConnectionRequest,
      isArray: false,
    });
  }

  async removeConnection(connectionId: string): Promise<void> {
    return this.request<void>(`/connections/${connectionId}`, {
      method: "DELETE",
      isArray: false,
    });
  }

  async getAccounts(
    customerId: string,
    connectionId: string
  ): Promise<Account[]> {
    return this.request<Account[]>(`/accounts`, {
      params: {
        customer_id: customerId,
        connection_id: connectionId,
      },
      isArray: true,
    });
  }

  async getTransactions(
    connectionId: string,
    accountId: string
  ): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/transactions`, {
      params: {
        connection_id: connectionId,
        account_id: accountId,
      },
      isArray: true,
    });
  }
}

export const providerName = "SaltEdge";

export const saltedge = new SaltEdgeClient({
  appId: process.env.SALTEDGE_CLIENT_ID,
  secret: process.env.SALTEDGE_CLIENT_SECRET,
});
