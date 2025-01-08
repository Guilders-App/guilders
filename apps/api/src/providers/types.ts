import type { Bindings } from "@/common/variables";
import type { Account, Institution } from "@/types";
import type { DatabaseClient } from "@guilders/database/types";

export type Providers = "SnapTrade" | "EnableBanking";

export type ProviderInstitution = Omit<Institution, "id" | "provider_id">;

export type ProviderParams = {
  provider: Providers;
  supabase: DatabaseClient;
  env: Bindings;
};

export type ConnectionParams = {
  userId: string;
  providerInstitutionId: string;
  userSecret?: string; // SnapTrade
  connectionId?: string; // SnapTrade
  institutionId?: string; // EnableBanking
};

export type AccountParams = {
  userId: string;
  connectionId: string;
};

export interface IProvider {
  readonly name: Providers;
  getInstitutions: () => Promise<ProviderInstitution[]>;
  registerUser: (userId: string) => Promise<RegisterUserResult>;
  deregisterUser: (userId: string) => Promise<DeregisterUserResult>;
  connect: (params: ConnectionParams) => Promise<ConnectResult>;
  reconnect: (params: ConnectionParams) => Promise<ReconnectResult>;
  refreshConnection: (
    userId: string,
    userSecret: string,
    connectionId: string,
  ) => Promise<RefreshConnectionResult>;
  getAccounts: (params: AccountParams) => Promise<Account[]>;
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
