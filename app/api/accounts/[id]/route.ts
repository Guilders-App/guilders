import { TablesUpdate } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/server";
import { AccountUpdate } from "@/lib/db/types";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Get an account by ID
 *     description: Get an account by ID for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Filtered by RLS for the user
    const { data: account, error } = await supabase
      .from("account")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching account" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     tags:
 *       - Accounts
 *     summary: Delete an account by ID
 *     description: Delete an account by ID for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully deleted account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Filtered by RLS for the user
    const { error } = await supabase.from("account").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error deleting account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting account" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     tags:
 *       - Accounts
 *     summary: Update an account by ID
 *     description: Update an account by ID for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully updated account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const updatedData: AccountUpdate = await request.json();
    const { id } = await params;
    const dataToUpdate: TablesUpdate<"account"> = { ...updatedData };

    // Check if subtype is present and update type accordingly
    if (updatedData.subtype) {
      dataToUpdate.type =
        dataToUpdate.subtype === "creditcard" || dataToUpdate.subtype === "loan"
          ? "liability"
          : "asset";
    }

    // Filtered by RLS for the user
    const { data: updatedAccount, error } = await supabase
      .from("account")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error updating account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, account: updatedAccount });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { success: false, error: "Error updating account" },
      { status: 500 }
    );
  }
}
