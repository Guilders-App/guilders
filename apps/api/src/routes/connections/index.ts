import { ErrorSchema, VoidSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { getEnv } from "@/env";
import { getProvider } from "@/providers";
import type { Providers } from "@/providers/types";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  ConnectionResponseSchema,
  CreateConnectionSchema,
  ReconnectSchema,
  RefreshConnectionSchema,
  RegisterConnectionSchema,
  RegisterResponseSchema,
} from "./schema";

const app = new OpenAPIHono<{ Variables: Variables; Bindings: Bindings }>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Connections"],
      summary: "Create a new provider connection",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateConnectionSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Connection created successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(ConnectionResponseSchema),
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
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const env = getEnv(c.env);
        const { provider_id, institution_id } = await c.req.json();

        const { data: providerDb, error: providerDbError } = await supabase
          .from("provider")
          .select()
          .eq("id", provider_id)
          .single();

        if (providerDbError || !providerDb) {
          return c.json({ data: null, error: "Provider not found" }, 404);
        }

        const providerInstance = getProvider(
          providerDb.name as Providers,
          supabase,
          env,
        );

        const { data: providerConnection } = await supabase
          .from("provider_connection")
          .select("*")
          .eq("provider_id", providerDb.id)
          .eq("user_id", user.id)
          .single();

        let userSecret = providerConnection?.secret;

        if (!userSecret) {
          const registerResult = await providerInstance.registerUser(user.id);
          if (!registerResult.success || !registerResult.data?.userSecret) {
            return c.json(
              { data: null, error: "Failed to register user with provider" },
              500,
            );
          }

          const { error: insertError } = await supabase
            .from("provider_connection")
            .insert({
              provider_id: providerDb.id,
              user_id: user.id,
              secret: registerResult.data.userSecret,
            });

          if (insertError) {
            return c.json(
              { data: null, error: "Failed to save provider connection" },
              500,
            );
          }

          userSecret = registerResult.data.userSecret;
        }

        const { data: institution } = await supabase
          .from("institution")
          .select("*")
          .eq("id", institution_id)
          .single();

        if (!institution) {
          return c.json({ data: null, error: "Institution not found" }, 404);
        }

        const result = await providerInstance.connect({
          userId: user.id,
          providerInstitutionId: institution.provider_institution_id,
          userSecret,
          institutionId: institution.id.toString(),
        });

        if (!result.success || !result.data?.redirectURI) {
          return c.json(
            { data: null, error: result.error || "Unknown error" },
            500,
          );
        }

        return c.json({ data: result.data, error: null }, 200);
      } catch (error) {
        return c.json(
          { data: null, error: "Error connecting to provider" },
          500,
        );
      }
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/reconnect",
      tags: ["Connections"],
      summary: "Reconnect an existing provider connection",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: ReconnectSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Reconnection initiated successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(ConnectionResponseSchema),
            },
          },
        },
        404: {
          description: "No existing connection found",
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
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const env = getEnv(c.env);
        const { provider_id, institution_id, account_id } = await c.req.json();

        const { data: providerDb, error: providerDbError } = await supabase
          .from("provider")
          .select()
          .eq("id", provider_id)
          .single();

        if (providerDbError || !providerDb) {
          return c.json({ data: null, error: "Provider not found" }, 404);
        }

        const providerInstance = getProvider(
          providerDb.name as Providers,
          supabase,
          env,
        );

        const { data: providerConnection } = await supabase
          .from("provider_connection")
          .select("*")
          .eq("provider_id", providerDb.id)
          .eq("user_id", user.id)
          .single();

        if (!providerConnection?.secret) {
          return c.json(
            { data: null, error: "No existing connection found" },
            404,
          );
        }

        const { data: account } = await supabase
          .from("account")
          .select("institution_connection!inner(connection_id)")
          .eq("id", account_id)
          .single();

        if (!account?.institution_connection?.connection_id) {
          return c.json(
            { data: null, error: "No existing connection found for account" },
            404,
          );
        }

        const { data: institution } = await supabase
          .from("institution")
          .select("*")
          .eq("id", institution_id)
          .single();

        if (!institution) {
          return c.json({ data: null, error: "Institution not found" }, 404);
        }

        const result = await providerInstance.reconnect({
          userId: user.id,
          providerInstitutionId: institution.provider_institution_id,
          userSecret: providerConnection.secret,
          connectionId: account.institution_connection.connection_id,
        });

        if (!result.success || !result.data?.redirectURI) {
          return c.json(
            { data: null, error: result.error || "Unknown error" },
            500,
          );
        }

        return c.json({ data: result.data, error: null }, 200);
      } catch (error) {
        return c.json(
          { data: null, error: "Error reconnecting to provider" },
          500,
        );
      }
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/register",
      tags: ["Connections"],
      summary: "Register with a provider",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: RegisterConnectionSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successfully registered with provider",
          content: {
            "application/json": {
              schema: createSuccessSchema(RegisterResponseSchema),
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
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const env = getEnv(c.env);
        const { provider_id } = await c.req.json();

        const { data: providerDb, error: providerDbError } = await supabase
          .from("provider")
          .select()
          .eq("id", provider_id)
          .single();

        if (providerDbError || !providerDb) {
          return c.json({ data: null, error: "Provider not found" }, 404);
        }

        const providerInstance = getProvider(
          providerDb.name as Providers,
          supabase,
          env,
        );
        const result = await providerInstance.registerUser(user.id);

        if (!result.success || !result.data?.userSecret) {
          return c.json(
            {
              data: null,
              error: result.error || "Failed to register with provider",
            },
            500,
          );
        }

        // Save the connection in the database
        const { error: dbError } = await supabase
          .from("provider_connection")
          .insert({
            user_id: user.id,
            provider_id: provider_id,
            secret: result.data.userSecret,
          });

        if (dbError) {
          return c.json(
            { data: null, error: "Failed to save provider connection" },
            500,
          );
        }

        return c.json(
          { data: { secret: result.data.userSecret }, error: null },
          200,
        );
      } catch (error) {
        return c.json({ data: null, error: "Error during registration" }, 500);
      }
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/deregister",
      tags: ["Connections"],
      summary: "Deregister from a provider",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: RegisterConnectionSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successfully deregistered from provider",
          content: {
            "application/json": {
              schema: createSuccessSchema(VoidSchema),
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
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const env = getEnv(c.env);
        const { provider_id } = await c.req.json();

        const { data: providerDb, error: providerDbError } = await supabase
          .from("provider")
          .select("*")
          .eq("id", provider_id)
          .single();

        if (providerDbError || !providerDb) {
          return c.json({ data: null, error: "Provider not found" }, 404);
        }

        const providerInstance = getProvider(
          providerDb.name as Providers,
          supabase,
          env,
        );

        const { data: connection } = await supabase
          .from("provider_connection")
          .select("*")
          .eq("provider_id", providerDb.id)
          .eq("user_id", user.id)
          .single();

        if (!connection) {
          return c.json({ data: {}, error: null }, 200);
        }

        const result = await providerInstance.deregisterUser(user.id);

        if (!result.success) {
          return c.json(
            { data: null, error: "Failed to deregister from provider" },
            500,
          );
        }

        // Database deletion is also handled by the snaptrade webhook
        const { error: dbError } = await supabase
          .from("provider_connection")
          .delete()
          .eq("provider_id", providerDb.id)
          .eq("user_id", user.id);

        if (dbError) {
          return c.json(
            { data: null, error: "Failed to remove provider connection" },
            500,
          );
        }

        return c.json({ data: {}, error: null }, 200);
      } catch (error) {
        return c.json(
          { data: null, error: "Error during deregistration" },
          500,
        );
      }
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/refresh",
      tags: ["Connections"],
      summary: "Refresh a provider connection",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: RefreshConnectionSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Connection refreshed successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(VoidSchema),
            },
          },
        },
        404: {
          description: "Connection not found",
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
      try {
        const supabase = c.get("supabase");
        const user = c.get("user");
        const env = getEnv(c.env);
        const { provider_id, connection_id } = await c.req.json();

        const { data: providerDb, error: providerDbError } = await supabase
          .from("provider")
          .select("*")
          .eq("id", provider_id)
          .single();

        if (providerDbError || !providerDb) {
          return c.json({ data: null, error: "Provider not found" }, 404);
        }

        const providerInstance = getProvider(
          providerDb.name as Providers,
          supabase,
          env,
        );

        const { data: providerConnection } = await supabase
          .from("provider_connection")
          .select("*")
          .eq("provider_id", providerDb.id)
          .eq("user_id", user.id)
          .single();

        if (!providerConnection?.secret) {
          return c.json(
            { data: null, error: "No existing connection found" },
            404,
          );
        }

        const result = await providerInstance.refreshConnection(
          user.id,
          providerConnection.secret,
          connection_id,
        );

        if (!result.success) {
          return c.json(
            {
              data: null,
              error: result.error || "Failed to refresh connection",
            },
            500,
          );
        }

        return c.json({ data: {}, error: null }, 200);
      } catch (error) {
        return c.json(
          { data: null, error: "Error refreshing connection" },
          500,
        );
      }
    },
  );

export default app;
