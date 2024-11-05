import { StateSlice } from "../store";

type DialogState = {
  isCommandMenuOpen: boolean;
  commandMenuPages: string[];
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
  commandMenuPages: [],
  setIsCommandMenuOpen: (open) => {
    set({ isCommandMenuOpen: open });
    if (!open) {
      set({ commandMenuPages: [] });
    }
  },
  setIsAddManualAccountOpen: (open) => set({ isAddManualAccountOpen: open }),
});
