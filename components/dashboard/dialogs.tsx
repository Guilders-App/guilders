"use client";

import { useAddAccountDialog } from "@/hooks/use-dialog";
import { AddAccountDialog } from "./dialogs/add-account-dialog";

export const Dialogs = () => {
  const { isAddAccountOpen, setIsAddAccountOpen } = useAddAccountDialog();
  return (
    <>
      <AddAccountDialog
        isOpen={isAddAccountOpen}
        setIsOpen={setIsAddAccountOpen}
      />
    </>
  );
};
