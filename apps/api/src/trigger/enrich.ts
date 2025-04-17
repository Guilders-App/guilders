import { NtropyClient } from "@/lib/ntropy/ntropy";
import type { AccountHolder } from "@/lib/ntropy/schema";
import { TransactionSchema } from "@/routes/transactions/schema";
import type { Transaction, TransactionCategory } from "@/types";
import { createClient } from "@guilders/database/server";
import { task } from "@trigger.dev/sdk/v3";

async function enrichTransactions(
  transactions: Transaction[],
  userId: string,
): Promise<Transaction[]> {
  if (!process.env.NTROPY_API_KEY) {
    throw new Error("NTROPY_API_KEY is not set");
  }

  const ntropy = new NtropyClient(process.env.NTROPY_API_KEY);
  await getAccountHolder(userId);

  return Promise.all(
    transactions.map((transaction) =>
      enrichSingleTransaction(transaction, userId, ntropy),
    ),
  );
}

async function enrichTransaction(
  transaction: Transaction,
  userId: string,
): Promise<Transaction> {
  if (!process.env.NTROPY_API_KEY) {
    throw new Error("NTROPY_API_KEY is not set");
  }

  const ntropy = new NtropyClient(process.env.NTROPY_API_KEY);
  await getAccountHolder(userId);

  return await enrichSingleTransaction(transaction, userId, ntropy);
}

async function getAccountHolder(userId: string): Promise<AccountHolder> {
  if (!process.env.NTROPY_API_KEY) {
    throw new Error("NTROPY_API_KEY is not set");
  }

  const ntropy = new NtropyClient(process.env.NTROPY_API_KEY);
  const accountHolder = await ntropy.getAccountHolder(userId);

  if (!accountHolder) {
    return ntropy.createAccountHolder({
      id: userId,
      type: "consumer",
    });
  }

  return accountHolder;
}

async function getTransactionCategories(): Promise<TransactionCategory[]> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  const supabase = await createClient({
    admin: true,
    ssr: false,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

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

async function enrichSingleTransaction(
  transaction: Transaction,
  userId: string,
  ntropy: NtropyClient,
): Promise<Transaction> {
  const transactionCategories = await getTransactionCategories();
  const enrichedTransaction = await ntropy.enrichTransaction({
    id: transaction.id.toString(),
    description: transaction.description,
    date: new Date(transaction.date).toLocaleDateString("en-CA"),
    amount: Math.abs(transaction.amount),
    currency: transaction.currency,
    entry_type: transaction.amount > 0 ? "incoming" : "outgoing",
    account_holder_id: userId,
  });

  transaction.description =
    enrichedTransaction.entities.counterparty.name ?? transaction.description;

  const category = transactionCategories.find(
    (category: TransactionCategory) =>
      category.name === enrichedTransaction.categories.general,
  );

  if (category) {
    transaction.category_id = category.id;
  }

  return transaction;
}

export const enrichTransactionTask = task({
  id: "enrich-transaction",
  maxDuration: 300,
  run: async (payload: { transaction: Transaction }) => {
    const supabase = await createClient({
      admin: true,
      ssr: false,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      url: process.env.SUPABASE_URL!,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      key: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    });

    const parsedPayload = TransactionSchema.parse(payload.transaction);

    const { data: account, error: accountError } = await supabase
      .from("account")
      .select("user_id")
      .eq("id", parsedPayload.account_id)
      .single();

    if (accountError) {
      console.error(accountError);
      return { error: accountError.message };
    }

    const enrichedTransaction = await enrichTransaction(
      parsedPayload,
      account.user_id,
    );

    const { error: enrichedTransactionError } = await supabase
      .from("transaction")
      .update(enrichedTransaction)
      .eq("id", parsedPayload.id)
      .select();

    if (enrichedTransactionError) {
      console.error(enrichedTransactionError);
      return { error: enrichedTransactionError.message };
    }

    return {
      message: "Transaction enriched",
    };
  },
});
