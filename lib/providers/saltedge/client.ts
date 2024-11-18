import * as crypto from "crypto";
import * as fs from "fs/promises";
import {
  Country,
  Customer,
  Provider,
  RemoveCustomerResponse,
  SaltEdgeConfig,
  SaltEdgeResponse,
  SignedHeaders,
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
      this.privateKey = await fs.readFile(this.config.privateKeyPath, "utf-8");
    }
    return this.privateKey;
  }

  private async getPublicKey(): Promise<string> {
    if (!this.publicKey && this.config.publicKeyPath) {
      this.publicKey = await fs.readFile(this.config.publicKeyPath, "utf-8");
    }
    return this.publicKey!;
  }

  private async getSignedHeaders(
    url: string,
    method: string,
    body?: any,
    file?: Buffer
  ): Promise<SignedHeaders> {
    const expiresAt = Math.floor(Date.now() / 1000 + 60);

    // Build payload with all required fields, separated by vertical bars
    const fileHash = file
      ? crypto.createHash("sha256").update(file).digest("hex")
      : "";

    const payload = [
      expiresAt,
      method,
      url,
      method === "POST" && body ? JSON.stringify(body) : "",
      fileHash,
    ].join("|");

    const privateKey = await this.getPrivateKey();
    const signer = crypto.createSign("sha256");
    signer.update(payload);
    signer.end();
    const signature = signer.sign(privateKey, "base64");

    return {
      Accept: "application/json",
      "App-id": this.config.appId,
      "Content-Type": "application/json",
      "Expires-at": expiresAt.toString(),
      Secret: this.config.secret,
      // Signature: signature, // TODO: Required for LIVE
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit & {
      params?: Record<string, any>;
      data?: any;
      file?: Buffer;
      isArray?: boolean;
    } = {}
  ): Promise<T> {
    const { params, data, file, isArray = false, ...fetchOptions } = options;
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
      const headers = await this.getSignedHeaders(url, method, data, file);

      const response = await fetch(url, {
        ...fetchOptions,
        body: data ? JSON.stringify({ data: data }) : undefined,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        console.error(response);
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
}

export const providerName = "SaltEdge";

export const saltedge = new SaltEdgeClient({
  appId: process.env.SALTEDGE_CLIENT_ID,
  secret: process.env.SALTEDGE_CLIENT_SECRET,
  privateKeyPath: "./security/saltedge/private.pem",
  publicKeyPath: "./security/saltedge/public.pem",
});
