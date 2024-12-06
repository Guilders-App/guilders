import { Account } from "@/lib/db/types";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { Skeleton } from "../../ui/skeleton";
import { AssetItem } from "./asset-item";
import { AssetsEmptyPlaceholder } from "./assets-placeholder";

interface AssetsTableProps {
  accounts?: Account[];
  isLoading?: boolean;
}

export function AssetsTable({
  accounts: propAccounts,
  isLoading: propIsLoading,
}: AssetsTableProps) {
  const { data: hookAccounts, isLoading: hookIsLoading, error } = useAccounts();

  // Use prop values if provided, otherwise fall back to hook values
  const accounts = propAccounts ?? hookAccounts;
  const isLoading = propIsLoading ?? hookIsLoading;

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      ) : error && !propAccounts ? (
        <div className="text-center py-8">
          <p className="mb-4">
            Error loading accounts. Please try again later.
          </p>
        </div>
      ) : accounts && accounts.length === 0 ? (
        <AssetsEmptyPlaceholder />
      ) : (
        accounts?.map((account) => (
          <AssetItem key={account.id} account={account} />
        ))
      )}
    </div>
  );
}
