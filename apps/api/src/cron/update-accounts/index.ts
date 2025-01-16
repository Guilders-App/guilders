import type { Bindings } from "@/common/variables";
import { getProvider } from "@/providers";
import type { Providers } from "@/providers/types";
import { createClient } from "@guilders/database/server";

export async function updateAccounts(env: Bindings) {
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

    for (const institutionConnection of institutionConnections) {
      const accounts = await provider.getAccounts({
        userId: institutionConnection.provider_connection.user_id,
        connectionId: institutionConnection.id,
      });

      await supabase.from("account").upsert(accounts, {
        onConflict: "institution_connection_id,provider_account_id",
      });
    }
  }
}
