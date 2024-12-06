import { TablesUpdate } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/server";
import { Account, AccountUpdate } from "@/lib/db/types";
import { getJwt } from "@/lib/utils";
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

    const { data: account, error } = await supabase
      .from("account")
      .select(
        `
        *,
        institution_connection (
          broken,
          institution (
            name,
            logo_url
          )
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching account" },
        { status: 500 }
      );
    }

    const { data: allAccounts, error: childrenError } = await supabase
      .from("account")
      .select(
        `
        *,
        institution_connection (
          broken,
          institution (
            name,
            logo_url
          )
        )
      `
      )
      .eq("user_id", user.id);

    if (childrenError) {
      console.error("Supabase error:", childrenError);
      return NextResponse.json(
        { success: false, error: "Error fetching account children" },
        { status: 500 }
      );
    }

    // Create a map of all accounts
    const accountsMap = new Map<number, Account>();
    allAccounts.forEach((acc) => {
      accountsMap.set(acc.id, {
        ...acc,
        children: [],
        institution_connection: acc.institution_connection?.institution
          ? {
              broken: acc.institution_connection.broken,
              institution: {
                name: acc.institution_connection.institution.name,
                logo_url: acc.institution_connection.institution.logo_url,
              },
            }
          : null,
      });
    });

    // Build the children hierarchy for the requested account
    allAccounts.forEach((acc) => {
      if (acc.parent) {
        const parentAccount = accountsMap.get(acc.parent);
        if (parentAccount) {
          parentAccount.children.push(accountsMap.get(acc.id)!);
        }
      }
    });

    const accountWithChildren = accountsMap.get(parseInt(id));
    if (!accountWithChildren) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, account: accountWithChildren });
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

    const { error } = await supabase
      .from("account")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

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
    const updatedData: AccountUpdate = await request.json();
    const { id } = await params;
    const jwt = getJwt(request);
    const dataToUpdate: TablesUpdate<"account"> = { ...updatedData };

    // Check if subtype is present and update type accordingly
    if (updatedData.subtype) {
      dataToUpdate.type =
        dataToUpdate.subtype === "creditcard" || dataToUpdate.subtype === "loan"
          ? "liability"
          : "asset";
    }

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: updatedAccount, error } = await supabase
      .from("account")
      .update(dataToUpdate)
      .eq("id", id)
      .eq("user_id", user.id)
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
