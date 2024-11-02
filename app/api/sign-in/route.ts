import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/sign-in:
 *   post:
 *     tags:
 *       - Authentication
 *     security: []
 *     summary: Sign in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: >-
 *                     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { email, password } = await request.json();

  supabase.auth;
  const { data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!data.session) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ access_token: data.session?.access_token });
}
