import type { Transaction, TransactionInsert } from "@guilders/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../api";
import { queryKey as accountsQueryKey } from "./useAccounts";

const queryKey = ["transactions"] as const;

export function useTransactions(accountId?: number) {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<Transaction[]> => {
      const api = await getApiClient();
      const response = await api.transactions.$get({
        query: {
          accountId,
        },
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return data;
    },
  });
}

export function useTransaction(transactionId: number) {
  return useQuery({
    queryKey: [...queryKey, transactionId],
    queryFn: async (): Promise<Transaction> => {
      const api = await getApiClient();
      const response = await api.transactions[":id"].$get({
        param: {
          id: transactionId.toString(),
        },
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return data;
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, TransactionInsert>({
    mutationFn: async (transaction): Promise<Transaction> => {
      const api = await getApiClient();
      const response = await api.transactions.$post({
        json: transaction,
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return data;
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) => [
        ...old,
        newTransaction,
      ]);
      queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation<
    Transaction,
    Error,
    { transactionId: number; transaction: TransactionInsert }
  >({
    mutationFn: async ({
      transactionId,
      transaction,
    }): Promise<Transaction> => {
      const api = await getApiClient();
      const response = await api.transactions[":id"].$put({
        param: {
          id: transactionId.toString(),
        },
        json: transaction,
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return data;
    },
    onSuccess: (updatedTransaction) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) =>
        old.map((transaction) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction,
        ),
      );
      queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}

export function useRemoveTransaction() {
  const queryClient = useQueryClient();
  return useMutation<number, Error, number>({
    mutationFn: async (transactionId): Promise<number> => {
      const api = await getApiClient();
      const response = await api.transactions[":id"].$delete({
        param: {
          id: transactionId.toString(),
        },
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return transactionId;
    },
    onSuccess: (transactionId) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) =>
        old.filter((transaction) => transaction.id !== transactionId),
      );
      queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    },
  });
}
