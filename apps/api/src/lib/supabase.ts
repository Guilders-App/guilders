import type { Database } from "@guilders/database/types";
import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
);

export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
);
