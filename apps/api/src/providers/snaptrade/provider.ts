import type { Bindings } from "@/common/variables";
import { Snaptrade } from "snaptrade-typescript-sdk";
import type {
  ConnectResult,
  DeregisterUserResult,
  IProvider,
  ProviderInstitution,
  Providers,
  RefreshConnectionResult,
  RegisterUserResult,
} from "../types";

export class SnapTradeProvider implements IProvider {
  readonly name: Providers = "SnapTrade";
  private readonly client: Snaptrade;

  constructor(env: Bindings) {
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

  async connect(
    userId: string,
    userSecret: string,
    institutionId: string,
    connectionId?: string,
  ): Promise<ConnectResult> {
    try {
      const brokerages = await this.client.referenceData.listAllBrokerages();
      const brokerage = brokerages.data?.find(
        (brokerage) => brokerage.id === institutionId,
      );

      if (!brokerage) {
        return {
          success: false,
          error: "Institution not found",
        };
      }

      const response = await this.client.authentication.loginSnapTradeUser({
        userId: userId,
        userSecret: userSecret,
        broker: brokerage?.slug,
        reconnect: connectionId,
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

  async reconnect(
    userId: string,
    userSecret: string,
    institutionId: string,
    connectionId: string,
  ): Promise<RefreshConnectionResult> {
    return this.connect(userId, userSecret, institutionId, connectionId);
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
}
