import countriesRoute from "@/routes/countries";
import currenciesRoute from "@/routes/currencies";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { supabaseAuth } from "./middleware/supabaseAuth";

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

// Mount routes
app.use("*", supabaseAuth());
const appRoutes = app
  .route("/currencies", currenciesRoute)
  .route("/countries", countriesRoute);

// Start the server
const port = 3002;
Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`🔥 Hono is running at http://localhost:${port}`);

export { app };
export type AppType = typeof appRoutes;
