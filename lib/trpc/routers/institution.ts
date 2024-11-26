import { Institution } from "@/lib/db/types";
import { publicProcedure, router } from "../server";

export const institutionRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("institution").select("*");

    if (error) throw error;
    return data as Institution[];
  }),
});
