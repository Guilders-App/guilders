import { z } from "zod";

const PsuTypeSchema = z.enum(["personal", "business"]);

const AuthApproachSchema = z.enum([
  "DECOUPLED", // The TPP identifies the PSU and forwards the identification to the ASPSP which processes the authentication through a decoupled device
  "EMBEDDED", // The TPP identifies the PSU and forwards the identification to the ASPSP which starts the authentication. The TPP forwards one authentication factor of the PSU (e.g. OTP or response to a challenge)
  "REDIRECT", // The PSU is redirected by the TPP to the ASPSP which processes identification and authentication
]);

const SandboxUserSchema = z.object({
  username: z.string().optional().describe("Username"),
  password: z.string().optional().describe("Password"),
  otp: z.string().optional().describe("One time password"),
});

const SandboxSchema = z.object({
  users: z
    .array(SandboxUserSchema)
    .describe(
      "List of sandbox users which can be used to test sandbox environment",
    ),
});

const CredentialSchema = z.object({
  name: z
    .string()
    .describe(
      'Internal name of the credential. The name is to be used when passing credentials to the "start user authorization" request',
    ),
  title: z.string().describe("Title for the credential to be displayed to PSU"),
  required: z
    .boolean()
    .describe("Indication whether the credential is required"),
  description: z
    .string()
    .optional()
    .describe("Description of the credential to be displayed to PSU"),
  template: z
    .string()
    .optional()
    .describe(
      "Perl compatible regular expression used for check of the credential format",
    ),
});

const AuthMethodSchema = z.object({
  name: z
    .string()
    .optional()
    .describe("Internal name of the authentication method"),
  title: z
    .string()
    .optional()
    .describe("Human-readable title of the authentication method"),
  psu_type: PsuTypeSchema.describe(
    "PSU type to which the authentication method is applicable",
  ),
  credentials: z
    .array(CredentialSchema)
    .optional()
    .describe(
      "List of credentials which are possible to supply while initiating authorization",
    ),
  approach: AuthApproachSchema.describe(
    "Authentication approach used in the current authentication method",
  ),
  hidden_method: z
    .boolean()
    .describe(
      "Flag showing whether the current authentication method is hidden from the user. If `true` then the user will not be able to select this authentication method. It is only possible to select this authentication method via API.",
    ),
});

const ClearingSystemMemberIdentificationSchema = z.object({
  clearing_system_id: z
    .string()
    .optional()
    .describe(
      "Specification of a pre-agreed offering between clearing agents or the channel through which the payment instruction is processed.",
    ),
  member_id: z
    .string()
    .optional()
    .describe("Identification of a member of a clearing system."), // TODO: This is a number in the example
});

const FinancialInstitutionIdentificationSchema = z.object({
  bic_fi: z
    .string()
    .optional()
    .describe(
      'Code allocated to a financial institution by the ISO 9362 Registration Authority as described in ISO 9362 "Banking - Banking telecommunication messages - Business identification code (BIC)".',
    ),
  clearing_system_member_id:
    ClearingSystemMemberIdentificationSchema.optional().describe(
      "Clearing system member identification code",
    ),
  name: z.string().optional().describe("Name of the financial institution"),
});

const UsageSchema = z.enum([
  "ORGA", // Professional Account
  "PRIV", // Private Personal Account
]);

const CashAccountTypeSchema = z.enum([
  "CACC", // Account used to post debits and credits when no specific account has been nominated
  "CARD", // Account used for card payments only
  "CASH", // Account used for the payment of cash
  "LOAN", // Account used for loans
  "OTHR", // Account not otherwise specified
  "SVGS", // Account used for savings
]);

const AmountTypeSchema = z.object({
  currency: z.string().describe("ISO 4217 code of the currency of the amount"),
  amount: z
    .string()
    .describe(
      "Numerical value or monetary figure associated with a particular transaction, representing balance on an account, a fee or similar. Represented as a decimal number, using . (dot) as a decimal separator. Allowed precision (number of digits after the decimal separator) varies depending on the currency and is validated differently depending on the context.",
    ),
});

