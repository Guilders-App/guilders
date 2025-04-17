import { inspect } from "node:util"; // Import inspect using node: protocol
import { ZodError, z } from "zod";
import {
  type AccountHolder,
  AccountHolderSchema,
  type CreateAccountHolderInput,
  CreateAccountHolderInputSchema,
  type CreateTransactionInput,
  CreateTransactionInputSchema,
  type EnrichedTransaction,
  EnrichedTransactionSchema,
} from "./schema";

// Constants
const NTROPY_BASE_URL = "https://api.ntropy.com/v3";

// --- Ntropy API Client Class ---

export class NtropyClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Ntropy API key is required.");
    }
    this.apiKey = apiKey;
  }

  private async ntropyFetch<T>(
    endpoint: string,
    options: RequestInit = {},
    responseSchema?: z.ZodType<T>,
  ): Promise<T> {
    const url = `${NTROPY_BASE_URL}${endpoint}`;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
      ...options.headers,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers: headers as Record<string, string>,
      });
    } catch (error) {
      console.error(`Ntropy API request failed for ${endpoint}:`, error);
      throw new Error(
        `Ntropy API request failed: ${error instanceof Error ? error.message : "Unknown fetch error"}`,
      );
    }

    if (!response.ok) {
      let errorBody: string | object = await response.text();
      try {
        errorBody = JSON.parse(errorBody);
      } catch {}
      console.error(
        `Ntropy API Error (${endpoint}): ${response.status} ${response.statusText}`,
        inspect(errorBody, { depth: 5 }),
      );
      throw new Error(
        `Ntropy API request failed: ${response.status} ${response.statusText}`,
      );
    }

    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      if (responseSchema) {
        console.warn(
          `Ntropy API Warning (${endpoint}): Expected a response body but received none (Status 204 or Content-Length 0).`,
        );
        // Depending on requirements, you might want to throw an error here
        // or return a default value if the schema allows (e.g., z.undefined())
      }
      // biome-ignore lint/suspicious/noExplicitAny: Need to cast for empty response
      return undefined as any;
    }

    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch (error) {
      console.error(
        `Ntropy API Error (${endpoint}): Failed to parse JSON response.`,
        error,
      );
      throw new Error(
        `Failed to parse JSON response from Ntropy API: ${error instanceof Error ? error.message : "Unknown JSON parse error"}`,
      );
    }

    // If a response schema is provided, parse and validate
    if (responseSchema) {
      try {
        return responseSchema.parse(responseData);
      } catch (error) {
        if (error instanceof ZodError) {
          console.error(
            `Ntropy API Response Validation Error (${endpoint}):`,
            // Log the detailed Zod error with increased depth
            inspect(error.format(), { depth: 10 }), // Adjust depth as needed
            inspect(responseData, { depth: 10 }),
          );
          // Optionally log the raw response data that failed validation
          // console.error('Raw response data:', inspect(responseData, { depth: 5 }));
        } else {
          console.error(
            `Ntropy API - Unexpected error during response parsing (${endpoint}):`,
            error,
          );
        }
        // Re-throw the original error or a more specific validation error
        throw new Error(
          `Ntropy API response validation failed: ${error instanceof Error ? error.message : "Unknown validation error"}`,
        );
      }
    }

    // If no schema provided, return the raw JSON data
    return responseData as T;
  }

  /**
   * Creates a new account holder in Ntropy.
   * @param data - The account holder data.
   * @returns The created account holder.
   * @see https://docs.ntropy.com/enrichment/introduction#enriching-your-first-transaction
   */
  async createAccountHolder(
    data: CreateAccountHolderInput,
  ): Promise<AccountHolder> {
    const validatedData = CreateAccountHolderInputSchema.parse(data);

    return this.ntropyFetch<AccountHolder>(
      "/account_holders",
      {
        method: "POST",
        body: JSON.stringify(validatedData),
      },
      AccountHolderSchema,
    );
  }

  /**
   * Retrieves an account holder by its ID.
   * @param id - The unique ID of the account holder.
   * @returns The account holder details.
   * @see https://docs.ntropy.com/documentation/api/account-holders/get-account-holder
   */
  async getAccountHolder(id: string): Promise<AccountHolder> {
    // Basic validation for the ID format could be added here if desired,
    // e.g., check if it's a non-empty string or matches a specific pattern.
    if (!id) {
      throw new Error("Account holder ID cannot be empty.");
    }

    return this.ntropyFetch<AccountHolder>(
      `/account_holders/${id}`,
      { method: "GET" }, // Method is GET by default in ntropyFetch if options is empty or undefined
      AccountHolderSchema,
    );
  }

  /**
   * Submits a transaction for enrichment.
   * @param data - The transaction data.
   * @returns The enriched transaction details.
   * @see https://docs.ntropy.com/enrichment/introduction#enriching-your-first-transaction
   */
  async enrichTransaction(
    data: CreateTransactionInput,
  ): Promise<EnrichedTransaction> {
    const validatedData = CreateTransactionInputSchema.parse(data);
    return this.ntropyFetch<EnrichedTransaction>(
      "/transactions",
      {
        method: "POST",
        body: JSON.stringify(validatedData),
      },
      EnrichedTransactionSchema,
    );
  }

  /**
   * Fetches a previously enriched transaction by its ID.
   * @param transactionId - The unique ID of the transaction.
   * @returns The enriched transaction details.
   * @see https://docs.ntropy.com/enrichment/introduction#fetching-the-previous-enriched-transaction
   */
  async getTransaction(transactionId: string): Promise<EnrichedTransaction> {
    return this.ntropyFetch<EnrichedTransaction>(
      `/transactions/${transactionId}`,
      {}, // No options needed for GET
      EnrichedTransactionSchema, // Provide response schema
    );
  }

  /**
   * Lists enriched transactions, optionally filtered by account holder ID.
   * @param params - Optional parameters for filtering and pagination.
   * @returns An object containing a list of transactions.
   * @see https://docs.ntropy.com/enrichment/introduction#list-all-transactions
   */
  async listTransactions(params?: {
    accountHolderId?: string;
    limit?: number;
    startingAfter?: string;
  }): Promise<{ data: EnrichedTransaction[] }> {
    // Assuming a common list structure
    const queryParams = new URLSearchParams();
    if (params?.accountHolderId)
      queryParams.set("account_holder_id", params.accountHolderId);
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.startingAfter)
      queryParams.set("starting_after", params.startingAfter);

    const queryString = queryParams.toString();
    const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

    // Assuming the list endpoint returns an object like { data: [...] }
    // Adjust the Zod schema and return type if the structure is different
    const ListResponseSchema = z.object({
      data: z.array(EnrichedTransactionSchema),
    });
    return this.ntropyFetch<{ data: EnrichedTransaction[] }>(
      endpoint,
      {},
      ListResponseSchema, // Provide response schema
    );
  }

  /**
   * Deletes a transaction from Ntropy. This action is permanent.
   * @param transactionId - The unique ID of the transaction to delete.
   * @see https://docs.ntropy.com/enrichment/introduction#deleting-a-transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    await this.ntropyFetch<void>(`/transactions/${transactionId}`, {
      method: "DELETE",
    });
    // No response body expected, so no schema needed. ntropyFetch handles 204.
  }

  /**
   * Reassigns a transaction to a different account holder.
   * The old and new account holders must share the same set of categories.
   * @param transactionId - The unique ID of the transaction to reassign.
   * @param newAccountHolderId - The UUID of the new account holder.
   * @returns The updated enriched transaction details.
   * @see https://docs.ntropy.com/enrichment/introduction#reassigning-the-account-holder
   */
  async reassignAccountHolder(
    transactionId: string,
    newAccountHolderId: string,
  ): Promise<EnrichedTransaction> {
    if (!z.string().uuid().safeParse(newAccountHolderId).success) {
      throw new Error("Invalid UUID format for newAccountHolderId");
    }

    return this.ntropyFetch<EnrichedTransaction>(
      `/transactions/${transactionId}/assign`,
      {
        method: "POST",
        body: JSON.stringify({ account_holder_id: newAccountHolderId }),
      },
      EnrichedTransactionSchema,
    );
  }
}
