interface SaltEdgeConfig {
  appId: string;
  secret: string;
  privateKeyPath: string;
  publicKeyPath?: string;
  baseUrl?: string;
}

interface SignedHeaders {
  Accept: string;
  "App-id": string;
  "Content-Type": string;
  "Expires-at": string;
  Secret: string;
  // Signature: string;
}

type Country = {
  /** Name of the country */
  name: string;
  /** Country code as dated in ISO 3166-1 alpha-2 */
  code: string;
  /** The local country time when Connections will be automatically refreshed */
  refresh_start_time: number;
};

type Provider = {
  /** The id of the Provider */
  id: string;
  /** A distinct code for identifying a Provider */
  code: string;
  /** Provider's name */
  name: string;
  /** Provider's country code in ISO 3166-1 alpha-2 format */
  country_code: string;
  /** List of BIC codes identifying supported branches of a specific Provider */
  bic_codes: string[];
  /** The dynamic registration code assigned to the Provider */
  dynamic_registration_code: string;
  /** The list of codes identifying the supported branches of a specific Provider */
  identification_codes: string[];
  /** The code of the group the Provider belongs to */
  group_code: string;
  /** The name of the group the Provider belongs to */
  group_name: string;
  /** The hub that the Provider is affiliated with */
  hub: string;
  /** Provider's status: 'active', 'inactive', or 'disabled' */
  status: "active" | "inactive" | "disabled";
  /** The way a Provider is accessed: 'oauth', 'web', or 'api' */
  mode: "oauth" | "web" | "api";
  /** Whether the Provider is integrated via a regulated channel under Open Banking/PSD2 */
  regulated: boolean;
  /** The URL for the Provider logo */
  logo_url: string;
  /** Time zone data for the capital/major city in a region corresponding to the Provider */
  timezone: string;
  /** Indicates whether the Provider supports being embedded within an iframe */
  supported_iframe_embedding: boolean;
  /** Provider that supports toggling the interactive and automatic_fetch flags after connecting */
  optional_interactivity: boolean;
  /** Whether the Provider will notify the Customer upon a login attempt */
  customer_notified_on_sign_in: boolean;
  /** The timestamp indicating when the Provider was integrated */
  created_at: string;
  /** The timestamp of the most recent update to any of the Provider's attributes */
  updated_at: string;
  /** Whether the Provider's Connections can be automatically fetched */
  automatic_fetch: boolean;
  /** Number of days corresponding to the custom pending period implemented by the Provider */
  custom_pendings_period?: number;
  /** Contains information on the Account holder details retrievable */
  holder_info: string[];
  /** Provides instructions or guidance for establishing Connections */
  instruction_for_connections: string;
  /** Indicates whether the Provider requires the User to perform an interactive step */
  interactive_for_connections: boolean;
  /** The maximum allowed consent duration */
  max_consent_days: number | null;
  /** The maximum number of days for which a Provider can return transaction data */
  max_fetch_interval: number;
  /** The delay in seconds before an Unfinished error is raised */
  max_interactive_delay: number;
  /** The amount of time, in minutes, after which Connections are allowed to be refreshed */
  refresh_timeout: number;
  /** Possible extra fields associated with Accounts that can be fetched */
  supported_account_extra_fields: string[];
  /** Possible Account natures to be fetched */
  supported_account_natures: string[];
  /** Supported account types: 'personal' or 'business' */
  supported_account_types: ("personal" | "business")[];
  /** Array of supported fetch_scopes */
  supported_fetch_scopes: string[];
  /** Possible transaction extra fields to be fetched */
  supported_transaction_extra_fields: string[];
  /** Identifiers of the payment templates supported by this Provider */
  payment_templates: string[];
  /** Instructions or guidance for initiating Payments */
  instruction_for_payments: string;
  /** Whether the Provider requires the User to perform an interactive step for payments */
  interactive_for_payment: boolean;
  /** The mandatory payment attributes */
  required_payment_fields: string[];
  /** Optional payment fields that will be used by the Provider if passed */
  supported_payment_fields: string[];
  /** Whether the Provider supports explicit handling of Payment rejection due to insufficient funds */
  no_funds_rejection_supported: boolean;
  /** Types and details of credentials required from the User */
  credentials_fields: Record<string, any>[];
  /** Types and details of interactive elements that the User may need to provide */
  interactive_fields: Record<string, any>[];
};

type Customer = {
  /** The id of the User */
  customer_id: string;
  /** The unique external identifier of a Customer (e.g email, id on the Client's side) */
  identifier: string;
  /** The date & time in UTC when a Customer has been blocked */
  blocked_at: string;
  /** The date & time in UTC when a Customer has been created */
  created_at: string;
  /** The date & time in UTC when a Customer has been updated */
  updated_at: string;
};

type RemoveCustomerResponse = {
  customer_id: string;
  deleted: boolean;
};

interface Meta {
  next_id: string | null;
  next_page: string | null;
}

interface SaltEdgeResponse<T> {
  data: T;
  meta?: Meta;
}
