import { createClient } from "@/lib/db/server";
import { TransactionUpdate } from "@/lib/db/types";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get a transaction by ID
 *     description: Get a transaction by ID for the authenticated user
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
 *         description: Successfully fetched transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const jwt = getJwt(request);

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Filtered by RLS for the user
    const { data: transaction, error } = await supabase
      .from("transaction")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching transaction" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Delete a transaction by ID
 *     description: Delete a transaction by ID for the authenticated user
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
 *         description: Successfully deleted transaction
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
    const jwt = getJwt(request);
    const { id } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Filtered by RLS for the user
    const { error } = await supabase.from("transaction").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error deleting transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting transaction" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Update a transaction by ID
 *     description: Update a transaction by ID for the authenticated user
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
 *         description: Successfully updated transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const updatedData: TransactionUpdate = await request.json();
    const { id } = await params;
    const jwt = getJwt(request);
    const dataToUpdate: TransactionUpdate = { ...updatedData };

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Filtered by RLS for the user
    const { data: updatedTransaction, error } = await supabase
      .from("transaction")
      .update(dataToUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error updating transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Error updating transaction" },
      { status: 500 }
    );
  }
}
