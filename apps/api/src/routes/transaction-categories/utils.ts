import type { Bindings, Variables } from "@/common/variables";
import type { TransactionCategory } from "@/types";
import type { Context } from "hono";

export async function getTransactionCategories(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
): Promise<TransactionCategory[]> {
  const supabase = c.get("supabase");

  const { data: transactionCategories, error: transactionCategoriesError } =
    await supabase.from("transaction_category").select("*");

  if (transactionCategoriesError) {
    console.error(
      "Error fetching transaction categories",
      transactionCategoriesError,
    );
    return [];
  }

  return transactionCategories;
}
