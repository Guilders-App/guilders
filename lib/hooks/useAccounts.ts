import { Account, AccountInsert, AccountUpdate } from "@/lib/db/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryKey = ["accounts"] as const;

type AccountsResponse = {
  accounts: Account[];
};

type SingleAccountResponse = {
  account: Account;
};

export function useAccounts() {
  return useQuery<Account[], Error>({
    queryKey,
    queryFn: async (): Promise<Account[]> => {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = (await response.json()) as AccountsResponse;
      return data.accounts;
    },
  });
}

export function useAccount(accountId: number) {
  return useQuery<Account | undefined, Error>({
    queryKey: [...queryKey, accountId],
    queryFn: async (): Promise<Account | undefined> => {
      if (!accountId) return undefined;

      const response = await fetch(`/api/accounts/${accountId}`);
      if (!response.ok) throw new Error("Failed to fetch account");
      const data = (await response.json()) as SingleAccountResponse;
      return data.account;
    },
    enabled: !!accountId,
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, AccountInsert>({
    mutationFn: async (account): Promise<Account> => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      if (!response.ok) throw new Error("Failed to add account");
      const data = (await response.json()) as SingleAccountResponse;
      return data.account;
    },
    onSuccess: (newAccount) => {
      queryClient.setQueryData<Account[]>(queryKey, (old = []) => [
        ...old,
        newAccount,
      ]);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, AccountUpdate>({
    mutationFn: async (updatedAccount): Promise<Account> => {
      const response = await fetch(`/api/accounts/${updatedAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccount),
      });
      if (!response.ok) throw new Error("Failed to update account");
      const data = (await response.json()) as SingleAccountResponse;
      return data.account;
    },
    onSuccess: (updatedAccount) => {
      queryClient.setQueryData<Account[]>(queryKey, (old = []) =>
        old.map((account) =>
          account.id === updatedAccount.id ? updatedAccount : account
        )
      );
    },
  });
}

export function useRemoveAccount() {
  const queryClient = useQueryClient();
  return useMutation<number, Error, number>({
    mutationFn: async (accountId): Promise<number> => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove account");
      return accountId;
    },
    onSuccess: (accountId) => {
      queryClient.setQueryData<Account[]>(queryKey, (old = []) =>
        old.filter((account) => account.id !== accountId)
      );
    },
  });
}
