import { Account, Institution, Transaction } from "@/lib/db/types";
import { StateSlice } from "../store";

type DialogState = {
  commandMenuPages: string[];
  isCommandMenuOpen: boolean;
  isAddManualAccountOpen: boolean;
  selectedInstitution: Institution | null;
  isAddLinkedAccountOpen: boolean;
  redirectUri: string;
  isProviderDialogOpen: boolean;
  isEditAccountDialogOpen: boolean;
  setIsEditAccountDialogOpen: (open: boolean) => void;
  selectedAccount: Account | null;
  setSelectedAccount: (account: Account | null) => void;
  isEditTransactionDialogOpen: boolean;
  selectedTransaction: Transaction | null;
};

type DialogActions = {
  setIsCommandMenuOpen: (open: boolean) => void;
  setIsAddManualAccountOpen: (open: boolean) => void;
  setIsAddLinkedAccountOpen: (open: boolean) => void;
  setSelectedInstitution: (institution: Institution | null) => void;
  setRedirectUri: (uri: string) => void;
  setIsProviderDialogOpen: (open: boolean) => void;
  setIsEditTransactionDialogOpen: (open: boolean) => void;
  setSelectedTransaction: (transaction: Transaction | null) => void;
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
  isEditAccountDialogOpen: false,
  selectedAccount: null,
  isEditTransactionDialogOpen: false,
  selectedTransaction: null,
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
  setIsEditAccountDialogOpen: (open) => set({ isEditAccountDialogOpen: open }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setIsEditTransactionDialogOpen: (open) =>
    set({ isEditTransactionDialogOpen: open }),
  setSelectedTransaction: (transaction) =>
    set({ selectedTransaction: transaction }),
});
