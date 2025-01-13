import type { Bindings } from "@/common/variables";
import type { Account } from "@/types";
import type { DatabaseClient } from "@guilders/database/types";
import type {
  AccountParams,
  ConnectResult,
  ConnectionParams,
  DeregisterUserResult,
  IProvider,
  ProviderInstitution,
  Providers,
  ReconnectResult,
  RefreshConnectionResult,
  RegisterUserResult,
} from "../types";
import { EnableBankingClient } from "./client";
import type { ConnectionState } from "./types";

export class EnableBankingProvider implements IProvider {
  readonly name: Providers = "EnableBanking";
  private readonly client: EnableBankingClient;
  private readonly supabase: DatabaseClient;
  private readonly apiUrl: string;

  constructor(supabase: DatabaseClient, env: Bindings) {
    this.supabase = supabase;
    this.client = new EnableBankingClient(
      env.ENABLEBANKING_CLIENT_ID,
      env.ENABLEBANKING_CLIENT_PRIVATE_KEY,
    );
    this.apiUrl = env.API_URL;
  }

  async getInstitutions() {
    const aspsps = await this.client.getASPSPs();

    const entries: ProviderInstitution[] = aspsps.map((aspsp) => ({
      provider_institution_id: `${aspsp.name}-${aspsp.country}-${aspsp.maximum_consent_validity}`,
      name: aspsp.name,
      logo_url: aspsp.logo,
      enabled: true,
      country: aspsp.country,
    }));

    return entries;
  }

  async registerUser(userId: string): Promise<RegisterUserResult> {
    throw new Error("Not implemented");
  }

  async deregisterUser(userId: string): Promise<DeregisterUserResult> {
    throw new Error("Not implemented");
  }

  private getInstitutionDetails(institutionId: string) {
    const parts = institutionId.split("-");
    const maximum_consent_validity_str = parts.pop() ?? null;
    const maximum_consent_validity = maximum_consent_validity_str
      ? new Date(
          Date.now() + Number.parseInt(maximum_consent_validity_str) * 1000,
        )
          .toISOString()
          .replace("Z", "+00:00")
      : null;
    const country = parts.pop() ?? null;
    const name = parts.join("-");

    return {
      maximum_consent_validity,
      country,
      name,
    };
  }

  async connect(params: ConnectionParams): Promise<ConnectResult> {
    if (!params.institutionId) {
      throw new Error("Institution ID is required");
    }

    const { maximum_consent_validity, country, name } =
      this.getInstitutionDetails(params.providerInstitutionId);

    if (!maximum_consent_validity || !country || !name) {
      throw new Error("Invalid institution ID format");
    }

    const state: ConnectionState = {
      userId: params.userId,
      institutionId: params.institutionId,
    };

    const authorization = await this.client.createAuthorization({
      validUntil: maximum_consent_validity,
      aspspName: name,
      aspspCountry: country,
      redirectUrl: `${this.apiUrl}/callback/providers/enablebanking`,
      state: JSON.stringify(state),
      userId: params.userId,
    });

    return {
      success: true,
      data: {
        redirectURI: authorization.url,
      },
    };
  }

  async reconnect(params: ConnectionParams): Promise<ReconnectResult> {
    return this.connect(params);
  }

  async refreshConnection(
    userId: string,
    userSecret: string,
    connectionId: string,
  ): Promise<RefreshConnectionResult> {
    throw new Error("Not implemented");
  }

  async getAccounts(params: AccountParams): Promise<Account[]> {
    return [];
  }
}