const BaseASPSPSchema = z.object({
  name: z
    .string()
    .describe(
      "Name of the ASPSP (i.e. a bank or a similar financial institution)",
    ),
  country: z
    .string()
    .length(2)
    .describe(
      "Two-letter ISO 3166 code of the country, in which ASPSP operates",
    ),
});

const ASPSPSchema = BaseASPSPSchema.extend({
  logo: z
    .string()
    .url()
    .describe(
      "ASPSP logo URL. It is possible to transform (e.g. resize) the logo by adding special suffixes at the end of the URL. For example, -/resize/500x/. For full list of possible transformations, please refer to https://uploadcare.com/docs/transformations/image_transformations/",
    ),
  psu_types: z
    .array(PsuTypeSchema)
    .describe("List of PSU types supported by ASPSP"),
  auth_methods: z
    .array(AuthMethodSchema)
    .describe("List of authentication methods supported by ASPSP"),
  maximum_consent_validity: z
    .number()
    .describe("Maximum consent validity which bank supports in seconds"),
  sandbox: SandboxSchema.optional().describe(
    "Applicable only to sandbox environment. Additional information necessary to use sandbox environment.",
  ),
  beta: z
    .boolean()
    .describe("Flag showing whether implementation is in beta mode"),
  bic: z.string().optional().describe("BIC of the ASPSP"),
  required_psu_headers: z
    .array(z.string())
    .optional()
    .describe(
      "List of the headers required to indicate to data retrieval endpoints that PSU is online. Either all required PSU headers or none of them are to be provided, otherwise PSU_HEADER_NOT_PROVIDED error will be returned.",
    ),
  payments: z
    .any() // TODO: I can't be bothered to write this schema
    .optional()
    .describe("Supported payment types by country and their properties"),
});

const SchemeNameSchema = z.enum([
  "ARNU", // AlienRegistrationNumber
  "BANK", // BankPartyIdentification
  "BBAN", // Basic Bank Account Number
  "BGNR", // Swedish BankGiro account number
  "CCPT", // PassportNumber
  "CHID", // Clearing Identification Number
  "COID", // CountryIdentificationCode
  "CPAN", // Card PAN
  "CUSI", // CustomerIdentificationNumberIndividual
  "CUST", // CorporateCustomerNumber
  "DRLC", // DriversLicenseNumber
  "DUNS", // Data Universal Numbering System
  "EMPL", // EmployerIdentificationNumber
  "GS1G", // GS1GLNIdentifier
  "IBAN", // International Bank Account Number
  "MIBN", // Masked IBAN
  "NIDN", // NationalIdentityNumber
  "OAUT", // OAUTH2 access token
  "OTHC", // OtherCorporate
  "OTHI", // OtherIndividual
  "PAN", // Original entry
  "PGNR", // Swedish PlusGiro account number
  "MSISDN", // Original entry
  "EMAIL", // Original entry
  "PHONE", // Original entry
  "SOSE", // SocialSecurityNumber
  "SREN", // SIREN number
  "SRET", // SIRET number
  "TXID", // TaxIdentificationNumber
]);

const GenericIdentificationSchema = z.object({
  identification: z.string().describe("An identifier"),
  scheme_name: SchemeNameSchema.describe(
    "Name of the identification scheme. Partially based on ISO20022 external code list",
  ),
  issuer: z
    .string()
    .optional()
    .describe(
      "Entity that assigns the identification. this could a country code or any organisation name or identifier that can be recognized by both parties",
    ),
});

const AccountIdentificationSchema = z.object({
  iban: z
    .string()
    .optional()
    .describe(
      'International Bank Account Number (IBAN) - identification used internationally by financial institutions to uniquely identify the account of a customer. Further specifications of the format and content of the IBAN can be found in the standard ISO 13616 "Banking and related financial services - International Bank Account Number (IBAN)" version 1997-10-01, or later revisions.',
    ),
  other: GenericIdentificationSchema.optional().describe(
    "Other identification if iban is not provided",
  ),
});

