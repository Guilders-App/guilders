import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CountriesSchema, CountrySchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Countries"],
      summary: "Get all countries",
      description: "Retrieve a list of all supported countries",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of countries retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(CountriesSchema),
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
      const { data, error } = await supabase.from("country").select("*");

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
      tags: ["Countries"],
      summary: "Get country by country code",
      parameters: [
        {
          name: "code",
          in: "path",
          required: true,
          schema: {
            type: "string",
            minLength: 2,
            maxLength: 2,
          },
          description: "Country code (ISO 4217)", // TODO: What ISO is that?
        },
      ],
      responses: {
        200: {
          description: "Country found",
          content: {
            "application/json": {
              schema: createSuccessSchema(CountrySchema),
            },
          },
        },
        404: {
          description: "Country not found",
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
      const { data: country, error } = await supabase
        .from("country")
        .select()
        .eq("code", code)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!country) {
        return c.json({ data: null, error: `Currency ${code} not found` }, 404);
      }

      return c.json({ data: country, error: null }, 200);
    },
  );

export default app;
