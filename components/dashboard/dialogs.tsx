"use client";

import { useStore } from "@/lib/store";
import { AddAccountDialog } from "../dialogs/add-account-dialog";

export const Dialogs = () => {
  const isAddAccountOpen = useStore((state) => state.isAddManualAccountOpen);
  const setIsAddAccountOpen = useStore(
    (state) => state.setIsAddManualAccountOpen
  );

  return (
    <>
      <AddAccountDialog
        isOpen={isAddAccountOpen}
        setIsOpen={setIsAddAccountOpen}
      />
    </>
  );
};
