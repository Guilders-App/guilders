export interface TinkClientConfig {
  clientId: string;
  clientSecret: string;
  scopes?: string[];
  baseURL?: string;
}

export interface OAuth2AuthenticationTokenResponse {
  access_token: string;
  expires_in: number;
  id_hint?: string;
  refreshToken?: string;
  scope: string;
  token_type: string;
}

export interface OAuth2AuthorizeResponse {
  code: string;
}

export type AccessTokenType = "CLIENT" | "USER";

export type TinkScopes =
  | "calendar:read"
  | "user:read"
  | "authorization:grant"
  | "authorization:revoke"
  | "reports-generation-jobs:readonly"
  | "link-session:write"
  | "user:create"
  | "user:delete"
  | "user:write"
  | "balance-refresh"
  | "credentials:refresh"
  | "credentials:write"
  | "credentials:read"
  | "payment:read"
  | "providers:read"
  | "provider-consents:write"
  | "provider-consents:read"
  | "consents"
  | "consents:readonly"
  | "accounts:write"
  | "transactions:write"
  | "balances:read"
  | "accounts:read"
  | "account-verification-reports:read"
  | "business-account-verification-reports:read"
  | "identity:read"
  | "investments:read"
  | "transactions:read"
  | "transactions:categorize"
  | "accounts.balances:readonly"
  | "accounts.parties:readonly"
  | "identities:readonly"
  | "investment-accounts:readonly"
  | "loan-accounts:readonly"
  | "transaction-reports:readonly"
  | "enrichment.transactions:readonly"
  | "enrichment.transactions"
  | "enrichment.variable"
  | "enrichment.variable:readonly"
  | "enrichment.merchant"
  | "transactions.recurring:read"
  | "enrichment.sustainability"
  | "user:web_hooks"
  | "webhook-endpoints"
  | "insights:write"
  | "insights:read"
  | "budgets:write"
  | "budgets:read"
  | "budgets-bfm"
  | "cash-flow"
  | "financial-calendar"
  | "financial-calendar:readonly"
  | "savings-goals:write"
  | "savings-goals:read"
  | "statistics:read"
  | "subscriptions:read"
  | "merchants"
  | "merchants:readonly"
  | "bulk-payment:write"
  | "bulk-payment:read"
  | "payment:write"
  | "mandate-payments"
  | "mandate-payments:readonly"
  | "settlement-accounts"
  | "settlement-accounts:readonly"
  | "expense-checks:create"
  | "expense-checks:delete"
  | "expense-checks:readonly"
  | "income-checks:create"
  | "income-checks:delete"
  | "income-checks:readonly"
  | "risk-insights:create"
  | "risk-insights:delete"
  | "risk-insights:readonly";

export type TinkScope = TinkScopes[];

export interface FinancialService {
  segment: "BUSINESS" | "PERSONAL";
  shortName: string;
}

export interface ImageUrls {
  banner?: string;
  icon?: string;
}

export interface Provider {
  accessType: "OPEN_BANKING" | "OTHER";
  authenticationFlow?: "EMBEDDED" | "REDIRECT" | "DECOUPLED";
  authenticationUserType: "PERSONAL" | "BUSINESS" | "CORPORATE";
  capabilities: string[];
  credentialsType: "PASSWORD" | "MOBILE_BANKID" | "KEYFOB" | "THIRD_PARTY_APP";
  currency: string;
  displayDescription?: string;
  displayName: string;
  fields: any[];
  financialInstitutionId: string;
  financialInstitutionName: string;
  financialServices: FinancialService[];
  groupDisplayName?: string;
  hasAuthenticationOptions: boolean;
  images?: ImageUrls;
  keywords?: string[];
  loginHeaderColour?: string;
  market: string;
  multiFactor: boolean;
  name: string;
  passwordHelpText?: string;
  pisCapabilities?: string[];
  popular: boolean;
  rank?: number;
  releaseStatus?: "BETA";
  status: "ENABLED" | "TEMPORARY_DISABLED" | "DISABLED";
  transactional: boolean;
  type: "BANK" | "CREDIT_CARD" | "BROKER" | "TEST" | "OTHER";
}

export type ListProvidersResponse = {
  providers: Provider[];
};

export type Merchant = {
  /** The id of the application associated with the merchant */
  readonly appId: string;

  /** The merchant category code (MCC) as a four-digit code (ISO 18245) */
  categoryCode: string;

  /** The merchant's domicile as a two-letter code (ISO 3166-1 alpha-2) */
  countryCode: string;

  /** The external id of the merchant */
  externalId?: string;

  /** The id of the merchant */
  readonly id: string;

  /** The merchant name (alphanumerics plus ., -, / or &) */
  name: string;

  /** The organization/company/registration number */
  organizationNumber: string;

  /** The status of the merchant */
  readonly status: "ACTIVE" | "INACTIVE";

  /** The merchant's website URL without path (e.g. https://example.com) */
  url: string;
};

export type ListMerchantsResponse = {
  merchants: Merchant[];
};
