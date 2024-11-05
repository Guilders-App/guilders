import { create } from "zustand";

interface ConnectionState {
  isLoading: boolean;
  error: string | null;
  registerUser: (providerName: string) => Promise<void>;
  deregisterUser: (providerName: string) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isLoading: false,
  error: null,

  registerUser: async (providerName: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `/api/connections/register/${providerName}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
      } else {
        throw new Error(
          data.error || `Failed to register a ${providerName} user`
        );
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  deregisterUser: async (providerName: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(
        `/api/connections/deregister/${providerName}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
      } else {
        throw new Error(
          data.error || `Failed to deregister a ${providerName} user`
        );
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
