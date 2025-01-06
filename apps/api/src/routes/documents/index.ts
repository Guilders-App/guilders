import { ErrorSchema, VoidSchema, createSuccessSchema } from "@/common/types";
import type { Variables } from "@/common/variables";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {
  CreateDocumentResponseSchema,
  CreateDocumentSchema,
  DeleteDocumentSchema,
  GetDocumentResponseSchema,
} from "./schema";

const app = new OpenAPIHono<{ Variables: Variables }>()
  .openapi(
    createRoute({
      method: "post",
      path: "/",
      tags: ["Documents"],
      summary: "Upload a document",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: CreateDocumentSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Document uploaded successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(CreateDocumentResponseSchema),
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
        404: {
          description: "Entity not found",
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

      const formData = await c.req.formData();
      const parsed = CreateDocumentSchema.safeParse({
        file: formData.get("file"),
        entity_type: formData.get("entity_type"),
        entity_id: formData.get("entity_id"),
      });

      if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        return c.json({ data: null, error: parsed.error.message }, 400);
      }

      const { file, entity_type, entity_id } = parsed.data;

      console.log("Parsed data:", { file, entity_type, entity_id });

      if (!file) {
        console.error("No file provided");
        return c.json(
          {
            data: null,
            error: "No file provided",
          },
          400,
        );
      }

      // Verify entity ownership through RLS
      const { data: entity, error: entityError } = await supabase
        .from(entity_type)
        .select()
        .eq("id", entity_id)
        .single();

      if (entityError || !entity) {
        console.error("Entity not found:", entityError);
        return c.json({ data: null, error: "Entity not found" }, 404);
      }

      const filePath = `${user.id}/${entity_type}/${entity_id}/${file.name}`;

      // First upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from("user_files")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return c.json({ data: null, error: uploadError.message }, 500);
      }

      // Create document record
      const { data: document, error: documentError } = await supabase
        .from("document")
        .insert({
          name: file.name,
          path: filePath,
          size: file.size,
          type: file.type,
          entity_type,
          entity_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (documentError) {
        console.error("Error creating document, cleaning up:", documentError);
        // Cleanup uploaded file if document creation fails
        await supabase.storage.from("user_files").remove([filePath]);
        return c.json({ data: null, error: documentError.message }, 500);
      }

      // Get current documents array
      const { data: currentEntity, error: currentError } = await supabase
        .from(entity_type)
        .select("documents")
        .eq("id", entity_id)
        .single();

      console.log("Current entity:", currentEntity);

      if (currentError) {
        // Cleanup if fetching current documents fails
        console.error("Error fetching current documents:", currentError);
        await supabase.storage.from("user_files").remove([filePath]);
        await supabase.from("document").delete().eq("id", document.id);
        return c.json({ data: null, error: currentError.message }, 500);
      }

      // Update entity with new document ID
      const { error: updateError } = await supabase
        .from(entity_type)
        .update({
          documents: [
            ...(currentEntity.documents || []),
            document.id.toString(),
          ],
        })
        .eq("id", entity_id);

      if (updateError) {
        // Cleanup everything if update fails
        console.error("Error updating entity, cleaning up:", updateError);
        await supabase.storage.from("user_files").remove([filePath]);
        await supabase.from("document").delete().eq("id", document.id);
        return c.json({ data: null, error: updateError.message }, 500);
      }

      return c.json(
        {
          data: {
            id: document.id,
            name: document.name,
            path: document.path,
            size: document.size,
            type: document.type,
          },
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
      tags: ["Documents"],
      summary: "Get document signed URL",
      security: [{ Bearer: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "number",
          },
          description: "Document ID",
        },
      ],
      responses: {
        200: {
          description: "Signed URL generated successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(GetDocumentResponseSchema),
            },
          },
        },
        404: {
          description: "Document not found",
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
      const id = Number(c.req.param("id"));

      // Get document to verify ownership and get path
      const { data: document, error: documentError } = await supabase
        .from("document")
        .select()
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (documentError || !document) {
        return c.json({ data: null, error: "Document not found" }, 404);
      }

      const { data, error: signedUrlError } = await supabase.storage
        .from("user_files")
        .createSignedUrl(document.path, 1800); // 30 minutes

      if (signedUrlError) {
        return c.json({ data: null, error: signedUrlError.message }, 500);
      }

      return c.json({ data: { url: data.signedUrl }, error: null }, 200);
    },
  )
  .openapi(
    createRoute({
      method: "delete",
      path: "/",
      tags: ["Documents"],
      summary: "Delete a document",
      security: [{ Bearer: [] }],
      request: {
        body: {
          content: {
            "application/json": {
              schema: DeleteDocumentSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "Document deleted successfully",
          content: {
            "application/json": {
              schema: createSuccessSchema(VoidSchema),
            },
          },
        },
        404: {
          description: "Document not found",
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
      const { id } = await c.req.json();

      // Get document to verify ownership and get path
      const { data: document, error: documentError } = await supabase
        .from("document")
        .select()
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (documentError || !document) {
        return c.json({ data: null, error: "Document not found" }, 404);
      }

      // Get current documents array from entity
      const { data: entity, error: entityError } = await supabase
        .from(document.entity_type)
        .select("documents")
        .eq("id", document.entity_id)
        .single();

      if (entityError || !entity) {
        return c.json(
          { data: null, error: entityError?.message || "Entity not found" },
          500,
        );
      }

      // Update entity documents array
      const { error: updateError } = await supabase
        .from(document.entity_type)
        .update({
          documents: (entity.documents || []).filter(
            (docId: string) => docId !== id.toString(),
          ),
        })
        .eq("id", document.entity_id);

      if (updateError) {
        return c.json({ data: null, error: updateError.message }, 500);
      }

      // Delete document record
      const { error: deleteDocError } = await supabase
        .from("document")
        .delete()
        .eq("id", id);

      if (deleteDocError) {
        return c.json({ data: null, error: deleteDocError.message }, 500);
      }

      // Delete file from storage
      const { error: deleteFileError } = await supabase.storage
        .from("user_files")
        .remove([document.path]);

      if (deleteFileError) {
        console.error("Error deleting file from storage:", deleteFileError);
      }

      return c.json({ data: {}, error: null }, 200);
    },
  );

export default app;
