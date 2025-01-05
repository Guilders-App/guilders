import { env } from "bun";
import { Snaptrade } from "snaptrade-typescript-sdk";
import type {
  DeregisterUserResult,
  IProvider,
  ProviderInstitution,
  Providers,
  RegisterUserResult,
} from "../types";

export class SnapTradeProvider implements IProvider {
  readonly name: Providers = "SnapTrade";
  private readonly client: Snaptrade;

  constructor() {
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
}
