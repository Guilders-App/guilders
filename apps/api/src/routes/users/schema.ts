import { z } from "@hono/zod-openapi";

export const UserSchema = z
  .object({
    id: z.string(),
    email: z.string().email().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .openapi("User");

export const UsersSchema = z.array(UserSchema);
export const DeleteResponseSchema = z.object({}).openapi("DeleteResponse");

// Export inferred types
export type User = z.infer<typeof UserSchema>;
export type Users = z.infer<typeof UsersSchema>;
