import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ProviderSchema, ProvidersSchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Providers"],
      summary: "Get all providers",
      description: "Retrieve a list of all available providers",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of providers retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(ProvidersSchema),
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
      const supabase = c.get("supabase");
      const { data, error } = await supabase.from("provider").select("*");

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
      path: "/:id",
      tags: ["Providers"],
      summary: "Get provider by ID",
      description: "Retrieve a specific provider by its ID",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Provider ID",
        },
      ],
      responses: {
        200: {
          description: "Provider found",
          content: {
            "application/json": {
              schema: createSuccessSchema(ProviderSchema),
            },
          },
        },
        404: {
          description: "Provider not found",
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
      const id = c.req.param("id");
      const supabase = c.get("supabase");
      const { data: provider, error } = await supabase
        .from("provider")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!provider) {
        return c.json({ data: null, error: `Provider ${id} not found` }, 404);
      }

      return c.json({ data: provider, error: null }, 200);
    },
  );

export default app;
