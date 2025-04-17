import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { cache } from "hono/cache";
import { TransactionCategoriesSchema } from "./schema";

const app = new OpenAPIHono<{
  Variables: Variables;
  Bindings: Bindings;
}>().openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Transaction Categories"],
    summary: "Get all transaction categories",
    description: "Retrieve a list of all supported transaction categories",
    security: [{ Bearer: [] }],
    responses: {
      200: {
        description: "List of transaction categories retrieved successfully",
        content: {
          "application/json": {
            schema: createSuccessSchema(TransactionCategoriesSchema),
          },
        },
      },
      500: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    const supabase = c.get("supabase");
    const { data, error } = await supabase
      .from("transaction_category")
      .select("*");

    if (error) {
      return c.json({ data: null, error: error.message }, 500);
    }

    return c.json(
      {
        data,
        error: null,
      },
      200,
    );
  },
);

app.get(
  "*",
  cache({
    cacheName: "guilders-api",
    cacheControl: "max-age=3600",
  }),
);

export default app;
