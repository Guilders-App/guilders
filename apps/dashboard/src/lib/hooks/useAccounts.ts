import type {
  Account,
  CreateAccount,
  UpdateAccount,
} from "@guilders/api/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiClient } from "../api";

export const queryKey = ["accounts"] as const;

export function useAccounts() {
  return useQuery<Account[], Error>({
    queryKey,
    queryFn: async (): Promise<Account[]> => {
      const api = await getApiClient();
      const response = await api.accounts.$get();
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return data;
    },
  });
}

export function useAccount(accountId: number) {
  return useQuery<Account | undefined, Error>({
    queryKey: [...queryKey, accountId],
    queryFn: async (): Promise<Account> => {
      const api = await getApiClient();
      const response = await api.accounts[":id"].$get({
        param: {
          id: accountId.toString(),
        },
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error);
      return data;
    },
    enabled: !!accountId,
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, CreateAccount>({
    mutationFn: async (account): Promise<Account> => {
      const api = await getApiClient();
      const response = await api.accounts.$post({
        json: account,
      });
      const { data, error } = await response.json();

      if (!response.ok) {
        throw new Error(
          error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      if (error || !data) {
        throw new Error(error || "Failed to add account");
      }

      return data;
    },
    onError: () => {
      toast.error("Failed to add account", {
        description: "Please try again later",
      });
    },
    onSuccess: (newAccount) => {
      queryClient.setQueryData<Account[]>(queryKey, (old = []) => [
        ...old,
        newAccount,
      ]);
      toast.success("Account added successfully", {
        description: "Your account has been created.",
      });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, { id: number; account: UpdateAccount }>({
    mutationFn: async ({ id, account }): Promise<Account> => {
      const api = await getApiClient();
      const response = await api.accounts[":id"].$put({
        param: {
          id: id.toString(),
        },
        json: account,
      });
      const { data, error } = await response.json();

      if (!response.ok) {
        throw new Error(
          error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      if (error || !data) {
        throw new Error(error || "Failed to update account");
      }

      return data;
    },
    onError: () => {
      toast.error("Failed to update account", {
        description: "Please try again later",
      });
    },
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData<Account[]>(queryKey, (old = []) =>
        old.map((account) =>
          account.id === updatedAccount.id ? updatedAccount : account,
        ),
      );
      toast.success("Account updated", {
        description: "Your account has been updated successfully.",
      });
    },
  });
}

export function useRemoveAccount() {
  const queryClient = useQueryClient();
  return useMutation<number, Error, number>({
    mutationFn: async (accountId): Promise<number> => {
      const api = await getApiClient();
      const response = await api.accounts[":id"].$delete({
        param: {
          id: accountId.toString(),
        },
      });
      const { data, error } = await response.json();

      if (!response.ok) {
        throw new Error(
          error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      if (error) {
        throw new Error(error || "Failed to delete account");
      }

      return accountId;
    },
    onError: () => {
      toast.error("Failed to delete account", {
        description: "Please try again later",
      });
    },
    onSuccess: (accountId) => {
      queryClient.setQueryData<Account[]>(queryKey, (old = []) =>
        old.filter((account) => account.id !== accountId),
      );
      toast.success("Account deleted", {
        description: "Your account has been deleted successfully.",
      });
    },
  });
}
