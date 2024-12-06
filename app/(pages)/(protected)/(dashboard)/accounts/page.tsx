"use client";

import { AssetsCard } from "@/components/dashboard/assets/assets-card";
import { AssetsEmptyPlaceholder } from "@/components/dashboard/assets/assets-placeholder";
import { CompactBalanceCard } from "@/components/dashboard/compact-balance-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useDialog } from "@/lib/hooks/useDialog";
import { Plus } from "lucide-react";

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();
  const { open: openAddAccount } = useDialog("addManualAccount");

  const assets = accounts?.filter((account) => account.type === "asset") ?? [];
  const liabilities =
    accounts?.filter((account) => account.type === "liability") ?? [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Button onClick={() => openAddAccount()} size="sm">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="mb-4">
            Error loading accounts. Please try again later.
          </p>
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <AssetsEmptyPlaceholder />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CompactBalanceCard title="Assets" accounts={assets} />
            <CompactBalanceCard
              title="Liabilities"
              accounts={liabilities}
              invertColors
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <AssetsCard
              className="h-[500px]"
              showViewAll={false}
              title="Assets"
              accounts={assets}
            />
            <AssetsCard
              className="h-[500px]"
              showViewAll={false}
              title="Liabilities"
              accounts={liabilities}
            />
          </div>
        </div>
      )}
    </div>
  );
}
