import { StateSlice } from "../store";
import { Institution } from "../supabase/types";

type DialogState = {
  commandMenuPages: string[];
  isCommandMenuOpen: boolean;
  isAddManualAccountOpen: boolean;
  selectedInstitution: Institution | null;
  isAddLinkedAccountOpen: boolean;
  redirectUri: string;
  isProviderDialogOpen: boolean;
};

type DialogActions = {
  setIsCommandMenuOpen: (open: boolean) => void;
  setIsAddManualAccountOpen: (open: boolean) => void;
  setIsAddLinkedAccountOpen: (open: boolean) => void;
  setSelectedInstitution: (institution: Institution | null) => void;
  setRedirectUri: (uri: string) => void;
  setIsProviderDialogOpen: (open: boolean) => void;
};

export const createDialogStore: StateSlice<DialogState & DialogActions> = (
  set
) => ({
  selectedInstitution: null,
  commandMenuPages: [],
  isCommandMenuOpen: false,
  isAddManualAccountOpen: false,
  isAddLinkedAccountOpen: false,
  isProviderDialogOpen: false,
  redirectUri: "",
  setIsCommandMenuOpen: (open) => {
    set({ isCommandMenuOpen: open });
    if (!open) {
      set({ commandMenuPages: [] });
    }
  },
  setIsAddManualAccountOpen: (open) => set({ isAddManualAccountOpen: open }),
  setIsAddLinkedAccountOpen: (open) => set({ isAddLinkedAccountOpen: open }),
  setSelectedInstitution: (institution) =>
    set({ selectedInstitution: institution }),
  setIsProviderDialogOpen: (open) => set({ isProviderDialogOpen: open }),
  setRedirectUri: (uri) => set({ redirectUri: uri }),
});
