import type { Institution } from "@/types";

export type Providers = "SnapTrade";

export type ProviderInstitution = Omit<Institution, "id" | "provider_id">;

export type ProviderParams = {
  provider: Providers;
};

export interface IProvider {
  readonly name: Providers;
  getInstitutions: () => Promise<ProviderInstitution[]>;
  registerUser: (userId: string) => Promise<RegisterUserResult>;
  deregisterUser: (userId: string) => Promise<DeregisterUserResult>;
  connect: (
    userId: string,
    userSecret: string,
    institutionId: string,
  ) => Promise<ConnectResult>;
  reconnect: (
    userId: string,
    userSecret: string,
    institutionId: string,
    connectionId: string,
  ) => Promise<ReconnectResult>;
  refreshConnection: (
    userId: string,
    userSecret: string,
    connectionId: string,
  ) => Promise<RefreshConnectionResult>;
}

export type RegisterUserResult = {
  success: boolean;
  error?: string;
  data?: {
    userId: string;
    /*
    User secret is used to authenticate the user with the provider
    - Snaptrade = userSecret
    - EnableBanking = ? (session token maybe)
    */
    userSecret: string;
  };
};

export type DeregisterUserResult = {
  success: boolean;
  error?: string;
};

export type ConnectResult = {
  success: boolean;
  error?: string;
  data?: {
    redirectURI: string;
  };
};

export type ReconnectResult = ConnectResult;

export type RefreshConnectionResult = {
  success: boolean;
  error?: string;
};
