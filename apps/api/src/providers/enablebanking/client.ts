import { createSign } from "node:crypto";
import type {
  ASPSP,
  AuthorizeSessionResponse,
  StartAuthorizationRequest,
  StartAuthorizationResponse,
} from "./types";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  searchParams?: Record<string, string>;
};

type RequestConfig = {
  endpoint: string;
  returnType: "single" | "array";
  dataField?: string;
  options?: RequestOptions;
};

export class EnableBankingClient {
  private readonly baseUrl = "https://api.enablebanking.com";
  private jwt: string | null = null;
  private jwtExpiry = 0;

  constructor(
    private readonly clientId: string,
    private readonly privateKey: string,
  ) {}

  private async generateJWT(): Promise<string> {
    const now = Math.floor(new Date().getTime() / 1000);

    if (this.jwt && this.jwtExpiry > now + 300) {
      return this.jwt;
    }

    const base64 = (data: unknown) =>
      Buffer.from(JSON.stringify(data)).toString("base64").replace(/=+$/, "");

    const header = base64({
      alg: "RS256",
      typ: "JWT",
      kid: this.clientId,
    });

    const payload = base64({
      iss: "enablebanking.com",
      aud: "api.enablebanking.com",
      iat: now,
      exp: now + 3600,
    });

    const signatureInput = `${header}.${payload}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signatureInput);
    const signature = signer.sign(this.privateKey, "base64url");

    this.jwt = `${header}.${payload}.${signature}`;
    this.jwtExpiry = now + 3600;

    return this.jwt;
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const { endpoint, returnType, dataField, options = {} } = config;
    const { method = "GET", body, searchParams } = options;

    const jwt = await this.generateJWT();
    const url = new URL(endpoint, this.baseUrl);

    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        url.searchParams.append(key, value);
      }
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(
        `EnableBanking API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    const resultData = dataField ? data[dataField] : data;

    // Handle array vs single object responses
    if (returnType === "array" && !Array.isArray(resultData)) {
      return [resultData] as T;
    }

    return resultData as T;
  }

  // Example method for getting ASPSPs (banks)
  async getASPSPs() {
    return this.request<ASPSP[]>({
      endpoint: "/aspsps",
      returnType: "array",
      dataField: "aspsps",
    });
  }

  async createAuthorization(params: {
    validUntil: string;
    aspspName: string;
    aspspCountry: string;
    redirectUrl: string;
    state: string;
    userId: string;
  }) {
    return this.request<StartAuthorizationResponse>({
      endpoint: "/auth",
      returnType: "single",
      options: {
        method: "POST",
        body: {
          access: {
            valid_until: params.validUntil,
          },
          aspsp: {
            name: params.aspspName,
            country: params.aspspCountry,
          },
          redirect_url: params.redirectUrl,
          state: params.state,
          psu_id: params.userId,
        } as StartAuthorizationRequest,
      },
    });
  }

  async authorizeSession(params: {
    code: string;
  }) {
    return this.request<AuthorizeSessionResponse>({
      endpoint: "/sessions",
      returnType: "single",
      options: {
        method: "POST",
        body: {
          code: params.code,
        },
      },
    });
  }
}
