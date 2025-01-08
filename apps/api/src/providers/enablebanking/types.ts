import { string, z } from "zod";

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

const AuthorizeSessionRequestSchema = z.object({
  code: z.string().describe("Authorization code returned when redirecting PSU"),
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
