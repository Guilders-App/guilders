import { supabaseAuth } from "@/middleware/supabaseAuth";
import currenciesRoute from "@/routes/currencies";
import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new OpenAPIHono();

app
  .use("*", logger())
  .use("*", cors())
  .use("*", prettyJSON())
  .use("*", supabaseAuth());

// Register security scheme
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

// Swagger UI
app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  }),
);

app.doc("/doc", {
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
const appRoutes = app.route("/currencies", currenciesRoute);

// Start the server
const port = 3003;
Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`🔥 Hono is running at http://localhost:${port}`);

export type AppType = typeof appRoutes;
