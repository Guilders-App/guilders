import { type TSchema, t } from "elysia";

export type Response<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// Helper function to create response schemas
export function createResponseSchema<T extends TSchema>(dataSchema: T) {
  return t.Union([
    t.Object({
      data: dataSchema,
      error: t.Null(),
    }),
    t.Object({
      data: t.Null(),
      error: t.String(),
    }),
  ]);
}
