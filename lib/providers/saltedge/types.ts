export interface SaltEdgeConfig {
  appId: string;
  secret: string;
  baseUrl?: string;
}

export interface SignedHeaders {
  Accept: string;
  "App-id": string;
  "Content-Type": string;
  "Expires-at": string;
  Secret: string;
  Signature: string;
}

export type Country = {
  /** Name of the country */
  name: string;
  /** Country code as dated in ISO 3166-1 alpha-2 */
  code: string;
  /** The local country time when Connections will be automatically refreshed */
  refresh_start_time: number;
};

export type Provider = {
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

export type Customer = {
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

export type RemoveCustomerResponse = {
  customer_id: string;
  deleted: boolean;
};

export interface Meta {
  next_id: string | null;
  next_page: string | null;
}

export interface SaltEdgeResponse<T> {
  data: T;
  meta?: Meta;
}

export type Connection = {
  /** The id of the created Connection */
  id: string;
  /** The id of the Customer to which the Connection belongs */
  customer_id: string;
  /** The unique external identifier of a Customer (e.g email, id on the Client's side) */
  customer_identifier: string;
  /** The code assigned by Salt Edge for a particular Provider */
  provider_code: string;
  /** The Provider's name used to establish the Connection */
  provider_name: string;
  /** Country code of the Provider */
  country_code: string;
  /** The current status of the Connection */
  status: "active" | "inactive" | "disabled";
  /** The categorization type applied to transactions from this Connection */
  categorization: "none" | "personal" | "business";
  /** The categorization vendor used for transactions' categorization */
  categorization_vendor: "saltedge" | "fino";
  /** Whether the refresh is automatically performed for this Connection */
  automatic_refresh: boolean;
  /** Determines when the next refresh will be available */
  next_refresh_possible_at: string | null;
  /** The date and time in UTC when the Connection was created */
  created_at: string;
  /** The date and time in UTC when the Connection was updated */
  updated_at: string;
  /** The id of the last provided PSD2 consent */
  last_consent_id: string;
  /** Information about the latest executed attempt */
  last_attempt: Record<string, any>;
  /** Information about the holder of this Connection */
  holder_info: {
    /** Account holder's name(s) */
    names: string[];
    /** Account holder's email(s) */
    emails: string[];
    /** Account holder's phone number(s) */
    phone_numbers: string[];
    /** Account holder's address(es) */
    addresses: Array<{
      city: string;
      state: string;
      street: string;
      country_code: string;
      post_code: string;
    }>;
    /** Additional holder information */
    extra: {
      /** Social Security Number shortened (last 4 digits) */
      ssn?: string;
      /** Cadastro de Pessoas Físicas (specific to Brazil) */
      cpf?: string;
      /** Account holder's date of birth */
      birth_date?: string;
      /** Account holder's identification number */
      document_number?: string;
    };
  };
};

interface ConnectionConsent {
  /** Data to be allowed for fetching */
  scopes: Array<"holder_info" | "accounts" | "transactions">;
  /** Allows to fetch data starting from a specified date */
  from_date?: string;
  /** Allows to fetch data up until a specified date */
  to_date?: string;
  /** Allows to specify the duration of consent validity (in days) */
  period_days?: number;
}

interface ConnectionAttempt {
  /** A list of scopes requested by Clients from the Provider */
  fetch_scopes?: Array<"holder_info" | "accounts" | "balance" | "transactions">;
  /** The starting date for fetching the data */
  fetch_from_date?: string;
  /** The ending date for fetching the data */
  fetch_to_date?: string;
  /** The types of accounts to fetch */
  account_natures?: Array<
    | "account"
    | "bonus"
    | "card"
    | "checking"
    | "credit"
    | "credit_card"
    | "debit_card"
    | "ewallet"
    | "insurance"
    | "investment"
    | "loan"
    | "mortgage"
    | "savings"
  >;
  /** A JSON object that will be sent back on any of the Client's callbacks */
  custom_fields?: Record<string, any>;
  /** The language of the Widget and the language of the returned error message(s).
   *  Possible values: any locale in ISO 639-1 format */
  locale?: string;
  /** Whether credentials are stored on Salt Edge's side or not.
   *  Relevant for Providers with mode: web and api */
  store_credentials?: boolean;
  /** The unduplication strategy used for duplicated transactions.
   *  The provided value remains unchanged until another value is sent during Connections/reconnect or Connections/refresh.
   *  `mark_as_pending`: leaves identified duplicated transactions in Pending status for clients that establish connections with providers having a non-null custom_pendings_period.
   *  `mark_as_duplicate`: identifies transactions as duplicated and sets the duplicated flag to true.
   *  `delete_duplicated`: removes identified duplicated transactions.

   *  Possible values: `mark_as_pending`, `mark_as_duplicate`, `delete_duplicated`
   *  Default value: `mark_as_pending` */
  unduplication_strategy?:
    | "mark_as_pending"
    | "mark_as_duplicate"
    | "delete_duplicated";
  /** The URL to redirect to after the Connection is created. Default: App Home URL */
  return_to?: string;
}

interface ConnectionWidget {
  /** Displays information about connected accounts in the Widget */
  show_account_overview?: boolean;
  /** Shows confirmation of the Connection */
  show_consent_confirmation?: boolean;
  /** The strategy for storing the User's credentials */
  credentials_strategy?: "store" | "do_not_store" | "ask";
  /** How the Widget interacts with the opener/parent window */
  javascript_callback_type?: "iframe" | "post_message";
  /** Enables Clients to disable Provider searches for Users */
  disable_provider_search?: boolean;
  /** Enables Users to skip the Provider selection page */
  skip_provider_selection?: boolean;
  /** Allows Users to skip the stage screen */
  skip_stages_screen?: boolean;
  /** Enables Clients to specify the template for the Widget */
  template?: string;
  /** Allows Clients to specify the theme for the Widget. Default: `default` */
  theme?: "dark" | "default" | "light";
  /** Displays Providers only from specified countries */
  allowed_countries?: string[];
  /** Display in the Widget the most popular Providers from a specified country */
  popular_providers_country?: string;
}

interface ConnectionProvider {
  /** The code of the required Provider */
  code?: string;
  /** Whether to display Sandboxes and Fake Providers in Provider search or not */
  include_sandboxes?: boolean;
  /** Restricts the list of Providers to only those that have the mode included in the array */
  modes?: Array<"oauth" | "web" | "api">;
}

interface ConnectionKyc {
  /** The type of Account to be connected, only for KYC purposes */
  type_of_account: "personal" | "shared" | "business";
}

export interface CreateConnectionRequest {
  /** A unique id of the User assigned by Salt Edge */
  customer_id: string;
  /** A unique external identifier of a Customer (e.g email, id on the Client's side) */
  customer_identifier?: string;
  /** Data to be allowed for fetching */
  consent: ConnectionConsent;
  /** A list of scopes requested by Clients from the Provider */
  attempt?: ConnectionAttempt;
  /** Widget configuration */
  widget?: ConnectionWidget;
  /** Provider configuration */
  provider?: ConnectionProvider;
  /** KYC configuration */
  kyc: ConnectionKyc;
  /** Appends connection_id to the `return_to` URL. Default: `false` */
  return_connection_id?: boolean;
  /** Appends error_class to the return_to URL. Default: `false` */
  return_error_class?: boolean;
  /** The categorization type applied to transactions from this Connection */
  categorization?: "none" | "personal" | "business";
  /** The categorization vendor used for transactions' categorization. Default: `saltedge` */
  categorization_vendor?: "saltedge" | "fino";
  /** Whether the refresh is automatically performed for this Connection.
   *  Default value: `false` (Client), `true` (Partner)
   */
  automatic_refresh?: boolean;
}

export interface CreateConnectionResponse {
  expires_at: string;
  connect_url: string;
  customer_id: string;
}

export type Account = {
  /** The id of the Account */
  id: string;
  /** The id of the Connection the Account belongs to */
  connection_id: string;
  /** The unique name of the Account */
  name: string;
  /** The type of the Account */
  nature:
    | "account"
    | "bonus"
    | "card"
    | "checking"
    | "credit"
    | "credit_card"
    | "debit_card"
    | "ewallet"
    | "insurance"
    | "investment"
    | "loan"
    | "mortgage"
    | "savings";
  /** The latest Account balance */
  balance: number;
  /** The currency code of the Account in ISO 4217 format */
  currency_code: string;
  /** Accounts extra associated with the Account */
  extra: Record<string, any>;
  /** The date and time in UTC when the Account was imported */
  created_at: string;
  /** The date and time in UTC when the Account's balance has changed or new transactions have been fetched */
  updated_at: string;
};

export interface GetAccountsResponse {
  data: Account[];
  meta: Meta;
}

export type Transaction = {
  /** The id of the transaction */
  id: string;
  /** The id of the Account the transaction belongs to */
  account_id: string;
  /** Whether the transaction is a duplicate or not */
  duplicated: boolean;
  /** Possible values: normal, fee, transfer */
  mode: "normal" | "fee" | "transfer";
  /** Possible values: posted, pending */
  status: "posted" | "pending";
  /** The date when the transaction was made */
  made_on: string;
  /** Transaction's amount */
  amount: number;
  /** Transaction's currency code */
  currency_code: string;
  /** Transaction's description */
  description: string;
  /** Transaction's category */
  category: string;
  /** Extra data associated with the transaction */
  extra: Record<string, any>;
  /** Time and date when the transaction was imported */
  created_at: string;
  /** The last time the transaction's attributes were changed by the Client */
  updated_at: string;
};

export type Rate = {
  currency_code: string;
  rate: number;
  // If the currency didn't get updated today, it will get a previous rate and set fail to true
  fail: boolean;
};
