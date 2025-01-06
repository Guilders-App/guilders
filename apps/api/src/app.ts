import snaptradeCallbackRoute from "@/callback/providers/snaptrade/route";
import stripeCallbackRoute from "@/callback/stripe/route";
import { supabaseAuth } from "@/middleware/supabaseAuth";
import accountsRoute from "@/routes/accounts";
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
import transactionsRoute from "@/routes/transactions";
import usersRoute from "@/routes/users";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new OpenAPIHono();

app.use("*", logger()).use("*", cors()).use("*", prettyJSON());

// Register security scheme
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

// Swagger UI
app.get(
  "/swagger",
  apiReference({
    spec: {
      url: "/swagger.json",
    },
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
app.route("/callback/snaptrade", snaptradeCallbackRoute);

// Mount routes
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
  .route("/users", usersRoute)
  .route("/accounts", accountsRoute)
  .route("/documents", documentsRoute)
  .route("/connections", connectionsRoute)
  .route("/subscription", subscriptionRoute);

// Start the server
const port = 3002;
Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`🔥 Hono is running at http://localhost:${port}`);

// showRoutes(app, { verbose: true });

export { app };
export type AppType = typeof appRoutes;
