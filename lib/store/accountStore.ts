import { create } from "zustand";
import { Account, AccountInsert, AccountUpdate } from "../supabase/types";

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: AccountInsert) => Promise<void>;
  updateAccount: (updatedAccount: AccountUpdate) => Promise<void>;
  removeAccount: (accountId: number) => Promise<void>;
  initializeAccounts: () => Promise<void>;
  isInitialLoading: boolean;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  isLoading: false,
  error: null,
  isInitialLoading: true,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      set({ accounts: data.accounts, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addAccount: async (account) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      });
      if (!response.ok) throw new Error("Failed to add account");
      const data = await response.json();
      set((state) => ({
        accounts: [...state.accounts, data.account],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateAccount: async (updatedAccount) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/accounts/${updatedAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccount),
      });
      if (!response.ok) throw new Error("Failed to update account");
      const data = await response.json();
      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === data.account.id ? data.account : account
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  removeAccount: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove account");
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== accountId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  initializeAccounts: async () => {
    set({ isInitialLoading: true, error: null });
    try {
      const response = await fetch("/api/accounts");
      if (!response.ok) throw new Error("Failed to fetch accounts");
      const data = await response.json();
      set({ accounts: data.accounts, isInitialLoading: false });
      return data.accounts;
    } catch (error) {
      set({ error: (error as Error).message, isInitialLoading: false });
      return [];
    }
  },
}));
