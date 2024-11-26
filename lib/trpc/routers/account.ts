import {
  Account,
  AccountSubtypeZod,
  AccountType,
  AccountUpdate,
} from "@/lib/db/types";
import { z } from "zod";
import { protectedProcedure, router } from "../server";

export const accountRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: allAccounts, error } = await ctx.supabase
      .from("account")
      .select("*");

    if (error) throw error;

    const accountsMap = new Map();
    allAccounts.forEach((account) => {
      accountsMap.set(account.id, { ...account, children: [] });
    });

    const topLevelAccounts: Account[] = [];
    allAccounts.forEach((account) => {
      if (account.parent) {
        const parentAccount = accountsMap.get(account.parent);
        if (parentAccount) {
          parentAccount.children.push(accountsMap.get(account.id));
        }
      } else {
        topLevelAccounts.push(accountsMap.get(account.id));
      }
    });

    return topLevelAccounts;
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { data: account, error } = await ctx.supabase
        .from("account")
        .select("*")
        .eq("id", input)
        .single();

      if (error) throw error;
      return account;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        subtype: AccountSubtypeZod,
        value: z.number(),
        currency: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const type =
        input.subtype === "creditcard" || input.subtype === "loan"
          ? "liability"
          : "asset";

      const { data: newAccount, error } = await ctx.supabase
        .from("account")
        .insert({
          ...input,
          type,
          value:
            type === "liability" && input.value >= 0
              ? -input.value
              : input.value,
          user_id: ctx.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newAccount;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          subtype: AccountSubtypeZod.optional(),
          value: z.number().optional(),
          currency: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dataToUpdate: Partial<AccountUpdate & { type: AccountType }> = {
        ...input.data,
      };

      if (input.data.subtype) {
        dataToUpdate.type =
          input.data.subtype === "creditcard" || input.data.subtype === "loan"
            ? "liability"
            : "asset";
      }

      const { data: updatedAccount, error } = await ctx.supabase
        .from("account")
        .update(dataToUpdate)
        .eq("id", input.id)
        .select()
        .single();

      if (error) throw error;
      return updatedAccount;
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from("account")
        .delete()
        .eq("id", input);

      if (error) throw error;
      return true;
    }),
});
