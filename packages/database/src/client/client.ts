import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../types";

export const createClient = ({ url, key }: { url: string; key: string }) =>
  createBrowserClient<Database>(url, key);
