import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db";

export type DatabaseClient = SupabaseClient<Database>;

export * from "./db";
export * from "./types";
