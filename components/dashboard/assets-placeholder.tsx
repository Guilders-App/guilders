import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { BadgeEuro } from "lucide-react";

export function AssetsEmptyPlaceholder() {
  const setIsAddManualAccountOpen = useStore(
    (state) => state.setIsAddManualAccountOpen
  );

  return (
    <div className="flex shrink-0 items-center justify-center rounded-md">
      <div className="mx-auto flex flex-col items-center justify-center text-center">
        <BadgeEuro className="h-10 w-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No accounts added</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not added any accounts.
        </p>

        <Button
          size="sm"
          className="relative"
          onClick={() => setIsAddManualAccountOpen(true)}
        >
          Add Account
        </Button>
      </div>
    </div>
  );
}
