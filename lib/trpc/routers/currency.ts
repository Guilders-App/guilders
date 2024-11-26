import { Tables } from "@/lib/db/database.types";
import { publicProcedure, router } from "../server";

export const currencyRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("currency").select("*");

    if (error) throw error;
    return data as Tables<"currency">[];
  }),
});
