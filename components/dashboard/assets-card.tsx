import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccountStore } from "@/lib/store/accountStore";
import { ArrowRight } from "lucide-react";
import { AssetsTable } from "./assets-table";

export function AssetsCard() {
  const { accounts, isInitialLoading } = useAccountStore();

  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-light">Assets</h2>
        <Button variant="secondary">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {isInitialLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">
            No assets found. Add your first account to get started!
          </p>
        </div>
      ) : (
        <AssetsTable />
      )}
    </div>
  );
}
