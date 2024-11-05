import { StateSlice } from "../store";

type DialogState = {
  isCommandMenuOpen: boolean;
  isAddManualAccountOpen: boolean;
};

type DialogActions = {
  setIsCommandMenuOpen: (open: boolean) => void;
  setIsAddManualAccountOpen: (open: boolean) => void;
};

export const createDialogStore: StateSlice<DialogState & DialogActions> = (
  set
) => ({
  isCommandMenuOpen: false,
  isAddManualAccountOpen: false,
  setIsCommandMenuOpen: (open) => set({ isCommandMenuOpen: open }),
  setIsAddManualAccountOpen: (open) => set({ isAddManualAccountOpen: open }),
});
