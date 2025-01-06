import type { Transaction, TransactionInsert } from "@guilders/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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

      if (!response.ok) {
        throw new Error(
          error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      if (error || !data) {
        throw new Error(error || "Failed to add transaction");
      }

      return data;
    },
    onError: (error) => {
      toast.error("Failed to add transaction", {
        description: error.message || "Please try again later",
      });
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) => [
        ...old,
        newTransaction,
      ]);
      queryClient.invalidateQueries({ queryKey: accountsQueryKey });

      toast.success("Transaction added successfully", {
        description: "Your transaction has been added to your account.",
      });
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

      if (!response.ok) {
        throw new Error(
          error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      if (error || !data) {
        throw new Error(error || "Failed to update transaction");
      }

      return data;
    },
    onError: (error) => {
      toast.error("Failed to update transaction", {
        description: error.message || "Please try again later",
      });
    },
    onSuccess: (updatedTransaction) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) =>
        old.map((transaction) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction,
        ),
      );

      queryClient.invalidateQueries({
        queryKey: accountsQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: queryKey,
        exact: true,
      });

      toast.success("Transaction updated", {
        description: "Your transaction has been updated successfully.",
      });
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

      if (!response.ok) {
        throw new Error(
          error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      if (error || !data) {
        throw new Error(error || "Failed to delete transaction");
      }

      return transactionId;
    },
    onError: (error) => {
      toast.error("Failed to delete transaction", {
        description: error.message || "Please try again later",
      });
    },
    onSuccess: (transactionId) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (old = []) =>
        old.filter((transaction) => transaction.id !== transactionId),
      );
      queryClient.invalidateQueries({ queryKey: accountsQueryKey });

      toast.success("Transaction deleted", {
        description: "Your transaction has been deleted successfully.",
      });
    },
  });
}