const AccessSchema = z.object({
  accounts: z
    .array(AccountIdentificationSchema)
    .optional()
    .describe("List of accounts"),
  balances: z
    .boolean()
    .optional()
    .describe("Request consent with balances access"),
  transactions: z
    .boolean()
    .optional()
    .describe("Request consent with transactions access"),
  valid_until: z.string().datetime().describe("Valid until date"),
});

const StartAuthorizationRequestSchema = z.object({
  access: AccessSchema,
  aspsp: BaseASPSPSchema,
  state: z
    .string()
    .describe(
      "Arbitrary string. Same string will be returned in query parameter when redirecting to the URL passed via redirect_url parameter",
    ),
  redirect_url: z
    .string()
    .url()
    .describe("URL that PSU will be redirected to after authorization"),
  psu_type: PsuTypeSchema.optional().describe(
    "PSU type which consent is created for",
  ),
  auth_method: z
    .string()
    .optional()
    .describe(
      "Desired authorization method (in case ASPSP supports multiple). Supported methods can be obtained from ASPSP auth_methods",
    ),
  credentials: z
    .array(z.any())
    .optional()
    .describe(
      "PSU credentials (User ID, company ID etc.) If not provided, then those are going to be asked from a PSU during authorization",
    ),
  credentials_autosubmit: z
    .boolean()
    .optional()
    .describe(
      "Controls whether user credentials will be autosubmitted (if passed). If set to false then credentials form will be prefilled with passed credentials",
    ),
  language: z
    .string()
    .optional()
    .describe("Preferred PSU language. Two-letter lowercase language code"),
  psu_id: z
    .string()
    .optional()
    .describe(
      "Unique identification of a PSU used by the client application. It can be used to match sessions of the same user. Although only hashed value is stored, it is recommended to use anonymised identifiers (i.e. digital ID instead of email or social security number). In case the parameter is not passed by the application, random value will be used.",
    ),
});

const StartAuthorizationResponseSchema = z.object({
  url: z.string().url().describe("URL to redirect PSU to"),
  authorization_id: z
    .string()
    .describe(
      "PSU authorisation ID, a value used to identify an authorisation session. Please note that another session ID will used to fetch account data.",
    ),
  psu_id_hash: z
    .string()
    .describe(
      "Hashed unique identification of a PSU used by the client application. In case PSU ID is not passed by the client application, the hash is calculated based on a random value. The hash also inherits the application ID, so different hashes will be calculated when using the same PSU ID with different applications.",
    ),
});

const AccountResourceSchema = z.object({
  account_id: AccountIdentificationSchema.optional().describe(
    "Primary account identifier",
  ),
  all_account_ids: z
    .array(GenericIdentificationSchema)
    .optional()
    .describe(
      "All account identifiers provided by ASPSPs (including primary identifier available in the accountId field)",
    ),
  account_servicer:
    FinancialInstitutionIdentificationSchema.optional().describe(
      "Information about the financial institution servicing the account",
    ),
  name: z.string().optional().describe("Account holder(s) name"),
  details: z
    .string()
    .optional()
    .describe("Account description set by PSU or provided by ASPSP"),
  usage: UsageSchema.optional().describe("Specifies the usage of the account"),
  cash_account_type: CashAccountTypeSchema.describe(
    "Specifies the type of the account",
  ),
  product: z
    .string()
    .optional()
    .describe(
      "Product Name of the Bank for this account, proprietary definition",
    ),
  currency: z.string().describe("Specifies the currency of the account"),
  psu_status: z
    .string()
    .optional()
    .describe(
      "Relationship between the PSU and the account - Account Holder - Co-account Holder - Attorney",
    ),
  credit_limit: AmountTypeSchema.optional().describe(
    "Specifies credit limit of the account",
  ),
  legal_age: z
    .boolean()
    .nullable()
    .optional()
    .describe(
      "Specifies whether Enable Banking is confident that the account holder is of legal age or is a minor. The field takes the following values: true if the account holder is of legal age; false if the account holder is a minor; null (or the field is not set) if it is not possible to determine whether the account holder is of legal age or a minor or if the legal age check is not applicable (in cases such as if the account holder is a legal entity or there are multiple account co-holders)",
    ),
  uid: z
    .string()
    .uuid()
    .optional()
    .describe(
      "Unique account identificator used for fetching account balances and transactions. It is valid only until the session to which the account belongs is in the AUTHORIZED status. It can be not set in case it is know that it is not possible to fetch balances and transactions for the account (for example, in case the account is blocked or closed at the ASPSP side).",
    ),
  identification_hash: z
    .string()
    .describe(
      "Primary account identification hash. It can be used for matching accounts between multiple sessions (even in case the sessions are authorized by different PSUs).",
    ),
  identification_hashes: z
    .array(z.string())
    .describe(
      "List of possible account identification hashes. Identification hash is based on the account number. Some accounts may have multiple account numbers (e.g. IBAN and BBAN). This field contains all possible hashes. Not all of these hashes can be used to uniquely identify an account and that the primary goal of them is to be able to fuzzy matching of accounts by certain properties. Primary hash is included in this list.",
    ),
});

