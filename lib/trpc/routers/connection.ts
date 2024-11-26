import { Tables } from "@/lib/db/database.types";
import { z } from "zod";
import { protectedProcedure, router } from "../server";

type Connection = Tables<"provider_connection"> & {
  provider: Tables<"provider">;
};

export const connectionRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.from("provider_connection")
      .select(`
        *,
        provider:provider_id (
          name,
          logo_url
        )
      `);

    if (error) throw error;
    // TODO: Fix me
    return data as unknown as Connection[];
  }),

  register: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: providerName }) => {
      const response = await fetch(
        `/api/connections/register/${providerName}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || `Failed to register a ${providerName} user`
        );
      }
      return data;
    }),

  deregister: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: providerName }) => {
      const response = await fetch(
        `/api/connections/deregister/${providerName.toLowerCase()}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || `Failed to deregister a ${providerName} user`
        );
      }
      return data;
    }),

  connect: protectedProcedure
    .input(
      z.object({
        providerName: z.string(),
        institutionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await fetch(
        `/api/connections/connect/${input.providerName}`,
        {
          method: "POST",
          body: JSON.stringify({ institution_id: input.institutionId }),
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || `Failed to create a ${input.providerName} connection`
        );
      }
      return data;
    }),
});
