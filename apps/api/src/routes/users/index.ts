import { ErrorSchema, VoidSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { supabaseAdmin } from "@/lib/supabase";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { type UpdateUser, UpdateUserSchema, UserSchema } from "./schema";

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
      const supabase = c.get("supabase");
      const user = c.get("user");

      // Fetch user settings
      const { data: settings, error: settingsError } = await supabase
        .from("user_setting")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Fetch subscription status
      const { data: subscription } = await supabase
        .from("subscription")
        .select("status")
        .eq("user_id", user.id)
        .single();

      if (settingsError) {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from("user_setting")
          .insert({ user_id: user.id, currency: "EUR" })
          .select()
          .single();

        if (createError) {
          return c.json(
            { data: null, error: "Failed to create user settings" },
            500,
          );
        }

        return c.json(
          {
            data: {
              email: user.email ?? "",
              settings: newSettings,
              subscription: { status: subscription?.status ?? "unsubscribed" },
            },
            error: null,
          },
          200,
        );
      }

      return c.json(
        {
          data: {
            email: user.email ?? "",
            settings,
            subscription: { status: subscription?.status ?? "unsubscribed" },
          },
          error: null,
        },
        200,
      );
    },
  )
  .openapi(
    createRoute({
      method: "patch",
      path: "/me",
      tags: ["Users"],
      summary: "Update current user",
      description: "Update the currently authenticated user's information",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: UpdateUserSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "User updated successfully",
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
      const supabase = c.get("supabase");
      const user = c.get("user");
      const { email, password, settings }: UpdateUser = await c.req.json();

      // Handle auth updates if provided
      if ((email && email !== user.email) || password) {
        const { error: authError } =
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            email,
            password,
          });

        if (authError) {
          return c.json(
            { data: null, error: "Failed to update auth details" },
            500,
          );
        }
      }

      // Handle settings updates if provided
      if (settings) {
        const { error: settingsError } = await supabase
          .from("user_setting")
          .update(settings)
          .eq("user_id", user.id);

        if (settingsError) {
          return c.json(
            { data: null, error: "Failed to update settings" },
            500,
          );
        }
      }

      const { data: subscription } = await supabase
        .from("subscription")
        .select("status")
        .eq("user_id", user.id)
        .single();

      // Fetch user settings
      const { data: userSettings, error: settingsError } = await supabase
        .from("user_setting")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsError) {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from("user_setting")
          .insert({ user_id: user.id, currency: "EUR" })
          .select()
          .single();

        if (createError) {
          return c.json(
            { data: null, error: "Failed to create user settings" },
            500,
          );
        }

        const {
          data: { user: updatedUser },
        } = await supabase.auth.admin.getUserById(user.id);

        return c.json(
          {
            data: {
              email: updatedUser?.email ?? "",
              settings: newSettings,
              subscription: { status: subscription?.status ?? "unsubscribed" },
            },
            error: null,
          },
          200,
        );
      }

      const {
        data: { user: updatedUser },
      } = await supabase.auth.admin.getUserById(user.id);

      return c.json(
        {
          data: {
            email: updatedUser?.email ?? "",
            settings: userSettings,
            subscription: { status: subscription?.status ?? "unsubscribed" },
          },
          error: null,
        },
        200,
      );
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
              schema: createSuccessSchema(VoidSchema),
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
