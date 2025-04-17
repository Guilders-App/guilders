import type { Bindings, Variables } from "@/common/variables";
import { createClient } from "@guilders/database/server";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * Supabase authentication middleware that injects the Supabase client for authenticated users.
 * Rejects unauthorized requests with 401.
 */
export function supabaseAuth(
  supabaseUrl?: string,
  supabaseAnonKey?: string,
): MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }> {
  return async (c, next) => {
    const url = supabaseUrl ?? c.env.SUPABASE_URL;
    const key = supabaseAnonKey ?? c.env.SUPABASE_ANON_KEY;

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

    const supabase = await createClient({ url, key, ssr: false, authHeader });

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new HTTPException(401, { message: error.message });
    }

    c.set("supabase", supabase);
    c.set("user", data.user);

    await next();
  };
}
