function base64UrlEncode(data: unknown): string {
  return Buffer.from(JSON.stringify(data))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Handle both raw PEM and escaped newline format
  const normalizedPem = pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;

  const base64 = normalizedPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");

  return Buffer.from(base64, "base64").buffer;
}

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
  private cryptoKey: CryptoKey | null = null;

  constructor(
    private readonly clientId: string,
    private readonly privateKey: string,
  ) {}

  private async getCryptoKey(): Promise<CryptoKey> {
    if (this.cryptoKey) return this.cryptoKey;

    const privateKeyBuffer = pemToArrayBuffer(this.privateKey);

    try {
      this.cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        {
          name: "RSASSA-PKCS1-v1_5",
          hash: { name: "SHA-256" },
        },
        false,
        ["sign"],
      );

      return this.cryptoKey;
    } catch (error) {
      console.error("Failed to import private key:", error);
      throw new Error("Failed to initialize crypto key");
    }
  }

  private async generateJWT(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.jwt && this.jwtExpiry > now + 300) return this.jwt;

    const header = base64UrlEncode({
      typ: "JWT",
      alg: "RS256",
      kid: this.clientId,
    });

    const payload = base64UrlEncode({
      iss: "enablebanking.com",
      aud: "api.enablebanking.com",
      iat: now,
      exp: now + 3600,
    });

    const signatureInput = `${header}.${payload}`;
    const data = new TextEncoder().encode(signatureInput);
    const key = await this.getCryptoKey();
    const signatureBuffer = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      data,
    );

    // Convert the signature to base64url format
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureBase64 = Buffer.from(signatureBytes).toString("base64");
    const signature = signatureBase64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

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
