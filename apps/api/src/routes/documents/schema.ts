import { z } from "@hono/zod-openapi";

export const DocumentEntityTypeSchema = z.enum(["account", "transaction"]);

export const DocumentSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    name: z.string().openapi({
      example: "document.pdf",
    }),
    path: z.string().openapi({
      example: "user_123/accounts/456/document.pdf",
    }),
    size: z.number().openapi({
      example: 1024,
    }),
    type: z.string().openapi({
      example: "application/pdf",
    }),
    entity_type: DocumentEntityTypeSchema.openapi({
      example: "account",
    }),
    entity_id: z.number().openapi({
      example: 1,
    }),
    user_id: z.string().openapi({
      example: "user_123",
    }),
    created_at: z.string().openapi({
      example: "2024-01-01T00:00:00Z",
    }),
    updated_at: z.string().openapi({
      example: "2024-01-01T00:00:00Z",
    }),
  })
  .openapi("Document");

export const CreateDocumentSchema = z
  .object({
    file: z.any().openapi({
      type: "string",
      format: "binary",
    }),
    entity_type: z.enum(["account", "transaction"]).openapi({
      example: "account",
    }),
    entity_id: z.coerce.number().openapi({
      example: 1,
    }),
  })
  .openapi("CreateDocument");

export const DeleteDocumentSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
  })
  .openapi("DeleteDocument");

export const GetDocumentResponseSchema = z.object({
  url: z.string().openapi({
    example: "https://example.com/document.pdf",
  }),
});

export const CreateDocumentResponseSchema = DocumentSchema.pick({
  id: true,
  name: true,
  path: true,
  size: true,
  type: true,
});

export type Document = z.infer<typeof DocumentSchema>;
export type DocumentEntityType = z.infer<typeof DocumentEntityTypeSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type DeleteDocument = z.infer<typeof DeleteDocumentSchema>;
export type GetDocumentResponse = z.infer<typeof GetDocumentResponseSchema>;
export type CreateDocumentResponse = z.infer<
  typeof CreateDocumentResponseSchema
>;
