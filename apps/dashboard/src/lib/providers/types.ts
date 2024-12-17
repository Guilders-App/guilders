import type { Tables } from "@guilders/database/types";

export interface ConnectionResult {
  success: boolean;
  error?: string;
  data?: Tables<"provider_connection">;
}

export type ConnectionProviderFunction = (
  userId: string,
) => Promise<ConnectionResult>;
