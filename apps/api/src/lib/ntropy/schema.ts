import { z } from "zod";

// Regex for YYYY-MM-DDTHH:MM:SS.ffffff+ZZ:ZZ format
const DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}\+\d{2}:\d{2}$/;
const DATETIME_ERROR_MESSAGE =
  "Invalid datetime format. Expected YYYY-MM-DDTHH:MM:SS.ffffff+ZZ:ZZ";

export const AccountHolderTypeSchema = z.enum(["consumer", "business"]);

export const CreateAccountHolderInputSchema = z.object({
  id: z.string(),
  type: AccountHolderTypeSchema,
  name: z.string().optional().nullable(),
});

export const AccountHolderSchema = CreateAccountHolderInputSchema.extend({
  created_at: z
    .string()
    .regex(DATETIME_REGEX, { message: DATETIME_ERROR_MESSAGE }),
});

export type CreateAccountHolderInput = z.infer<
  typeof CreateAccountHolderInputSchema
>;
export type AccountHolder = z.infer<typeof AccountHolderSchema>;

// --- Transaction Schemas ---

export const EntryTypeSchema = z.enum(["incoming", "outgoing"]);

export const LocationInputSchema = z.object({
  country: z.string().length(2), // Assuming ISO 3166-1 alpha-2 codes
});

export const CreateTransactionInputSchema = z.object({
  id: z.string(),
  description: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  amount: z.number(),
  entry_type: EntryTypeSchema,
  currency: z.string().length(3), // Assuming ISO 4217 currency codes
  account_holder_id: z.string().uuid(),
  location: LocationInputSchema.optional(),
});

export const EntitySchema = z.object({
  id: z.string().uuid().nullable(),
  type: z.string().optional(), // e.g., "organization" - could be enum if known types
  name: z.string().nullable(),
  // Allow full URLs or domain names like 'example.com'
  website: z
    .string()
    .refine(
      (val) => {
        // Try parsing as URL first
        if (z.string().url().safeParse(val).success) {
          return true;
        }
        // Fallback to basic domain name regex (simplified)
        // Allows domain.tld, sub.domain.tld, etc.
        // Does not validate TLD correctness, just structure.
        const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
        return domainRegex.test(val);
      },
      {
        message:
          "Invalid website format. Must be a valid URL (e.g., https://example.com) or a domain name (e.g., example.com)",
      },
    )
    .optional()
    .nullable(),
  logo: z.string().url().optional().nullable(),
  mccs: z.array(z.number()).optional().nullable(),
});

export const CategoriesSchema = z.object({
  general: z.string(),
  accounting: z.string().optional(), // Example shows this, might vary
});

export const StructuredLocationSchema = z.object({
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  country_code: z.string().length(2).optional().nullable(),
  country: z.string().optional().nullable(),
  house_number: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  google_maps_url: z.string().url().optional().nullable(),
  apple_maps_url: z.string().url().optional().nullable(),
  store_number: z.string().optional().nullable(),
});

export const EnrichedLocationSchema = z.object({
  raw_address: z.string().optional().nullable(),
  structured: StructuredLocationSchema.optional().nullable(),
});

export const EnrichedEntitiesSchema = z.object({
  counterparty: EntitySchema,
  intermediaries: z.array(EntitySchema).optional().nullable(),
});

export const EnrichedTransactionSchema = z.object({
  created_at: z
    .string()
    .regex(DATETIME_REGEX, { message: DATETIME_ERROR_MESSAGE }),
  id: z.string(),
  entities: EnrichedEntitiesSchema,
  categories: CategoriesSchema,
  location: EnrichedLocationSchema.optional().nullable(),
  description: z.string().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  amount: z.number().optional(),
  entry_type: EntryTypeSchema.optional(),
  currency: z.string().length(3).optional(),
  account_holder_id: z.string().uuid().optional(),
});

export type CreateTransactionInput = z.infer<
  typeof CreateTransactionInputSchema
>;
export type EnrichedTransaction = z.infer<typeof EnrichedTransactionSchema>;
