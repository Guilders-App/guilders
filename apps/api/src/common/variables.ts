import type { Database } from "@guilders/database/types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Variables = {
  supabase: SupabaseClient<Database>;
  user: User | null;
};
