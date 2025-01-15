import { env } from "@/lib/env";
import { createApiClient } from "@guilders/api";
import { createClient } from "@guilders/database/client";

export const getApiClient = async () => {
  const supabase = createClient({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const api = createApiClient({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return api;
};
