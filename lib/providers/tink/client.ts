import {
  AccessTokenType,
  ListProvidersResponse,
  OAuth2AuthenticationTokenResponse,
  TinkClientConfig,
  TinkScope,
} from "./types";

export const providerName = "Tink";

const baseScopes: TinkScope = [
  "authorization:grant", // Required for /api/v1/oauth/authorization-grant and /api/v1/oauth/token
  "credentials:read", // Required for /api/v1/providers
  "providers:read", // Required for /api/v1/providers/{market}
  "user:create", // Required for /api/v1/user/create
];

export class TinkClient {
  private config: TinkClientConfig;
  private accessToken?: string;

  constructor(config: TinkClientConfig) {
    this.config = {
      baseURL: "https://api.tink.com",
      scopes: baseScopes,
      ...config,
    };
  }

  private async request<T>(
    endpoint: string,
    accessTokenType: AccessTokenType = "CLIENT",
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    const token = await this.ensureAccessToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.accessToken = undefined;
      }
      console.error("HTTP error!", await response.json());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // TODO: Cache the access token
  private async ensureAccessToken(
    accessTokenType: AccessTokenType = "CLIENT"
  ): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (accessTokenType === "CLIENT") {
      const response = await fetch(
        `${this.config.baseURL}/api/v1/oauth/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            grant_type: "client_credentials",
            scope: this.config.scopes?.join(",") || "",
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to obtain access token", await response.json());
        throw new Error("Failed to obtain access token");
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      if (!this.accessToken) {
        console.error("Failed to obtain access token", data);
        throw new Error("Failed to obtain access token");
      }

      return this.accessToken;
    }

    throw new Error("Not implemented yet");
  }

  // public async createAuthorization(params: {
  //   external_user_id: string;
  //   scope: string;
  // }): Promise<OAuth2AuthorizeResponse> {
  //   return this.request<OAuth2AuthorizeResponse>(
  //     "/api/v1/oauth/authorization-grant",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       },
  //       body: new URLSearchParams(params),
  //     }
  //   );
  // }

  public async getAccessToken(params: {
    client_id: string;
    client_secret?: string;
    grant_type:
      | "authorization_code"
      | "client_credentials"
      | "urn:ietf:params:oauth:grant-type:jwt-bearer";
    code?: string;
    scope?: string;
    assertion?: string;
  }): Promise<OAuth2AuthenticationTokenResponse> {
    const response = await fetch(`${this.config.baseURL}/api/v1/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      throw new Error("Failed to obtain access token");
    }

    return response.json();
  }

  public async revokeAllTokens(params: {
    user_id?: string;
    external_user_id?: string;
  }): Promise<void> {
    await this.request("/api/v1/oauth/revoke-all", "CLIENT", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params),
    });
  }

  public async getProviders(market: string): Promise<ListProvidersResponse> {
    return this.request<ListProvidersResponse>(
      `/api/v1/providers/${market}?includeTestProviders=true`,
      "CLIENT"
    );
  }
}
