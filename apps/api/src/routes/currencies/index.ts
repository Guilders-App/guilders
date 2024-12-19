import { supabase } from "@/lib/supabase";
import { ErrorSchema, createSuccessSchema } from "@/types";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CurrenciesSchema, CurrencySchema } from "./schema";

const app = new OpenAPIHono()
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
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
      },
    }),
    async (c) => {
      const { data, error } = await supabase.from("currency").select("*");

      if (error) {
        return c.json({ data: null, error: error.message }, 400);
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
      path: "/currencies/:code",
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
      const { data: currencies, error } = await supabase
        .from("currency")
        .select("*");

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      const currency = currencies.find((curr) => curr.code === code);

      if (!currency) {
        return c.json({ data: null, error: `Currency ${code} not found` }, 404);
      }

      return c.json({ data: currency, error: null }, 200);
    },
  );

export default app;
