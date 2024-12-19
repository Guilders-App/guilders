/**
 * This module contains functions to add supabase authentication to Elysia.
 * @module
 *
 * @example
 * ```ts
 * import { Elysia } from 'elysia'
 * import { supabase } from "@mastermakrela/elysia-supabase";
 *
 * const app = new Elysia()
 * 	.use(supabase())
 * 	.get('/', ({ supabase, user }) => `Hi ${user.email}`)
 * 	.listen(3000)
 * ```
 *
 * @example
 * ```ts
 * import { Elysia } from "npm:elysia";
 * import { supabase } from "jsr:@mastermakrela/elysia-supabase";
 *
 * const app = new Elysia()
 * 	.use(supabase())
 * 	.get("/", ({ supabase, user }) => `Hi ${user.email}`)
 * 	.get("/data", async ({ supabase, error }) => {
 * 		const resp = await supabase.from("table").select("*");
 *
 * 		if (resp.error) {
 * 			return error(500, resp.error.message);
 * 		}
 *
 * 		return resp.data;
 * 	})
 *
 * Deno.serve(app.fetch);
 * ```
 */

import {
  type SupabaseClient,
  type SupabaseClientOptions,
  type User,
  createClient,
} from "@supabase/supabase-js";
import type { GenericSchema } from "@supabase/supabase-js/dist/module/lib/types";
import Elysia from "elysia";
import process from "node:process";

/**
 * Supabase authentication guard, which injects the Supabase client for the authenticated user.
 *
 * Takes the same arguments as createClient from the supabase-js package,
 * but replaces the auth header with the one from the request.
 *
 * If the request does not have an Authorization header or the token is invalid, the request will be rejected as unauthorized.
 */
export const supabase = <
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      any,
>(
  supabase_url = process.env.SUPABASE_URL,
  supabase_anon_key = process.env.SUPABASE_ANON_KEY,
  options?: SupabaseClientOptions<SchemaName>,
): Elysia<
  "",
  false,
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    decorator: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    store: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    derive: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    resolve: {};
  },
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    type: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    error: {};
  },
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    schema: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    macro: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    macroFn: {};
  },
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  {},
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    derive: {};
    resolve: {
      supabase: SupabaseClient<Database, SchemaName, Schema>;
      user: User;
    };
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    schema: {};
  },
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    derive: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    resolve: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    schema: {};
  }
> =>
  new Elysia({ name: "supabase_auth_guard" }).resolve(
    {
      as: "scoped",
    },
    async ({ request, error }) => {
      if (!supabase_url) {
        return error(500, "SUPABASE_URL is not set");
      }

      if (!supabase_anon_key) {
        return error(500, "SUPABASE_ANON_KEY is not set");
      }

      const Authorization = request.headers.get("Authorization");

      if (!Authorization) {
        return error(401, "Authorization header is missing");
      }

      const supabase = createClient<Database, SchemaName, Schema>(
        supabase_url,
        supabase_anon_key,
        {
          ...options,
          global: {
            ...options?.global,
            headers: { Authorization },
          },
        },
      );

      const resp = await supabase.auth.getUser();

      if (resp.error) {
        return error(401);
      }

      return { supabase, user: resp.data.user };
    },
  );

/**
 * Supabase authentication guard, which injects the Supabase client for the authenticated user.
 *
 * Takes the same arguments as createClient from the supabase-js package,
 * but replaces the auth header with the one from the request.
 *
 * Returns user only if the token has one - so it should work with the anon key.
 * If the request does not have an Authorization header or the token is invalid, the request will be rejected as unauthorized.
 */
export const anon_supabase = <
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  Database = any,
  SchemaName extends string & keyof Database = "public" extends keyof Database
    ? "public"
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      any,
>(
  supabase_url = process.env.SUPABASE_URL,
  supabase_anon_key = process.env.SUPABASE_ANON_KEY,
  options?: SupabaseClientOptions<SchemaName>,
): Elysia<
  "",
  false,
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    decorator: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    store: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    derive: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    resolve: {};
  },
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    type: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    error: {};
  },
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    schema: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    macro: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    macroFn: {};
  },
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  {},
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    derive: {};
    resolve: {
      supabase: SupabaseClient<Database, SchemaName, Schema>;
      user: User | null;
    };
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    schema: {};
  },
  {
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    derive: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    resolve: {};
    // biome-ignore lint/complexity/noBannedTypes: <explanation>
    schema: {};
  }
> =>
  new Elysia({ name: "supabase_auth_guard" }).resolve(
    {
      as: "scoped",
    },
    async ({ request, error }) => {
      if (!supabase_url) {
        return error(500, "SUPABASE_URL is not set");
      }

      if (!supabase_anon_key) {
        return error(500, "SUPABASE_ANON_KEY is not set");
      }

      const Authorization = request.headers.get("Authorization");

      if (!Authorization) {
        return error(401, "Authorization header is missing");
      }

      const supabase = createClient<Database, SchemaName, Schema>(
        supabase_url,
        supabase_anon_key,
        {
          ...options,
          global: {
            ...options?.global,
            headers: { Authorization },
          },
        },
      );

      const resp = await supabase.auth.getUser();

      return { supabase, user: resp.data.user };
    },
  );
