import { createServerClient } from "@supabase/ssr";
import { createClient as createClientAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "../types";

type CreateClientOptions = {
  admin?: boolean;
  url?: string;
  key?: string;
  ssr?: boolean;
};

export const createClient = async (options?: CreateClientOptions) => {
  const { admin, url, key, ssr } = options ?? {};

  const supabaseUrl = url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error(
      "Supabase URL is required. Provide it via options or NEXT_PUBLIC_SUPABASE_URL environment variable.",
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabaseKey = key ?? (admin ? serviceRoleKey : anonKey);
  if (!supabaseKey) {
    throw new Error(
      `Supabase key is required. Provide it via options or ${
        admin ? "SUPABASE_SERVICE_ROLE_KEY" : "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      } environment variable.`,
    );
  }

  if (!ssr) {
    return createClientAdmin<Database>(supabaseUrl, supabaseKey);
  }

  const cookieStore = await cookies();
  const auth = admin
    ? {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    : {};

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth,
  });
};
