import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  CreateTransactionSchema,
  DeleteResponseSchema,
  TransactionSchema,
  TransactionsSchema,
} from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Transactions"],
      summary: "Get all transactions",
      description: "Retrieve all transactions for the authenticated user",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "accountId",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "Filter transactions by account ID",
        },
      ],
      responses: {
        200: {
          description: "List of transactions retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(TransactionsSchema),
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
      const accountId = c.req.query("accountId");

      let query = supabase
        .from("transaction")
        .select("*, account:account_id(user_id)")
        .eq("account.user_id", user.id)
        .order("date", { ascending: false });

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data, error } = await query;

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      return c.json({ data, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Transactions"],
      summary: "Create a new transaction",
      security: [{ Bearer: [] }],
      request: {
        body: {
          description: "Transaction to create",
          required: true,
          content: {
            "application/json": {
              schema: CreateTransactionSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Transaction created successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(TransactionSchema),
            },
          },
        },
        403: {
          description: "Forbidden - Invalid account",
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
      const transactionData = await c.req.json();

      // Verify the account belongs to the user
      const { data: account, error: accountError } = await supabase
        .from("account")
        .select("id, value")
        .eq("id", transactionData.account_id)
        .eq("user_id", user.id)
        .single();

      if (accountError || !account) {
        return c.json({ data: null, error: "Invalid account" }, 403);
      }

      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transaction")
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        return c.json({ data: null, error: transactionError.message }, 500);
      }

      // Update the account value
      const { error: updateError } = await supabase
        .from("account")
        .update({
          value: account.value + transaction.amount,
        })
        .eq("id", transaction.account_id);

      if (updateError) {
        // Rollback the transaction
        await supabase.from("transaction").delete().eq("id", transaction.id);
        return c.json(
          { data: null, error: "Error updating account balance" },
          500,
        );
      }

      return c.json({ data: transaction, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/:id",
      tags: ["Transactions"],
      summary: "Get transaction by ID",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Transaction ID",
        },
      ],
      responses: {
        200: {
          description: "Transaction found",
          content: {
            "application/json": {
              schema: createSuccessSchema(TransactionSchema),
            },
          },
        },
        404: {
          description: "Transaction not found",
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

      const { data, error } = await supabase
        .from("transaction")
        .select("*, account:account_id(user_id)")
        .eq("id", id)
        .eq("account.user_id", user.id)
        .single();

      if (error || !data) {
        return c.json({ data: null, error: "Transaction not found" }, 404);
      }

      return c.json({ data, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "put",
      path: "/:id",
      tags: ["Transactions"],
      summary: "Update transaction",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Transaction ID",
        },
      ],
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateTransactionSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Transaction updated",
          content: {
            "application/json": {
              schema: createSuccessSchema(TransactionSchema),
            },
          },
        },
        404: {
          description: "Transaction not found",
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

      const { data: existing } = await supabase
        .from("transaction")
        .select("*, account:account_id(user_id)")
        .eq("id", id)
        .eq("account.user_id", user.id)
        .single();

      if (!existing) {
        return c.json({ data: null, error: "Transaction not found" }, 404);
      }

      const { data, error } = await supabase
        .from("transaction")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      return c.json({ data, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/:id",
      tags: ["Transactions"],
      summary: "Delete transaction",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Transaction ID",
        },
      ],
      responses: {
        200: {
          description: "Transaction deleted",
          content: {
            "application/json": {
              schema: createSuccessSchema(DeleteResponseSchema),
            },
          },
        },
        404: {
          description: "Transaction not found",
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

      const { data: existing } = await supabase
        .from("transaction")
        .select("*, account:account_id(user_id)")
        .eq("id", id)
        .eq("account.user_id", user.id)
        .single();

      if (!existing) {
        return c.json({ data: null, error: "Transaction not found" }, 404);
      }

      const { error } = await supabase
        .from("transaction")
        .delete()
        .eq("id", id);

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      return c.json({ data: {}, error: null }, 200);
    },
  );

export default app;
