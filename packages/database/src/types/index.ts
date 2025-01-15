import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./db";

export type DatabaseClient = SupabaseClient<Database>;
export type DatabaseUser = User;

export * from "./db";
export * from "./types";
