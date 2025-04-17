import app from "@/app";
import type { Bindings, Variables } from "@/common/variables";
import type { Transaction, TransactionCategory } from "@/types";
import type { Context } from "hono";
import { NtropyClient } from "./ntropy/ntropy";
import type { AccountHolder } from "./ntropy/schema";

export async function enrichTransactions(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  transactions: Transaction[],
  userId: string,
): Promise<Transaction[]> {
  const ntropy = new NtropyClient(c.env.NTROPY_API_KEY);
  await getAccountHolder(c, userId);

  return Promise.all(
    transactions.map((transaction) =>
      enrichSingleTransaction(c, transaction, userId, ntropy),
    ),
  );
}

export async function enrichTransaction(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  transaction: Transaction,
  userId: string,
): Promise<Transaction> {
  const ntropy = new NtropyClient(c.env.NTROPY_API_KEY);
  await getAccountHolder(c, userId);

  return await enrichSingleTransaction(c, transaction, userId, ntropy);
}

async function getAccountHolder(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  userId: string,
): Promise<AccountHolder> {
  const ntropy = new NtropyClient(c.env.NTROPY_API_KEY);
  const accountHolder = await ntropy.getAccountHolder(userId);
  if (!accountHolder) {
    return ntropy.createAccountHolder({
      id: userId,
      type: "consumer",
    });
  }

  return accountHolder;
}

async function getCategories(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
): Promise<TransactionCategory[]> {
  const transactionCategoriesResponse = await app.app.request(
    "/transaction-categories",
    c.req.raw,
    c.env,
  );
  const { data: transactionCategories, error: transactionCategoriesError } =
    await transactionCategoriesResponse.json();

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
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  transaction: Transaction,
  userId: string,
  ntropy: NtropyClient,
): Promise<Transaction> {
  const transactionCategories = await getCategories(c);
  const enrichedTransaction = await ntropy.enrichTransaction({
    id: transaction.id.toString(),
    description: transaction.description,
    date: new Date(transaction.date).toLocaleDateString("en-CA"),
    amount: Math.abs(transaction.amount),
    currency: transaction.currency,
    entry_type: transaction.amount > 0 ? "incoming" : "outgoing",
    account_holder_id: userId,
  });

  transaction.description = enrichedTransaction.entities.counterparty.name;

  const category = transactionCategories.find(
    (category: TransactionCategory) =>
      category.name === enrichedTransaction.categories.general,
  );

  if (category) {
    transaction.category = category.id.toString();
  }

  return transaction;
}
