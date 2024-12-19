import { z } from "@hono/zod-openapi";

// Standard error response schema
export const ErrorSchema = z.object({
  data: z.null().openapi({
    example: null,
  }),
  error: z.string().openapi({
    example: "An error occurred",
  }),
});

// Generic success schema that takes a schema type parameter
export function createSuccessSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    error: z.null().openapi({
      example: null,
    }),
  });
}
