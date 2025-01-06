import { ErrorSchema, createSuccessSchema } from "@/common/types";
import type { Bindings, Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { InstitutionSchema, InstitutionsSchema } from "./schema";

const app = new OpenAPIHono<{ Variables: Variables; Bindings: Bindings }>()
  .openapi(
    createRoute({
      method: "get",
      path: "/",
      tags: ["Institutions"],
      summary: "Get all institutions",
      description: "Retrieve a list of all supported institutions",
      security: [{ Bearer: [] }],
      responses: {
        200: {
          description: "List of institutions retrieved successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(InstitutionsSchema),
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
      const { data, error } = await supabase.from("institution").select("*");

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      const filteredData = data.filter((institution) => institution.enabled);

      return c.json(
        {
          data: filteredData,
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
      tags: ["Institutions"],
      summary: "Get institution by institution id",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Institution id",
        },
      ],
      responses: {
        200: {
          description: "Institution found",
          content: {
            "application/json": {
              schema: createSuccessSchema(InstitutionSchema),
            },
          },
        },
        404: {
          description: "Institution not found",
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
      const { data: institution, error } = await supabase
        .from("institution")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        return c.json({ data: null, error: error.message }, 500);
      }

      if (!institution) {
        return c.json(
          { data: null, error: `Institution ${id} not found` },
          404,
        );
      }

      return c.json({ data: institution, error: null }, 200);
    },
  );

export default app;
