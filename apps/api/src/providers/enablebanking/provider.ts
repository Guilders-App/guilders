import type { Bindings } from "@/common/variables";
import type { TransactionInsert } from "@/types";
import type { DatabaseClient } from "@guilders/database/types";
import type {
  AccountParams,
  ConnectResult,
  ConnectionParams,
  DeregisterUserResult,
  IProvider,
  ProviderAccount,
  ProviderInstitution,
  Providers,
  ReconnectResult,
  RefreshConnectionResult,
  RegisterUserResult,
  TransactionParams,
} from "../types";
import { EnableBankingClient } from "./client";
import type { ConnectionState } from "./types";

export class EnableBankingProvider implements IProvider {
  readonly name: Providers = "EnableBanking";
  readonly enabled: boolean = false;
  private readonly client: EnableBankingClient;
  private readonly supabase: DatabaseClient;
  private readonly apiUrl: string;

  constructor(supabase: DatabaseClient, env: Bindings) {
    this.supabase = supabase;
    this.client = new EnableBankingClient(
      env.ENABLEBANKING_CLIENT_ID,
      env.ENABLEBANKING_CLIENT_PRIVATE_KEY,
    );
    this.apiUrl = env.API_URL;
  }

  async getInstitutions() {
    const aspsps = await this.client.getASPSPs();

    const entries: ProviderInstitution[] = aspsps.map((aspsp) => ({
      provider_institution_id: `${aspsp.name}-${aspsp.country}-${aspsp.maximum_consent_validity}`,
      name: aspsp.name,
      logo_url: aspsp.logo,
      enabled: this.enabled,
      country: aspsp.country,
    }));

    return entries;
  }

  async registerUser(userId: string): Promise<RegisterUserResult> {
    throw new Error("Not implemented");
  }

  async deregisterUser(userId: string): Promise<DeregisterUserResult> {
    const { data: provider, error: providerError } = await this.supabase
      .from("provider")
      .select("id")
      .eq("name", this.name)
      .single();

    if (providerError || !provider) {
      throw new Error("Provider not found");
    }

    const { data: providerConnection, error: providerConnectionError } =
      await this.supabase
        .from("provider_connection")
        .select()
        .eq("user_id", userId)
        .eq("provider_id", provider.id)
        .single();

    if (providerConnectionError || !providerConnection) {
      throw new Error("Provider connection not found");
    }

    const { data: institutionConnections, error: institutionConnectionError } =
      await this.supabase
        .from("institution_connection")
        .select()
        .eq("provider_connection_id", providerConnection.id);

    if (institutionConnectionError || !institutionConnections) {
      throw new Error("Institution connections not found");
    }

    for (const institutionConnection of institutionConnections) {
      if (institutionConnection.connection_id) {
        await this.client.deleteSession({
          sessionId: institutionConnection.connection_id,
        });
      }
    }

    const { error: deleteError } = await this.supabase
      .from("provider_connection")
      .delete()
      .eq("id", providerConnection.id);

    if (deleteError) {
      throw new Error("Failed to delete provider connection");
    }

    return {
      success: true,
    };
  }

  private getInstitutionDetails(institutionId: string) {
    const parts = institutionId.split("-");
    const maximum_consent_validity_str = parts.pop() ?? null;
    const maximum_consent_validity = maximum_consent_validity_str
      ? new Date(
          Date.now() + Number.parseInt(maximum_consent_validity_str) * 1000,
        )
          .toISOString()
          .replace("Z", "+00:00")
      : null;
    const country = parts.pop() ?? null;
    const name = parts.join("-");

    return {
      maximum_consent_validity,
      country,
      name,
    };
  }

  async connect(params: ConnectionParams): Promise<ConnectResult> {
    if (!params.institutionId) {
      throw new Error("Institution ID is required");
    }

    const { data: institution, error: institutionError } = await this.supabase
      .from("institution")
      .select("*")
      .eq("id", Number(params.institutionId))
      .single();

    if (institutionError || !institution) {
      throw new Error("Institution not found");
    }

    const { maximum_consent_validity, country, name } =
      this.getInstitutionDetails(institution.provider_institution_id);

    if (!maximum_consent_validity || !country || !name) {
      throw new Error("Invalid institution ID format");
    }

    const state: ConnectionState = {
      userId: params.userId,
      institutionId: params.institutionId,
    };

    const authorization = await this.client.createAuthorization({
      validUntil: maximum_consent_validity,
      aspspName: name,
      aspspCountry: country,
      redirectUrl: `${this.apiUrl}/callback/providers/enablebanking`,
      state: JSON.stringify(state),
      userId: params.userId,
    });

    return {
      success: true,
      data: {
        redirectURI: authorization.url,
        type: "redirect",
      },
    };
  }

  async reconnect(params: ConnectionParams): Promise<ReconnectResult> {
    return this.connect(params);
  }

  async refreshConnection(
    userId: string,
    userSecret: string,
    connectionId: string,
  ): Promise<RefreshConnectionResult> {
    throw new Error("Not implemented");
  }

  async getAccounts(params: AccountParams): Promise<ProviderAccount[]> {
    const { data: connection, error: connectionError } = await this.supabase
      .from("institution_connection")
      .select("*")
      .eq("id", Number(params.connectionId))
      .single();

    if (connectionError || !connection?.connection_id) {
      throw new Error("Connection not found");
    }

    const { data: institution, error: institutionError } = await this.supabase
      .from("institution")
      .select("*")
      .eq("id", Number(connection.institution_id))
      .single();

    if (institutionError || !institution) {
      throw new Error("Institution not found");
    }

    const session = await this.client.getSession({
      sessionId: connection.connection_id,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const accounts: ProviderAccount[] = [];
    for (const account of session.accounts ?? []) {
      const details = await this.client.getAccountDetails({
        accountId: account,
      });

      if (!details) {
        throw new Error("Account details not found");
      }

      const balances = await this.client.getAccountBalances({
        accountId: account,
      });

      const balance = balances[0];

      if (!balance) {
        throw new Error("Balance not found");
      }

      const accountData: ProviderAccount = {
        name: details.details ?? "Bank Account",
        type: "asset",
        subtype: "depository",
        value: Number(balance.balance_amount.amount),
        currency: details.currency,
        user_id: params.userId,
        institution_connection_id: Number(params.connectionId),
        provider_account_id: account,
        image: institution.logo_url,
      };

      accounts.push(accountData);
    }

    return accounts;
  }

  async getTransactions(
    params: TransactionParams,
  ): Promise<TransactionInsert[]> {
    if (!params.accountId) {
      throw new Error("Account ID is required");
    }

    const transactions = await this.client.getAccountTransactions({
      accountId: params.accountId,
    });

    const { data: accountId, error: accountError } = await this.supabase
      .from("account")
      .select("id")
      .eq("provider_account_id", params.accountId)
      .single();

    if (accountError || !accountId) {
      throw new Error("Account not found");
    }

    const transactionData: TransactionInsert[] = [];
    for (const transaction of transactions) {
      transactionData.push({
        date: transaction.booking_date,
        amount:
          Number(transaction.transaction_amount.amount) *
          (transaction.credit_debit_indicator === "DBIT" ? -1 : 1),
        currency: transaction.transaction_amount.currency,
        description: transaction.remittance_information?.join(", ") ?? "",
        category: "Uncategorized",
        account_id: accountId.id,
        provider_transaction_id: transaction.entry_reference,
      });
    }

    return transactionData;
  }
}
