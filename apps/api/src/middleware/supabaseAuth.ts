import type { Variables } from "@/common/variables";
import { env } from "@/env";
import type { Database } from "@guilders/database/types";
import { createClient } from "@supabase/supabase-js";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * Supabase authentication middleware that injects the Supabase client for authenticated users.
 * Rejects unauthorized requests with 401.
 */
export function supabaseAuth(
  supabaseUrl?: string,
  supabaseAnonKey?: string,
): MiddlewareHandler<{ Variables: Variables }> {
  return async (c, next) => {
    const url = supabaseUrl ?? env.SUPABASE_URL;
    const key = supabaseAnonKey ?? env.SUPABASE_ANON_KEY;

    if (!url) {
      throw new HTTPException(500, { message: "SUPABASE_URL is not set" });
    }

    if (!key) {
      throw new HTTPException(500, { message: "SUPABASE_ANON_KEY is not set" });
    }

    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      throw new HTTPException(401, {
        message: "Authorization header is missing",
      });
    }

    const supabase = createClient<Database>(url, key, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new HTTPException(401, { message: error.message });
    }

    c.set("supabase", supabase);
    c.set("user", data.user);

    await next();
  };
}

/**
 * Supabase authentication middleware that injects the Supabase client.
 * Similar to supabaseAuth but allows anonymous access (user can be null).
 */
export function supabaseAnonAuth(
  supabaseUrl?: string,
  supabaseAnonKey?: string,
): MiddlewareHandler<{ Variables: Variables }> {
  return async (c, next) => {
    const url = supabaseUrl ?? env.SUPABASE_URL;
    const key = supabaseAnonKey ?? env.SUPABASE_ANON_KEY;

    if (!url) {
      throw new HTTPException(500, { message: "SUPABASE_URL is not set" });
    }

    if (!key) {
      throw new HTTPException(500, { message: "SUPABASE_ANON_KEY is not set" });
    }

    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      throw new HTTPException(401, {
        message: "Authorization header is missing",
      });
    }

    const supabase = createClient<Database>(url, key, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data } = await supabase.auth.getUser();

    c.set("supabase", supabase);
    c.set("user", data.user);

    await next();
  };
}
