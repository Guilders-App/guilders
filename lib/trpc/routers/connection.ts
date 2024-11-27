import { Tables, TablesUpdate } from "@/lib/db/database.types";
import { saltedge } from "@/lib/providers/saltedge/client";
import { registerSaltEdgeUser } from "@/lib/providers/saltedge/register";
import { snaptrade } from "@/lib/providers/snaptrade/client";
import { registerSnapTradeUser } from "@/lib/providers/snaptrade/register";
import { z } from "zod";
import { protectedProcedure, router } from "../server";

type Connection = Tables<"provider_connection"> & {
  provider: TablesUpdate<"provider">;
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
    return data as Connection[];
  }),

  register: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: providerName }) => {
      const { data: provider } = await ctx.supabase
        .from("provider")
        .select("id")
        .eq("name", providerName)
        .single();

      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const { data: connection } = await ctx.supabase
        .from("provider_connection")
        .select("*")
        .eq("provider_id", provider.id)
        .eq("user_id", ctx.user.id)
        .single();

      if (connection) {
        return connection;
      }

      const registerFunction =
        providerName === "saltedge"
          ? registerSaltEdgeUser
          : registerSnapTradeUser;

      return await registerFunction(ctx.user.id);
    }),

  deregister: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: providerName }) => {
      providerName = providerName.toLowerCase();
      const { data: provider } = await ctx.supabase
        .from("provider")
        .select("id")
        .eq("name", providerName)
        .single();

      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }

      const { data: connection } = await ctx.supabase
        .from("provider_connection")
        .select("*")
        .eq("provider_id", provider.id)
        .eq("user_id", ctx.user.id)
        .single();

      if (!connection) {
        return true;
      }

      if (!connection.secret) {
        throw new Error("User secret not present");
      }

      // Delete connection from provider
      if (providerName === "saltedge") {
        await saltedge.removeCustomer(connection.secret);
      } else if (providerName === "snaptrade") {
        await snaptrade.authentication.deleteSnapTradeUser({
          userId: ctx.user.id,
        });
      } else {
        throw new Error(`Provider ${providerName} not supported`);
      }

      return true;
    }),

  connect: protectedProcedure
    .input(
      z.object({
        providerName: z.string(),
        institutionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      input.providerName = input.providerName.toLowerCase();
      const { data: institution } = await ctx.supabase
        .from("institution")
        .select("*")
        .eq("id", input.institutionId)
        .single();

      if (!institution) {
        throw new Error("Institution not found");
      }

      const { data: providerConnection } = await ctx.supabase
        .from("provider_connection")
        .select("secret")
        .eq("provider_id", institution.provider_id)
        .eq("user_id", ctx.user.id)
        .single();

      if (!providerConnection?.secret) {
        throw new Error("User not registered with provider");
      }

      if (input.providerName === "saltedge") {
        const connection = await saltedge.createConnection(
          providerConnection.secret,
          institution.provider_institution_id,
          {
            institution_id: institution.id.toString(),
            user_id: ctx.user.id,
          }
        );

        if (!connection.connect_url) {
          throw new Error("Failed to create connection");
        }

        return { redirectUrl: connection.connect_url };
      } else if (input.providerName === "snaptrade") {
        const brokerages = await snaptrade.referenceData.listAllBrokerages();
        const brokerage = brokerages.data?.find(
          (b) => b.id === institution.provider_institution_id
        );

        const response = await snaptrade.authentication.loginSnapTradeUser({
          userId: ctx.user.id,
          userSecret: providerConnection.secret,
          broker: brokerage?.slug,
        });

        if (!response.data || !("redirectURI" in response.data)) {
          throw new Error("Failed to generate redirect URL");
        }

        return { redirectUrl: response.data.redirectURI };
      } else {
        throw new Error(`Provider ${input.providerName} not supported`);
      }
    }),
});
