import { Tables } from "@/lib/db/database.types";

export interface ConnectionResult {
  success: boolean;
  error?: string;
  data?: Tables<"provider_connection">;
}

export interface ConnectionProviderFunction {
  (userId: string): Promise<ConnectionResult>;
}
