import { TransactionUpdate } from "@/lib/db/types";
import { z } from "zod";
import { protectedProcedure, router } from "../server";

export const transactionRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: transactions, error } = await ctx.supabase
      .from("transaction")
      .select("*");

    if (error) throw error;
    return transactions;
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data: transaction, error } = await ctx.supabase
        .from("transaction")
        .select("*")
        .eq("id", input)
        .single();

      if (error) throw error;
      return transaction;
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        amount: z.number(),
        currency: z.string(),
        description: z.string(),
        category: z.string(),
        account_id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: newTransaction, error } = await ctx.supabase
        .from("transaction")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return newTransaction;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          date: z.string().optional(),
          amount: z.number().optional(),
          currency: z.string().optional(),
          description: z.string().optional(),
          category: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dataToUpdate: Partial<TransactionUpdate> = { ...input.data };

      const { data: updatedTransaction, error } = await ctx.supabase
        .from("transaction")
        .update(dataToUpdate)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return updatedTransaction;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("transaction")
        .delete()
        .eq("id", input);

      if (error) throw error;
      return true;
    }),
});
