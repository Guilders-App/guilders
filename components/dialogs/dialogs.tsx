"use client";

import { useStore } from "@/lib/store";
import { AddAccountDialog } from "./add-account-dialog";
import { AddLinkedAccountDialog } from "./add-linked-account-dialog";
import { ProviderDialog } from "./provider-dialog";

export const Dialogs = () => {
  const isAddAccountOpen = useStore((state) => state.isAddManualAccountOpen);
  const setIsAddAccountOpen = useStore(
    (state) => state.setIsAddManualAccountOpen
  );
  const isAddLinkedAccountOpen = useStore(
    (state) => state.isAddLinkedAccountOpen
  );

  const selectedInstitution = useStore((state) => state.selectedInstitution);
  const setIsAddLinkedAccountOpen = useStore(
    (state) => state.setIsAddLinkedAccountOpen
  );

  const redirectUri = useStore((state) => state.redirectUri);
  const isProviderDialogOpen = useStore((state) => state.isProviderDialogOpen);
  const setIsProviderDialogOpen = useStore(
    (state) => state.setIsProviderDialogOpen
  );

  return (
    <>
      <AddAccountDialog
        isOpen={isAddAccountOpen}
        setIsOpen={setIsAddAccountOpen}
      />
      <AddLinkedAccountDialog
        isOpen={isAddLinkedAccountOpen && selectedInstitution !== null}
        setIsOpen={setIsAddLinkedAccountOpen}
        institution={selectedInstitution}
      />
      <ProviderDialog
        isOpen={isProviderDialogOpen}
        setIsOpen={setIsProviderDialogOpen}
        redirectUri={redirectUri}
      />
    </>
  );
};
