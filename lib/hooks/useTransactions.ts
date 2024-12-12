import {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
} from "@/lib/db/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryKey = ["transactions"] as const;

type TransactionsResponse = {
  success: boolean;
  transactions: Transaction[];
};

type SingleTransactionResponse = {
  success: boolean;
  transaction: Transaction;
};

export function useTransactions(accountId?: number) {
  return useQuery<Transaction[], Error>({
    queryKey,
    queryFn: async (): Promise<Transaction[]> => {
      const url = accountId
        ? `/api/transactions?accountId=${accountId}`
        : "/api/transactions";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = (await response.json()) as TransactionsResponse;
      return data.transactions;
    },
  });
}

export function useTransaction(transactionId: number) {
  return useQuery<Transaction, Error>({
    queryKey: [...queryKey, transactionId],
    queryFn: async (): Promise<Transaction> => {
      const response = await fetch(`/api/transactions/${transactionId}`);
      if (!response.ok) throw new Error("Failed to fetch transaction");
      const data = (await response.json()) as SingleTransactionResponse;
      return data.transaction;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, TransactionInsert>({
    mutationFn: async (transaction): Promise<Transaction> => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      const data = (await response.json()) as SingleTransactionResponse;
      return data.transaction;
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) => [
        ...old,
        newTransaction,
      ]);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, TransactionUpdate>({
    mutationFn: async (updatedTransaction): Promise<Transaction> => {
      const response = await fetch(
        `/api/transactions/${updatedTransaction.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTransaction),
        }
      );
      if (!response.ok) throw new Error("Failed to update transaction");
      const data = (await response.json()) as SingleTransactionResponse;
      return data.transaction;
    },
    onSuccess: (updatedTransaction) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) =>
        old.map((transaction) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction
        )
      );
    },
  });
}

export function useRemoveTransaction() {
  const queryClient = useQueryClient();
  return useMutation<number, Error, number>({
    mutationFn: async (transactionId): Promise<number> => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove transaction");
      return transactionId;
    },
    onSuccess: (transactionId) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) =>
        old.filter((transaction) => transaction.id !== transactionId)
      );
    },
  });
}
