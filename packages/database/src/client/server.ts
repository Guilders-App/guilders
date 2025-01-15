import { createServerClient } from "@supabase/ssr";
import { createClient as createClientAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "../types";

const conWarn = console.warn;
const conLog = console.log;

const IGNORE_WARNINGS = [
  "Using the user object as returned from supabase.auth.getSession()",
];

console.warn = (...args) => {
  const match = args.find((arg) =>
    typeof arg === "string"
      ? IGNORE_WARNINGS.find((warning) => arg.includes(warning))
      : false,
  );
  if (!match) {
    conWarn(...args);
  }
};

console.log = (...args) => {
  const match = args.find((arg) =>
    typeof arg === "string"
      ? IGNORE_WARNINGS.find((warning) => arg.includes(warning))
      : false,
  );
  if (!match) {
    conLog(...args);
  }
};

type CreateClientOptions = {
  url: string;
  key: string;
  admin?: boolean;
  ssr?: boolean;
  authHeader?: string;
};

export const createClient = async (options: CreateClientOptions) => {
  const { url, key, admin = false, ssr = true, authHeader } = options;

  if (!url) {
    throw new Error("Supabase URL is required. Provide it via options.");
  }

  if (!key) {
    throw new Error("Supabase key is required. Provide it via options");
  }

  if (!ssr) {
    return createClientAdmin<Database>(
      url,
      key,
      authHeader
        ? {
            global: {
              headers: {
                Authorization: authHeader,
              },
            },
          }
        : {},
    );
  }

  const cookieStore = await cookies();
  const auth = admin
    ? {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      }
    : {};

  return createServerClient<Database>(url, key, {
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
