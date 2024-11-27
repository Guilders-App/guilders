import { Button } from "@/components/ui/button";
import { ReceiptEuro } from "lucide-react";

export function TransactionsEmptyPlaceholder() {
  return (
    <div className="flex shrink-0 items-center justify-center rounded-md">
      <div className="mx-auto flex flex-col items-center justify-center text-center">
        <ReceiptEuro className="h-10 w-10 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">No transactions</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not added any transactions.
        </p>

        <Button size="sm" className="relative">
          Add Transaction
        </Button>
      </div>
    </div>
  );
}
