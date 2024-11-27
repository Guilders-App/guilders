import { Provider } from "@/lib/db/types";
import { z } from "zod";
import { publicProcedure, router } from "../server";

export const providerRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("provider").select("*");

    if (error) throw error;
    return data as Provider[];
  }),

  getById: publicProcedure
    .input(z.number().nullable())
    .query(async ({ ctx, input: id }) => {
      if (!id) return null;

      const { data, error } = await ctx.supabase
        .from("provider")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Provider;
    }),
});