const AuthorizeSessionRequestSchema = z.object({
  code: z.string().describe("Authorization code returned when redirecting PSU"),
});

const AuthorizeSessionResponseSchema = z.object({
  session_id: z.string().uuid().describe("ID of the PSU session"),
  accounts: z
    .array(AccountResourceSchema)
    .optional()
    .describe("List of authorized accounts"),
  aspsp: ASPSPSchema.describe("List of authorized accounts"),
  psu_type: PsuTypeSchema.describe("PSU type used with the session"),
  access: AccessSchema.describe(
    "Scope of access requested from ASPSP and confirmed by PSU",
  ),
});

const SessionStatusSchema = z.enum([
  "AUTHORIZED",
  "CANCELLED",
  "CLOSED",
  "EXPIRED",
  "INVALID",
  "PENDING_AUTHORIZATION",
  "RETURNED_FROM_BANK",
  "REVOKED",
]);

const SessionAccountSchema = z.object({
  uid: z.string().uuid().describe("Account identificator within the session"),
  identification_hash: z
    .string()
    .describe("Global account identification hash"),
  identification_hashes: z
    .array(z.string())
    .describe(
      "List of possible account identification hashes. Identification hash is based on the account number. Some accounts may have multiple account numbers (e.g. IBAN and BBAN). This field contains all possible hashes.",
    ),
});

const GetSessionResponseSchema = z.object({
  status: SessionStatusSchema.describe("Session status"),
  accounts: z
    .array(z.string())
    .describe("List of account ids available in the session"),
  accounts_data: z
    .array(SessionAccountSchema)
    .describe("List of account data available in the session"),
  aspsp: ASPSPSchema.describe("ASPSP used with the session"),
  psu_type: PsuTypeSchema.describe("PSU type used with the session"),
  psu_id_hash: z
    .string()
    .describe(
      "Hashed unique identification of a PSU used by the client application. In case PSU ID is not passed by the client application, the hash is calculated based on a random value. The hash also inherits the application ID, so different hashes will be calculated when using the same PSU ID with different applications.",
    ),
  access: AccessSchema.describe(
    "Scope of access requested from ASPSP and confirmed by PSU",
  ),
  created: z
    .string()
    .datetime()
    .describe("Date and time when the session was created"),
  authorized: z
    .string()
    .datetime()
    .optional()
    .describe("Date and time when the session was authorized"),
  closed: z
    .string()
    .datetime()
    .optional()
    .describe("Date and time when the session was closed"),
});

