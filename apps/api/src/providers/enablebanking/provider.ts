import type { Bindings } from "@/common/variables";
import type {
  ConnectResult,
  DeregisterUserResult,
  IProvider,
  ProviderInstitution,
  Providers,
  RefreshConnectionResult,
  RegisterUserResult,
} from "../types";
import { EnableBankingClient } from "./client";

export class EnableBankingProvider implements IProvider {
  readonly name: Providers = "EnableBanking";
  private readonly client: EnableBankingClient;
  private readonly apiUrl: string;

  constructor(env: Bindings) {
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

  async connect(
    userId: string,
    userSecret: string,
    institutionId: string,
  ): Promise<ConnectResult> {
    const { maximum_consent_validity, country, name } =
      this.getInstitutionDetails(institutionId);

    if (!maximum_consent_validity || !country || !name) {
      throw new Error("Invalid institution ID format");
    }

    const authorization = await this.client.createAuthorization({
      validUntil: maximum_consent_validity,
      aspspName: name,
      aspspCountry: country,
      redirectUrl: `${this.apiUrl}/callback/providers/enablebanking`,
      state: "returned",
      userId: userId,
    });

    return {
      success: true,
      data: {
        redirectURI: authorization.url,
      },
    };
  }

  async reconnect(
    userId: string,
    userSecret: string,
    institutionId: string,
    connectionId: string,
  ): Promise<RefreshConnectionResult> {
    throw new Error("Not implemented");
  }

  async refreshConnection(
    userId: string,
    userSecret: string,
    connectionId: string,
  ): Promise<RefreshConnectionResult> {
    throw new Error("Not implemented");
  }
}
