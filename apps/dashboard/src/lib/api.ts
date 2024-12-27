import { createApiClient } from "@guilders/api";
import { createClient } from "@guilders/database/client";

export const getApiClient = async () => {
  const supabase = createClient();
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const api = createApiClient({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return api;
};
