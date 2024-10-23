import { create } from "zustand";

interface AddAccountDialogStore {
  isAddAccountOpen: boolean;
  setIsAddAccountOpen: (open: boolean) => void;
}

export const useAddAccountDialog = create<AddAccountDialogStore>((set) => ({
  isAddAccountOpen: false,
  setIsAddAccountOpen: (open) => set({ isAddAccountOpen: open }),
}));
