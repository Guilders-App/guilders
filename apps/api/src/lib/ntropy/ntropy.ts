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

const NTROPY_BASE_URL = "https://api.ntropy.com/v3";

interface NtropyFetchOptions extends RequestInit {
  returnUndefinedOnStatus?: number[];
}

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
    options: NtropyFetchOptions = {},
    responseSchema?: z.ZodType<T>,
  ): Promise<T | undefined> {
    const url = `${NTROPY_BASE_URL}${endpoint}`;
    const { returnUndefinedOnStatus, ...fetchOptions } = options;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-KEY": this.apiKey,
      ...fetchOptions.headers,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers: headers as Record<string, string>,
      });
    } catch (error) {
      console.error(`Ntropy API request failed for ${endpoint}:`, error);
      throw new Error(
        `Ntropy API request failed: ${error instanceof Error ? error.message : "Unknown fetch error"}`,
      );
    }

    if (!response.ok) {
      if (returnUndefinedOnStatus?.includes(response.status)) {
        return undefined;
      }

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
      }
      return undefined;
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

    if (responseSchema) {
      try {
        if (responseData !== undefined) {
          return responseSchema.parse(responseData);
        }
        return undefined;
      } catch (error) {
        if (error instanceof ZodError) {
          console.error(
            `Ntropy API Response Validation Error (${endpoint}):`,
            inspect(error.format(), { depth: 10 }),
            inspect(responseData, { depth: 10 }),
          );
        } else {
          console.error(
            `Ntropy API - Unexpected error during response parsing (${endpoint}):`,
            error,
          );
        }
        throw new Error(
          `Ntropy API response validation failed: ${error instanceof Error ? error.message : "Unknown validation error"}`,
        );
      }
    }

    return responseData as T;
  }

  /**
   * Creates a new account holder in Ntropy.
   * Returns undefined if the API returns a 404 status.
   * @param data - The account holder data.
   * @returns The created account holder or undefined.
   * @see https://docs.ntropy.com/enrichment/introduction#enriching-your-first-transaction
   */
  async createAccountHolder(
    data: CreateAccountHolderInput,
  ): Promise<AccountHolder | undefined> {
    CreateAccountHolderInputSchema.parse(data);

    return this.ntropyFetch<AccountHolder>(
      "/account_holders",
      {
        method: "POST",
        body: JSON.stringify(data),
        returnUndefinedOnStatus: [404],
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
  async getAccountHolder(id: string): Promise<AccountHolder | undefined> {
    if (!id) {
      throw new Error("Account holder ID cannot be empty.");
    }

    return this.ntropyFetch<AccountHolder>(
      `/account_holders/${id}`,
      {
        method: "GET",
        returnUndefinedOnStatus: [404],
      },
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
    const result = await this.ntropyFetch<EnrichedTransaction>(
      "/transactions",
      {
        method: "POST",
        body: JSON.stringify(validatedData),
      },
      EnrichedTransactionSchema,
    );
    if (result === undefined) {
      throw new Error(
        "Ntropy API returned an unexpected undefined result for enrichTransaction.",
      );
    }
    return result;
  }

  /**
   * Fetches a previously enriched transaction by its ID.
   * @param transactionId - The unique ID of the transaction.
   * @returns The enriched transaction details.
   * @see https://docs.ntropy.com/enrichment/introduction#fetching-the-previous-enriched-transaction
   */
  async getTransaction(
    transactionId: string,
  ): Promise<EnrichedTransaction | undefined> {
    return this.ntropyFetch<EnrichedTransaction>(
      `/transactions/${transactionId}`,
      { returnUndefinedOnStatus: [404] },
      EnrichedTransactionSchema,
    );
  }

  /**
   * Lists enriched transactions, optionally filtered by account holder ID.
   * @param params - Optional parameters for filtering and pagination.
   * @returns An object containing a list of transactions, or undefined on specific errors.
   * @see https://docs.ntropy.com/enrichment/introduction#list-all-transactions
   */
  async listTransactions(params?: {
    accountHolderId?: string;
    limit?: number;
    startingAfter?: string;
  }): Promise<{ data: EnrichedTransaction[] }> {
    const queryParams = new URLSearchParams();
    if (params?.accountHolderId)
      queryParams.set("account_holder_id", params.accountHolderId);
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.startingAfter)
      queryParams.set("starting_after", params.startingAfter);

    const queryString = queryParams.toString();
    const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

    const ListResponseSchema = z.object({
      data: z.array(EnrichedTransactionSchema),
    });

    const result = await this.ntropyFetch<{ data: EnrichedTransaction[] }>(
      endpoint,
      {},
      ListResponseSchema,
    );

    if (result === undefined) {
      throw new Error(
        "Ntropy API returned an unexpected undefined result for listTransactions.",
      );
    }

    return result;
  }

  /**
   * Deletes a transaction from Ntropy. This action is permanent.
   * @param transactionId - The unique ID of the transaction to delete.
   * @see https://docs.ntropy.com/enrichment/introduction#deleting-a-transaction
   */
  async deleteTransaction(transactionId: string): Promise<void> {
    await this.ntropyFetch<void>(`/transactions/${transactionId}`, {
      method: "DELETE",
      returnUndefinedOnStatus: [404],
    });
  }

  /**
   * Reassigns a transaction to a different account holder.
   * The old and new account holders must share the same set of categories.
   * @param transactionId - The unique ID of the transaction to reassign.
   * @param newAccountHolderId - The UUID of the new account holder.
   * @returns The updated enriched transaction details, or undefined on specific errors.
   * @see https://docs.ntropy.com/enrichment/introduction#reassigning-the-account-holder
   */
  async reassignAccountHolder(
    transactionId: string,
    newAccountHolderId: string,
  ): Promise<EnrichedTransaction | undefined> {
    if (!z.string().uuid().safeParse(newAccountHolderId).success) {
      throw new Error("Invalid UUID format for newAccountHolderId");
    }

    return this.ntropyFetch<EnrichedTransaction>(
      `/transactions/${transactionId}/assign`,
      {
        method: "POST",
        body: JSON.stringify({ account_holder_id: newAccountHolderId }),
        returnUndefinedOnStatus: [404],
      },
      EnrichedTransactionSchema,
    );
  }
}
