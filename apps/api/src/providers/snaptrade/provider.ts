import type { Bindings } from "@/common/variables";
import type { TransactionInsert } from "@/types";
import type { DatabaseClient } from "@guilders/database/types";
import { Snaptrade } from "snaptrade-typescript-sdk";
import type {
  AccountParams,
  ConnectResult,
  ConnectionParams,
  DeregisterUserResult,
  IProvider,
  ProviderAccount,
  ProviderInstitution,
  Providers,
  ReconnectResult,
  RefreshConnectionResult,
  RegisterUserResult,
  TransactionParams,
} from "../types";

export class SnapTradeProvider implements IProvider {
  readonly name: Providers = "SnapTrade";
  private readonly client: Snaptrade;
  private readonly supabase: DatabaseClient;

  constructor(supabase: DatabaseClient, env: Bindings) {
    this.supabase = supabase;
    this.client = new Snaptrade({
      clientId: env.SNAPTRADE_CLIENT_ID,
      consumerKey: env.SNAPTRADE_CLIENT_SECRET,
    });
  }

  async getInstitutions() {
    const brokerages = await this.client.referenceData.listAllBrokerages();

    const entries: ProviderInstitution[] = brokerages.data
      .filter(
        (
          institution,
        ): institution is typeof institution & {
          id: string;
          name: string;
          aws_s3_square_logo_url: string;
          enabled: boolean;
        } =>
          Boolean(
            institution.id &&
              institution.name &&
              institution.aws_s3_square_logo_url &&
              institution.enabled,
          ),
      )
      .map((institution) => ({
        provider_institution_id: institution.id,
        name: institution.name,
        logo_url: institution.aws_s3_square_logo_url,
        enabled: institution.enabled,
        country: null,
      }));

    return entries;
  }

  async registerUser(userId: string): Promise<RegisterUserResult> {
    try {
      const response = await this.client.authentication.registerSnapTradeUser({
        userId,
      });

      if (
        !response ||
        response.status !== 200 ||
        !response.data ||
        !response.data.userId ||
        !response.data.userSecret
      ) {
        return {
          success: false,
          error: "Failed to register user",
        };
      }

      return {
        success: true,
        data: {
          userId: response.data.userId,
          userSecret: response.data.userSecret,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to register user",
      };
    }
  }

  async deregisterUser(userId: string): Promise<DeregisterUserResult> {
    try {
      const response = await this.client.authentication.deleteSnapTradeUser({
        userId,
      });

      if (!response || response.status !== 200) {
        return {
          success: false,
          error: "Failed to deregister user",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to deregister user",
      };
    }
  }

  async connect(params: ConnectionParams): Promise<ConnectResult> {
    if (!params.institutionId) {
      return {
        success: false,
        error: "Institution ID is required",
      };
    }

    try {
      const { data: provider, error: providerError } = await this.supabase
        .from("provider")
        .select("*")
        .eq("name", this.name)
        .single();

      if (providerError || !provider) {
        return {
          success: false,
          error: "Provider not found",
        };
      }

      const { data: providerConnection } = await this.supabase
        .from("provider_connection")
        .select("*")
        .eq("provider_id", provider.id)
        .eq("user_id", params.userId)
        .single();

      let userSecret = providerConnection?.secret;

      if (!userSecret) {
        const registerResult = await this.registerUser(params.userId);
        if (!registerResult.success || !registerResult.data?.userSecret) {
          return {
            success: false,
            error: "Failed to register user with provider",
          };
        }

        const { error: insertError } = await this.supabase
          .from("provider_connection")
          .insert({
            provider_id: provider.id,
            user_id: params.userId,
            secret: registerResult.data.userSecret,
          });

        if (insertError) {
          return {
            success: false,
            error: "Failed to save provider connection",
          };
        }

        userSecret = registerResult.data.userSecret;
      }

      const { data: institution, error: institutionError } = await this.supabase
        .from("institution")
        .select("*")
        .eq("id", Number(params.institutionId))
        .single();

      if (institutionError || !institution) {
        return {
          success: false,
          error: "Institution not found",
        };
      }

      const brokerages = await this.client.referenceData.listAllBrokerages();
      const brokerage = brokerages.data?.find(
        (brokerage) => brokerage.id === institution.provider_institution_id,
      );

      if (!brokerage) {
        return {
          success: false,
          error: "Institution not found",
        };
      }

      const response = await this.client.authentication.loginSnapTradeUser({
        userId: params.userId,
        userSecret,
        broker: brokerage?.slug,
        reconnect: params.connectionId,
      });

      if (
        !response.data ||
        !("redirectURI" in response.data) ||
        !response.data.redirectURI
      ) {
        return {
          success: false,
          error: "Failed to generate redirect URL",
        };
      }

      return {
        success: true,
        data: {
          redirectURI: response.data.redirectURI,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to connect to provider",
      };
    }
  }

  async reconnect(params: ConnectionParams): Promise<ReconnectResult> {
    return this.connect(params);
  }

  async refreshConnection(
    userId: string,
    userSecret: string,
    connectionId: string,
  ): Promise<RefreshConnectionResult> {
    try {
      const response =
        await this.client.connections.refreshBrokerageAuthorization({
          authorizationId: connectionId,
          userId: userId,
          userSecret: userSecret,
        });

      if (response.status !== 200) {
        return {
          success: false,
          error: "Failed to refresh SnapTrade connection",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to refresh SnapTrade connection",
      };
    }
  }

  async getAccounts(params: AccountParams): Promise<ProviderAccount[]> {
    throw new Error("Not implemented");
  }

  async getTransactions(
    params: TransactionParams,
  ): Promise<TransactionInsert[]> {
    throw new Error("Not implemented");
  }
}
