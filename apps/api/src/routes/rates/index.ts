import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { RateSchema, RatesSchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables; Bindings: Bindings }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Rates"],
      summary: "Get all exchange rates",
      description:
        "Retrieve the latest exchange rates for all supported currencies",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "base",
          in: "query",
          required: false,
          schema: {
            type: "string",
            minLength: 3,
            maxLength: 3,
          },
          description:
            "Base currency code (ISO 4217). Defaults to USD if not specified",
        },
      ],
      responses: {
        200: {
          description: "List of exchange rates retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(RatesSchema),
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
      const base = c.req.query("base")?.toUpperCase() ?? "USD";
      const supabase = c.get("supabase");
      const { data: rates, error } = await supabase.from("rate").select("*");

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (base === "USD") {
        return c.json({ data: rates, error: null }, 200);
      }

      // Find the base currency rate
      const baseRate = rates.find((r) => r.currency_code === base)?.rate;
      if (!baseRate) {
        console.error("Base currency not found", base);
        return c.json(
          { data: null, error: `Base currency ${base} not found` },
          400,
        );
      }

      // Convert all rates to the new base currency
      const convertedRates = rates.map((rate) => ({
        currency_code: rate.currency_code,
        rate: rate.rate / baseRate,
      }));

      return c.json({ data: convertedRates, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:code",
      tags: ["Rates"],
      summary: "Get rate by currency code",
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
        {
          name: "base",
          in: "query",
          required: false,
          schema: {
            type: "string",
            minLength: 3,
            maxLength: 3,
          },
          description:
            "Base currency code (ISO 4217). Defaults to USD if not specified",
        },
      ],
      responses: {
        200: {
          description: "Rate found",
          content: {
            "application/json": {
              schema: createSuccessSchema(RateSchema),
            },
          },
        },
        404: {
          description: "Rate not found",
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
      const base = c.req.query("base")?.toUpperCase() ?? "USD";
      const supabase = c.get("supabase");

      if (base === "USD") {
        const { data: rate, error } = await supabase
          .from("rate")
          .select()
          .eq("currency_code", code)
          .single();

        if (error) {
          return c.json({ data: null, error: error.message }, 500);
        }

        if (!rate) {
          return c.json(
            { data: null, error: `Rate for currency ${code} not found` },
            404,
          );
        }

        return c.json({ data: rate, error: null }, 200);
      }

      // Get both the requested currency rate and base currency rate
      const { data: rates, error } = await supabase
        .from("rate")
        .select()
        .in("currency_code", [code, base]);

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      const targetRate = rates.find((r) => r.currency_code === code)?.rate;
      const baseRate = rates.find((r) => r.currency_code === base)?.rate;

      if (!targetRate || !baseRate) {
        return c.json(
          {
            data: null,
            error: `Rate not found for ${!targetRate ? code : base}`,
          },
          404,
        );
      }

      const convertedRate = {
        currency_code: code,
        rate: targetRate / baseRate,
      };

      return c.json({ data: convertedRate, error: null }, 200);
    },
  );

export default app;