const BalanceStatusSchema = z.enum([
  "CLAV", // (ISO20022 Closing Available) Closing available balance
  "CLBD", // (ISO20022 ClosingBooked) Accounting Balance
  "FWAV", // (ISO20022 ForwardAvailable) Balance that is at the disposal of account holders on the date specified
  "INFO", // (ISO20022 Information) Balance for informational purposes
  "ITAV", // (ISO20022 InterimAvailable) Available balance calculated in the course of the day
  "ITBD", // (ISO20022 InterimBooked) Booked balance calculated in the course of the day
  "OPAV", // (ISO20022 OpeningAvailable) Opening balance that is at the disposal of account holders at the beginning of the date specified
  "OPBD", // (ISO20022 OpeningBooked) Book balance of the account at the beginning of the account reporting period. It always equals the closing book balance from the previous report
  "OTHR", // (ISO20022 Other) Balance of the account that is not covered by other balance types
  "PRCD", // (ISO20022 PreviouslyClosedBooked) Balance of the account at the end of the previous reporting period
  "VALU", // (ISO20022 Valuation) Balance of the account at the valuation date
  "XPCD", // (ISO20022 Expected) Instant Balance
]);

const BalanceResourceSchema = z.object({
  name: z.string().describe("Label of the balance"),
  balance_amount: AmountTypeSchema.describe(
    "Structure aiming to embed the amount and the currency to be used",
  ),
  balance_type: BalanceStatusSchema.describe("Available balance type values"),
  last_change_date_time: z
    .string()
    .datetime()
    .optional()
    .describe("Timestamp of the last change of the balance amount"),
  reference_date: z
    .string()
    .datetime()
    .optional()
    .describe("Reference date for the balance"),
  last_committed_transaction: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Entry reference of the last transaction contributing to the balance value",
    ),
});

// Noted as "HalBalances" in the API
const AccountBalanceSchema = z.object({
  balances: z.array(BalanceResourceSchema).describe("List of balances"),
});

const TransactionStatusSchema = z.enum([
  "BOOK", // Accounted transaction (ISO20022 Closing Booked)
  "CNCL", // Cancelled transaction
  "HOLD", // Account hold
  "OTHR", // Transaction with unknown status or not fitting the other options
  "PDNG", // Instant Balance Transaction (ISO20022 Expected)
  "RJCT", // Rejected transaction
  "SCHD", // Scheduled transaction
]);

const TransactionsFetchStrategySchema = z.enum([
  "default", // Fetches transactions as requested by the user by passing the date_from and date_to parameters to an ASPSP. If not date_from or date_to is passed, then meaningful defaults are used.
  "longest", // Tries to find the longest possible period of transactions and fetches transactions for that period. Passed date_from is also taken into account. This strategy may use extra ASPSP calls. date_to is ignored in this strategy.
]);

const AddressTypeSchema = z.enum([
  "Business",
  "Correspondence",
  "DeliveryTo",
  "MailTo",
  "POBox",
  "Postal",
  "Residential",
  "Statement",
]);

const PostalAddressSchema = z.object({
  address_type: AddressTypeSchema.optional().describe(
    "Available address type values",
  ),
  department: z
    .string()
    .optional()
    .describe(
      "Identification of a division of a large organisation or building.",
    ),
  sub_department: z
    .string()
    .optional()
    .describe(
      "Identification of a sub-division of a large organisation or building.",
    ),
  street_name: z
    .string()
    .optional()
    .describe("Name of a street or thoroughfare."),
  building_number: z
    .string()
    .optional()
    .describe("Number that identifies the position of a building on a street."),
  post_code: z
    .string()
    .optional()
    .describe(
      "Identifier consisting of a group of letters and/or numbers that is added to a postal address to assist the sorting of mail.",
    ),
  town_name: z
    .string()
    .optional()
    .describe(
      "Name of a built-up area, with defined boundaries, and a local government.",
    ),
  country_sub_division: z
    .string()
    .optional()
    .describe(
      "Identifies a subdivision of a country such as state, region, county.",
    ),
  country: z
    .string()
    .optional()
    .describe(
      "Two-letter ISO 3166 code of the country in which a person resides (the place of a person's home). In the case of a company, it is the country from which the affairs of that company are directed.",
    ),
  address_line: z
    .array(z.string())
    .optional()
    .describe(
      "Unstructured address. The two lines must embed zip code and town name",
    ),
});

