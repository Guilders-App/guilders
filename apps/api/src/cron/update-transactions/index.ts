import type { Bindings } from "@/common/variables";
import { getProvider } from "@/providers";
import type { Providers } from "@/providers/types";
import { createClient } from "@guilders/database/server";

export async function updateTransactions(env: Bindings) {
  const supabase = await createClient({
    url: env.SUPABASE_URL,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    ssr: false,
  });

  // Only update providers that require manual account updates
  const providers: Providers[] = ["EnableBanking"];

  for (const providerName of providers) {
    const provider = getProvider(providerName, supabase, env);

    const { data: providerData, error: providerError } = await supabase
      .from("provider")
      .select("*")
      .eq("name", providerName)
      .single();

    if (providerError) {
      console.error("Error fetching providers", providerError);
      return;
    }

    const { data: institutionConnections, error: institutionConnectionsError } =
      await supabase
        .from("institution_connection")
        .select(`
          *,
          provider_connection!inner (
            user_id,
            provider_id
          )
        `)
        .eq("provider_connection.provider_id", providerData.id);

    if (institutionConnectionsError) {
      console.error(
        "Error fetching institution connections",
        institutionConnectionsError,
      );
      return;
    }

    // Get all accounts associated with these institution connections
    const { data: accounts, error: accountsError } = await supabase
      .from("account")
      .select("*")
      .in(
        "institution_connection_id",
        institutionConnections.map((conn) => conn.id),
      );

    if (accountsError) {
      console.error("Error fetching accounts", accountsError);
      return;
    }

    for (const account of accounts) {
      if (!account.provider_account_id) {
        throw new Error("Account has no provider account id");
      }

      const transactions = await provider.getTransactions({
        userId: account.user_id,
        accountId: account.provider_account_id,
      });

      const { error: insertedTransactionsError } = await supabase
        .from("transaction")
        .upsert(transactions, {
          onConflict: "provider_transaction_id,account_id",
        })
        .select();

      if (insertedTransactionsError) {
        console.error(
          "Error inserting transactions",
          insertedTransactionsError,
        );
        return;
      }
    }
  }
}
