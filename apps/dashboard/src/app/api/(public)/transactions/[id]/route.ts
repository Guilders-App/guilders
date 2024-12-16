import { authenticate } from "@/apps/web/lib/api/auth";
import { TransactionUpdate } from "@/apps/web/lib/db/types";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get a transaction by ID
 *     description: Get a transaction by ID for the authenticated user
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
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = await params;

  // Join with account table to filter by user_id
  const { data: transaction, error: dbError } = await client
    .from("transaction")
    .select(
      `
        *,
        account:account_id (
          user_id
        )
      `
    )
    .eq("id", id)
    .eq("account.user_id", userId)
    .single();

  if (dbError) {
    console.error("Supabase error:", dbError);
    return NextResponse.json(
      { success: false, error: "Error fetching transaction" },
      { status: 500 }
    );
  }

  if (!transaction) {
    return NextResponse.json(
      { success: false, error: "Transaction not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, transaction });
}

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Delete a transaction by ID
 *     description: Delete a transaction by ID for the authenticated user
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
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = await params;

  const { data: transaction, error: transactionError } = await client
    .from("transaction")
    .select()
    .eq("id", id)
    .single();

  if (transactionError || !transaction) {
    return NextResponse.json(
      { success: false, error: "Transaction not found" },
      { status: 404 }
    );
  }

  const { data: account, error: accountError } = await client
    .from("account")
    .select()
    .eq("id", transaction.account_id)
    .eq("user_id", userId)
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { success: false, error: "Account not found" },
      { status: 404 }
    );
  }

  const { error: deleteError } = await client
    .from("transaction")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting transaction" },
      { status: 500 }
    );
  }

  const { error: updateError } = await client
    .from("account")
    .update({
      value: account.value - transaction.amount,
    })
    .eq("id", transaction.account_id);

  if (updateError) {
    console.error("Supabase error:", updateError);
    return NextResponse.json(
      { success: false, error: "Error updating account balance" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Update a transaction by ID
 *     description: Update a transaction by ID for the authenticated user
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
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const updatedData: TransactionUpdate = await request.json();
  const { id } = await params;
  const dataToUpdate: TransactionUpdate = { ...updatedData };

  // First verify the transaction belongs to the user
  const { data: transaction, error: transactionError } = await client
    .from("transaction")
    .select()
    .eq("id", id)
    .single();

  if (transactionError || !transaction) {
    return NextResponse.json(
      { success: false, error: "Transaction not found" },
      { status: 404 }
    );
  }

  const { data: account, error: accountError } = await client
    .from("account")
    .select()
    .eq("id", transaction.account_id)
    .eq("user_id", userId)
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { success: false, error: "Account not found" },
      { status: 404 }
    );
  }

  const { data: updatedTransaction, error: updateError } = await client
    .from("transaction")
    .update(dataToUpdate)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Supabase error:", updateError);
    return NextResponse.json(
      { success: false, error: "Error updating transaction" },
      { status: 500 }
    );
  }

  // Update the account value
  const { error: updateAccountError } = await client
    .from("account")
    .update({
      value: account.value - transaction.amount + updatedTransaction.amount,
    })
    .eq("id", transaction.account_id);

  if (updateAccountError) {
    console.error("Supabase error:", updateAccountError);
    return NextResponse.json(
      { success: false, error: "Error updating account balance" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    transaction: updatedTransaction,
  });
}