const ContactDetailsSchema = z.object({
  email_address: z.string().optional().describe("Email address of a person"),
  phone_number: z.string().optional().describe("Phone number of a person"),
});

const PartyIdentificationSchema = z.object({
  name: z
    .string()
    .optional()
    .describe(
      "Name by which a party is known and which is usually used to identify that party.",
    ),
  postal_address: PostalAddressSchema.optional().describe(
    "Address of the creditor",
  ),
  organisation_id: GenericIdentificationSchema.optional().describe(
    "Unique identification of an account, a person or an organisation, as assigned by an issuer",
  ),
  private_id: GenericIdentificationSchema.optional().describe(
    "Unique identification of an account, a person or an organisation, as assigned by an issuer",
  ),
  contact_details: ContactDetailsSchema.optional().describe(
    "Specifies the contact details associated with a person or an organisation",
  ),
});

const BankTransactionCodeSchema = z.object({
  description: z
    .string()
    .optional()
    .describe("Arbitrary transaction categorization description"),
  code: z
    .string()
    .describe("Specifies the family of a transaction within the domain"),
  sub_code: z
    .string()
    .optional()
    .describe(
      "Specifies the sub-product family of a transaction within a specific family",
    ),
});

const CreditDebitIndicatorSchema = z.enum([
  "CRDT", // Credit
  "DBIT", // Debit
]);

const CurrencyCodeSchema = z
  .string()
  .length(3)
  .describe("ISO 4217 currency code");

const RateTypeSchema = z.enum([
  "AGRD", // Exchange rate applied is the rate agreed between the parties
  "SALE", // Exchange rate applied is the market rate at the time of the sale.
  "SPOT", // Exchange rate applied is the spot rate.
]);

const ExchangeRateSchema = z.object({
  unit_currency: CurrencyCodeSchema.optional().describe(
    "ISO 4217 code of the currency, in which the rate of exchange is expressed in a currency exchange. In the example 1GBP = xxxCUR, the unit currency is GBP.",
  ),
  exchange_rate: z
    .string()
    .optional()
    .describe(
      "The factor used for conversion of an amount from one currency to another. This reflects the price at which one currency was bought with another currency.",
    ),
  rate_type: RateTypeSchema.optional().describe(
    "Specifies the type of exchange rate applied to the transaction",
  ),
  contract_identification: z
    .string()
    .optional()
    .describe(
      "Unique and unambiguous reference to the foreign exchange contract agreed between the initiating party/creditor and the debtor agent.",
    ),
  instructed_amount: AmountTypeSchema.optional().describe(
    "Original amount, in which transaction was initiated. In particular, for cross-currency card transactions, the value represents original value of a purchase or a withdrawal in a currency different from the card's native or default currency.",
  ),
});

