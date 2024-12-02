import { useAccounts } from "@/lib/hooks/useAccounts";
import { useState } from "react";
import { Skeleton } from "../../ui/skeleton";
import { AssetItem } from "./asset-item";
import { AssetsEmptyPlaceholder } from "./assets-placeholder";

export function AssetsTable() {
  const { data: accounts, isLoading, error } = useAccounts();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (accountId: number) => {
    setImageErrors((prev) => ({ ...prev, [accountId]: true }));
  };

  return (
    <div className="space-y-2 min-h-[200px]">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="mb-4">
            Error loading accounts. Please try again later.
          </p>
        </div>
      ) : accounts && accounts.length === 0 ? (
        <AssetsEmptyPlaceholder />
      ) : (
        accounts?.map((account) => (
          <AssetItem
            key={account.id}
            account={account}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />
        ))
      )}
    </div>
  );
}
