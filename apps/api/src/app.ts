import enrichmentCallbackRoute from "@/callback/enrichment/route";
import enablebankingCallbackRoute from "@/callback/providers/enablebanking/route";
import snaptradeCallbackRoute from "@/callback/providers/snaptrade/route";
import stripeCallbackRoute from "@/callback/stripe/route";
import type { Bindings } from "@/common/variables";
import { insertInstitutions } from "@/cron/insert-institutions";
import { insertRates } from "@/cron/insert-rates";
import { updateAccounts } from "@/cron/update-accounts";
import { updateTransactions } from "@/cron/update-transactions";
import { supabaseAuth } from "@/middleware/supabaseAuth";
import accountsRoute from "@/routes/accounts";
import chatRoute from "@/routes/chat";
import connectionsRoute from "@/routes/connections";
import countriesRoute from "@/routes/countries";
import currenciesRoute from "@/routes/currencies";
import documentsRoute from "@/routes/documents";
import institutionConnectionsRoute from "@/routes/institution-connections";
import institutionsRoute from "@/routes/institutions";
import providerConnectionsRoute from "@/routes/provider-connections";
import providersRoute from "@/routes/providers";
import ratesRoute from "@/routes/rates/index";
import subscriptionRoute from "@/routes/subscription";
import transactionCategoriesRoute from "@/routes/transaction-categories";
import transactionsRoute from "@/routes/transactions";
import usersRoute from "@/routes/users";
import type {
  ExecutionContext,
  ScheduledEvent,
} from "@cloudflare/workers-types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.use("*", cors()).use("*", prettyJSON());

// OpenAPI / Swagger
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

app.get(
  "/swagger",
  Scalar({
    url: "/swagger.json",
  }),
);

app.doc("/swagger.json", {
  info: {
    title: "An API",
    version: "v1",
  },
  openapi: "3.1.0",
});

// Error handler
app.onError((err, c) => {
  console.error(err);

  if (err instanceof HTTPException) {
    return c.json({ data: null, error: err.message }, err.status);
  }

  return c.json({ data: null, error: err.message }, 500);
});

// Mount callback routes
app.route("/callback/stripe", stripeCallbackRoute);
app.route("/callback/enrichment", enrichmentCallbackRoute);
app.route("/callback/providers/snaptrade", snaptradeCallbackRoute);
app.route("/callback/providers/enablebanking", enablebankingCallbackRoute);

// Mount routes
// Supabase Auth only applies to routes below
app.use("*", supabaseAuth());
const appRoutes = app
  .route("/currencies", currenciesRoute)
  .route("/countries", countriesRoute)
  .route("/institutions", institutionsRoute)
  .route("/institution-connections", institutionConnectionsRoute)
  .route("/providers", providersRoute)
  .route("/provider-connections", providerConnectionsRoute)
  .route("/rates", ratesRoute)
  .route("/transactions", transactionsRoute)
  .route("/transaction-categories", transactionCategoriesRoute)
  .route("/users", usersRoute)
  .route("/accounts", accountsRoute)
  .route("/documents", documentsRoute)
  .route("/connections", connectionsRoute)
  .route("/subscription", subscriptionRoute)
  .route("/chat", chatRoute);

export type AppType = typeof appRoutes;
export default {
  scheduled: async (
    event: ScheduledEvent,
    env: Bindings,
    ctx: ExecutionContext,
  ) => {
    if (!env) {
      throw new Error("Bindings are not defined");
    }

    switch (event.cron) {
      case "0 * * * *":
        await insertRates(env);
        break;
      case "0 0 * * *":
        await insertInstitutions(env);
        break;
      case "0 */6 * * *":
        await Promise.all([updateAccounts(env), updateTransactions(env)]);
        break;
    }
  },
  fetch: app.fetch,
  app,
};
