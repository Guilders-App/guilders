import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { DeleteResponseSchema, UserSchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/me",
      tags: ["Users"],
      summary: "Get current user",
      description: "Retrieve the currently authenticated user's information",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "User found",
          content: {
            "application/json": {
              schema: createSuccessSchema(UserSchema),
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
      const user = c.get("user");
      return c.json({ data: user, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/me",
      tags: ["Users"],
      summary: "Delete current user",
      description: "Delete the currently authenticated user's account",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "User deleted successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(DeleteResponseSchema),
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

      // Get user's provider connections
      const { data: connections, error: connectionsError } = await supabase
        .from("provider_connection")
        .select(
          `
          *,
          provider:provider_id (
            name
          )
        `,
        )
        .eq("user_id", user.id);

      if (connectionsError) {
        return c.json(
          { data: null, error: "Failed to fetch connections" },
          500,
        );
      }

      // Delete user's provider connections
      if (connections.length > 0) {
        const { error: deleteConnectionsError } = await supabase
          .from("provider_connection")
          .delete()
          .eq("user_id", user.id);

        if (deleteConnectionsError) {
          return c.json(
            { data: null, error: "Failed to delete connections" },
            500,
          );
        }
      }

      // Delete user
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
        user.id,
      );

      if (deleteUserError) {
        return c.json({ data: null, error: "Failed to delete user" }, 500);
      }

      return c.json({ data: {}, error: null }, 200);
    },
  );

export default app;
