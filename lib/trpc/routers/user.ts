import { z } from "zod";
import { protectedProcedure, router } from "../server";

export interface UserMetadata {
  email: string;
  currency: string;
}

export const userRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const {
      data: { user },
      error,
    } = await ctx.supabase.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("No user found");

    const currency = user.user_metadata.currency?.toUpperCase();
    if (!currency) {
      await ctx.supabase.auth.updateUser({
        data: { currency: "EUR" },
      });
    }

    return {
      email: user.email ?? "",
      currency: currency ?? "EUR",
    } as UserMetadata;
  }),

  update: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        password: z.string().min(6).optional(),
        currency: z.string().length(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        data: { user },
        error,
      } = await ctx.supabase.auth.updateUser({
        email: input.email,
        password: input.password,
        data: {
          currency: input.currency?.toUpperCase() ?? "EUR",
        },
      });

      if (error) throw error;
      if (!user) throw new Error("No user found");

      return {
        email: user.email,
        currency: user.user_metadata.currency?.toUpperCase() ?? "EUR",
      } as UserMetadata;
    }),
});
