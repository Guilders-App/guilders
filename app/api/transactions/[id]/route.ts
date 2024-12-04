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

    // Join with account table to filter by user_id
    const { data: transaction, error } = await supabase
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
      .eq("account.user_id", user.id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
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

  const { data: transaction, error: transactionError } = await supabase
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

  const { data: account, error: accountError } = await supabase
    .from("account")
    .select()
    .eq("id", transaction.account_id)
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { success: false, error: "Account not found" },
      { status: 404 }
    );
  }

  const { error } = await supabase.from("transaction").delete().eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting transaction" },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
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

  // First verify the transaction belongs to the user
  const { data: transaction, error: transactionError } = await supabase
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

  const { data: account, error: accountError } = await supabase
    .from("account")
    .select()
    .eq("id", transaction.account_id)
    .eq("user_id", user.id)
    .single();

  if (accountError || !account) {
    return NextResponse.json(
      { success: false, error: "Account not found" },
      { status: 404 }
    );
  }

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

  // Update the account value
  const { error: updateError } = await supabase
    .from("account")
    .update({
      value: account.value - transaction.amount + updatedTransaction.amount,
    })
    .eq("id", transaction.account_id);

  if (updateError) {
    console.error("Supabase error:", updateError);
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
