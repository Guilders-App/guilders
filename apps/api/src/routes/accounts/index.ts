import { ErrorSchema, VoidSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  AccountSchema,
  AccountsSchema,
  CreateAccountSchema,
  UpdateAccountSchema,
} from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Accounts"],
      summary: "Get all accounts",
      description: "Retrieve all accounts for the authenticated user",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of accounts retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(AccountsSchema),
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

      const { data: allAccounts, error } = await supabase
        .from("account")
        .select(`
          *,
          institution_connection (
            broken,
            institution (
              name,
              logo_url,
              provider (
                id,
                name
              )
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      // Create a map of all accounts
      const accountsMap = new Map();
      for (const account of allAccounts) {
        accountsMap.set(account.id, {
          ...account,
          children: [],
          institution_connection: account.institution_connection?.institution
            ? {
                broken: account.institution_connection.broken,
                institution: {
                  name: account.institution_connection.institution.name,
                  logo_url: account.institution_connection.institution.logo_url,
                },
                provider: account.institution_connection.institution.provider
                  ? {
                      id: account.institution_connection.institution.provider
                        .id,
                      name: account.institution_connection.institution.provider
                        .name,
                    }
                  : undefined,
              }
            : null,
        });
      }

      // Build the account hierarchy
      const topLevelAccounts = [];
      for (const account of allAccounts) {
        if (account.parent) {
          const parentAccount = accountsMap.get(account.parent);
          const entry = accountsMap.get(account.id);
          if (parentAccount && entry) {
            parentAccount.children.push(entry);
          }
        } else {
          const entry = accountsMap.get(account.id);
          if (entry) {
            topLevelAccounts.push(entry);
          }
        }
      }

      return c.json({ data: topLevelAccounts, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Accounts"],
      summary: "Create a new account",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateAccountSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Account created successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(AccountSchema),
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
      const accountData = await c.req.json();

      const type =
        accountData.subtype === "creditcard" || accountData.subtype === "loan"
          ? "liability"
          : "asset";

      const value =
        type === "liability" && accountData.value >= 0
          ? -accountData.value
          : accountData.value;

      const { data: account, error } = await supabase
        .from("account")
        .insert({
          ...accountData,
          type,
          value,
          user_id: user.id,
        })
        .select(`
          *,
          institution_connection (
            broken,
            institution (
              name,
              logo_url,
              provider (
                id,
                name
              )
            )
          )
        `)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      const transformedAccount = {
        ...account,
        children: [],
        institution_connection: account.institution_connection?.institution
          ? {
              broken: account.institution_connection.broken,
              institution: {
                name: account.institution_connection.institution.name,
                logo_url: account.institution_connection.institution.logo_url,
              },
              provider: account.institution_connection.institution.provider
                ? {
                    id: account.institution_connection.institution.provider.id,
                    name: account.institution_connection.institution.provider
                      .name,
                  }
                : undefined,
            }
          : null,
      };

      return c.json({ data: transformedAccount, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:id",
      tags: ["Accounts"],
      summary: "Get account by ID",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Account ID",
        },
      ],
      responses: {
        200: {
          description: "Account found",
          content: {
            "application/json": {
              schema: createSuccessSchema(AccountSchema),
            },
          },
        },
        404: {
          description: "Account not found",
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
      const user = c.get("user");

      const { data: account, error } = await supabase
        .from("account")
        .select(`
          *,
          institution_connection (
            broken,
            institution (
              name,
              logo_url,
              provider (
                id,
                name
              )
            )
          )
        `)
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !account) {
        return c.json({ data: null, error: "Account not found" }, 404);
      }

      // Get children accounts
      const { data: children, error: childrenError } = await supabase
        .from("account")
        .select(`
          *,
          institution_connection (
            broken,
            institution (
              name,
              logo_url,
              provider (
                id,
                name
              )
            )
          )
        `)
        .eq("parent", id)
        .eq("user_id", user.id);

      if (childrenError) {
        return c.json({ data: null, error: childrenError.message }, 500);
      }

      const accountWithChildren = {
        ...account,
        children: children || [],
        institution_connection: account.institution_connection?.institution
          ? {
              broken: account.institution_connection.broken,
              institution: {
                name: account.institution_connection.institution.name,
                logo_url: account.institution_connection.institution.logo_url,
              },
              provider: account.institution_connection.institution.provider
                ? {
                    id: account.institution_connection.institution.provider.id,
                    name: account.institution_connection.institution.provider
                      .name,
                  }
                : undefined,
            }
          : null,
      };

      return c.json({ data: accountWithChildren, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/:id",
      tags: ["Accounts"],
      summary: "Update account",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Account ID",
        },
      ],
      request: {
        body: {
          content: {
            "application/json": {
              schema: UpdateAccountSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Account updated successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(AccountSchema),
            },
          },
        },
        404: {
          description: "Account not found",
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
      const user = c.get("user");
      const updates = await c.req.json();

      if (updates.subtype) {
        updates.type =
          updates.subtype === "creditcard" || updates.subtype === "loan"
            ? "liability"
            : "asset";
      }

      const { data: account, error } = await supabase
        .from("account")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select(`
          *,
          institution_connection (
            broken,
            institution (
              name,
              logo_url,
              provider (
                id,
                name
              )
            )
          )
        `)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!account) {
        return c.json({ data: null, error: "Account not found" }, 404);
      }

      // Transform to match schema
      const transformedAccount = {
        ...account,
        children: [],
        institution_connection: account.institution_connection?.institution
          ? {
              broken: account.institution_connection.broken,
              institution: {
                name: account.institution_connection.institution.name,
                logo_url: account.institution_connection.institution.logo_url,
              },
              provider: account.institution_connection.institution.provider
                ? {
                    id: account.institution_connection.institution.provider.id,
                    name: account.institution_connection.institution.provider
                      .name,
                  }
                : undefined,
            }
          : null,
      };

      return c.json({ data: transformedAccount, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/:id",
      tags: ["Accounts"],
      summary: "Delete account",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Account ID",
        },
      ],
      responses: {
        200: {
          description: "Account deleted successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(VoidSchema),
            },
          },
        },
        404: {
          description: "Account not found",
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
      const user = c.get("user");

      const { error: findError } = await supabase
        .from("account")
        .select()
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (findError) {
        return c.json({ data: null, error: findError.message }, 404);
      }

      const { error } = await supabase
        .from("account")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      return c.json({ data: {}, error: null }, 200);
    },
  );

export default app;
