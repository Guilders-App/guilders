import type { Institution } from "@/types";
import type { Tables } from "@guilders/database/types";

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
}

export type RegisterUserResult = {
  success: boolean;
  error?: string;
  data?: {
    userId: string;
    userSecret: string;
  };
};

export type DeregisterUserResult = {
  success: boolean;
  error?: string;
};

export interface ConnectionResult {
  success: boolean;
  error?: string;
  data?: Tables<"provider_connection">;
}
export type ConnectionProviderFunction = (
  userId: string,
) => Promise<ConnectionResult>;
