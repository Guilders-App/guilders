import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ProviderConnectionSchema, ProviderConnectionsSchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables; Bindings: Bindings }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Provider Connections"],
      summary: "Get all provider connections",
      description:
        "Retrieve all provider connections for the authenticated user",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of provider connections retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(ProviderConnectionsSchema),
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
      const user = c.get("user");

      const { data, error } = await supabase
        .from("provider_connection")
        .select("*")
        .eq("user_id", user.id);

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
      path: "/:id",
      tags: ["Provider Connections"],
      summary: "Get provider connection by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Provider connection ID",
        },
      ],
      responses: {
        200: {
          description: "Provider connection found",
          content: {
            "application/json": {
              schema: createSuccessSchema(ProviderConnectionSchema),
            },
          },
        },
        404: {
          description: "Provider connection not found",
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
      const id = Number(c.req.param("id"));
      const supabase = c.get("supabase");
      const user = c.get("user");

      const { data, error } = await supabase
        .from("provider_connection")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!data) {
        return c.json(
          { data: null, error: `Provider connection ${id} not found` },
          404,
        );
      }

      return c.json({ data, error: null }, 200);
    },
  );

export default app;
