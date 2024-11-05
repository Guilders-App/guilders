"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { PlusIcon } from "lucide-react";

export const AddAccountButton = () => {
  const setIsAddManualAccountOpen = useStore(
    (state) => state.setIsAddManualAccountOpen
  );

  return (
    <>
      <Button onClick={() => setIsAddManualAccountOpen(true)}>
        <PlusIcon />
        Add
      </Button>
    </>
  );
};
