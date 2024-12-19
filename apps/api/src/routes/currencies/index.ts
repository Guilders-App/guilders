import { supabase } from "@/plugins/supabase";
import type { Database } from "@guilders/database/types";
import Elysia from "elysia";
import { currenciesResponseSchema } from "./types";

const route = new Elysia({ prefix: "/currencies" })
  .use(supabase<Database>())
  .get(
    "/",
    async ({ supabase }) => {
      const { data, error } = await supabase.from("currency").select("*");

      if (error || !data)
        return { data: null, error: "Failed to fetch currencies" };

      return { data, error: null };
    },
    {
      detail: {
        tags: ["Currencies"],
        summary: "Get all currencies",
        description: "Get all currencies",
        security: [{ BearerAuth: [] }],
      },
      response: currenciesResponseSchema,
    },
  );

export { route as currenciesRoute };
