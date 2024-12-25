import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  InstitutionConnectionSchema,
  InstitutionConnectionsSchema,
} from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Institution Connections"],
      summary: "Get all institution connections",
      description:
        "Retrieve all institution connections for the authenticated user",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of institution connections retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(InstitutionConnectionsSchema),
            },
          },
        },
        401: {
          description: "Unauthorized",
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
      const supabase = c.get("supabase");
      const user = c.get("user");

      if (!user) {
        return c.json({ data: null, error: "Unauthorized" }, 401);
      }

      const { data, error } = await supabase
        .from("institution_connection")
        .select(`
          *,
          institution (*),
          provider_connection (
            id,
            user_id,
            provider_id,
            secret,
            created_at,
            updated_at
          )
        `)
        .eq("provider_connection.user_id", user.id);

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
      tags: ["Institution Connections"],
      summary: "Get institution connection by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Institution connection ID",
        },
      ],
      responses: {
        200: {
          description: "Institution connection found",
          content: {
            "application/json": {
              schema: createSuccessSchema(InstitutionConnectionSchema),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: ErrorSchema,
            },
          },
        },
        404: {
          description: "Institution connection not found",
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

      if (!user) {
        return c.json({ data: null, error: "Unauthorized" }, 401);
      }

      const { data, error } = await supabase
        .from("institution_connection")
        .select(`
          *,
          institution (*),
          provider_connection (
            id,
            user_id,
            provider_id,
            secret,
            created_at,
            updated_at
          )
        `)
        .eq("id", id)
        .eq("provider_connection.user_id", user.id)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!data) {
        return c.json(
          { data: null, error: `Institution connection ${id} not found` },
          404,
        );
      }

      return c.json({ data, error: null }, 200);
    },
  );

export default app;
