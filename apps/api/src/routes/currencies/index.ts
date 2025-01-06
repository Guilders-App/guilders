import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CurrenciesSchema, CurrencySchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables; Bindings: Bindings }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Currencies"],
      summary: "Get all currencies",
      description: "Retrieve a list of all supported currencies",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of currencies retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(CurrenciesSchema),
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
      const { data, error } = await supabase.from("currency").select("*");

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
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:code",
      tags: ["Currencies"],
      summary: "Get currency by code",
      parameters: [
        {
          name: "code",
          in: "path",
          required: true,
          schema: {
            type: "string",
            minLength: 3,
            maxLength: 3,
          },
          description: "Currency code (ISO 4217)",
        },
      ],
      responses: {
        200: {
          description: "Currency found",
          content: {
            "application/json": {
              schema: createSuccessSchema(CurrencySchema),
            },
          },
        },
        404: {
          description: "Currency not found",
          content: {
            "application/json": {
              schema: ErrorSchema,
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
      const code = c.req.param("code").toUpperCase();
      const supabase = c.get("supabase");
      const { data: currency, error } = await supabase
        .from("currency")
        .select()
        .eq("code", code)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!currency) {
        return c.json({ data: null, error: `Currency ${code} not found` }, 404);
      }

      return c.json({ data: currency, error: null }, 200);
    },
  );

export default app;
