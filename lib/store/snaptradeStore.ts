import { create } from "zustand";

interface SnapTradeState {
  isLoading: boolean;
  error: string | null;
  registerUser: () => Promise<void>;
}

export const useSnapTradeStore = create<SnapTradeState>((set) => ({
  isLoading: false,
  error: null,

  registerUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/connections", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        set({ isLoading: false });
      } else {
        throw new Error(data.error || "Failed to register SnapTrade user");
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
