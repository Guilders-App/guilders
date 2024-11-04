export interface ConnectionResult {
  success: boolean;
  error?: string;
}

export interface ConnectionProviderFunction {
  (userId: string): Promise<ConnectionResult>;
}