const TransactionSchema = z.object({
  entry_reference: z
    .string()
    .optional()
    .describe(
      "Unique transaction identifier provided by ASPSP. This identifier is both unique and immutable for accounts with the same identification hashes and can be used for matching transactions across multiple PSU authentication sessions. Usually the same identifier is available for transactions in ASPSP's online/mobile interface and is called archive ID or similarly. Please note that this identifier is not globally unique and same entry references are likely to occur for transactions belonging to different accounts.",
    ),
  merchant_category_code: z
    .string()
    .optional()
    .describe(
      "Category code conform to ISO 18245, related to the type of services or goods the merchant provides for the transaction",
    ),
  transaction_amount: AmountTypeSchema.describe(
    "Monetary sum of the transaction",
  ),
  creditor: PartyIdentificationSchema.optional().describe(
    "Identification of the party receiving funds in the transaction",
  ),
  creditor_account: AccountIdentificationSchema.optional().describe(
    "Identification of the account on which the transaction is credited",
  ),
  creditor_agent: FinancialInstitutionIdentificationSchema.optional().describe(
    "Identification of the creditor agent",
  ),
  debtor: PartyIdentificationSchema.optional().describe(
    "Identification of the party sending funds in the transaction",
  ),
  debtor_account: AccountIdentificationSchema.optional().describe(
    "Identification of the account on which the transaction is debited",
  ),
  debtor_agent: FinancialInstitutionIdentificationSchema.optional().describe(
    "Identification of the debtor agent",
  ),
  bank_transaction_code: BankTransactionCodeSchema.optional().describe(
    "Allows the account servicer to correctly report a transaction, which in its turn will help account holders to perform their cash management and reconciliation operations.",
  ),
  credit_debit_indicator: CreditDebitIndicatorSchema.describe(
    "Accounting flow of the transaction",
  ),
  status: TransactionStatusSchema.describe(
    "Available transaction status values",
  ),
  booking_date: z
    .string()
    .datetime()
    .describe(
      "Booking date of the transaction on the account, i.e. the date at which the transaction has been recorded on books",
    ),
  value_date: z
    .string()
    .datetime()
    .describe(
      "Value date of the transaction on the account, i.e. the date at which funds become available to the account holder (in case of a credit transaction), or cease to be available to the account holder (in case of a debit transaction)",
    ),
  transaction_date: z
    .string()
    .datetime()
    .describe(
      "Date used for specific purposes:\n- for card transaction: date of the transaction\n- for credit transfer: acquiring date of the transaction\n- for direct debit: receiving date of the transaction",
    ),
  balance_after_transaction: AmountTypeSchema.optional().describe(
    "Funds on the account after execution of the transaction",
  ),
  reference_number: z
    .string()
    .optional()
    .describe(
      "Credit transfer reference number (also known as the creditor reference or the structured creditor reference). The value is set when it is known that the transaction data contains a reference number (in either ISO 11649 or a local format).",
    ),
  remittance_information: z
    .array(z.string())
    .optional()
    .describe(
      "Payment details. For credit transfers may contain free text, reference number or both at the same time (in case Extended Remittance Information is supported). When it is known that remittance information contains a reference number (either based on ISO 11649 or a local scheme), the reference number is also available via the reference_number field.",
    ),
  debtor_account_additional_identification: z
    .array(GenericIdentificationSchema)
    .optional()
    .describe("All other debtor account identifiers provided by ASPSPs"),
  creditor_account_additional_identification: z
    .array(GenericIdentificationSchema)
    .optional()
    .describe("All other creditor account identifiers provided by ASPSPs"),
  exchange_rate: ExchangeRateSchema.optional().describe(
    "Provides details on the currency exchange rate and contract.",
  ),
  note: z.string().optional().describe("The internal note made by PSU"),
  transaction_id: z
    .string()
    .optional()
    .nullable()
    .describe(
      "Identification used for fetching transaction details.This value can not be used to uniquely identify transactions and may change if the list of transactions is retrieved again. Null if fetching transaction details is not supported.",
    ),
});

const AccountTransactionsSchema = z.object({
  transactions: z.array(TransactionSchema).describe("List of transactions"),
  continuation_key: z
    .string()
    .optional()
    .nullable()
    .describe(
      "Value to retrieve next page of transactions. Null if there are no more pages. Only valid in current session.",
    ),
});

export type ASPSP = z.infer<typeof ASPSPSchema>;
export type StartAuthorizationRequest = z.infer<
  typeof StartAuthorizationRequestSchema
>;
export type StartAuthorizationResponse = z.infer<
  typeof StartAuthorizationResponseSchema
>;
export type AuthorizeSessionRequest = z.infer<
  typeof AuthorizeSessionRequestSchema
>;
export type AuthorizeSessionResponse = z.infer<
  typeof AuthorizeSessionResponseSchema
>;
export type GetSessionResponse = z.infer<typeof GetSessionResponseSchema>;
export type AccountResource = z.infer<typeof AccountResourceSchema>;
export type AccountBalance = z.infer<typeof AccountBalanceSchema>;
export type Balance = z.infer<typeof BalanceResourceSchema>;
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;
export type TransactionsFetchStrategy = z.infer<
  typeof TransactionsFetchStrategySchema
>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type AccountTransactions = z.infer<typeof AccountTransactionsSchema>;
export type ConnectionState = {
  userId: string;
  institutionId: number;
};
