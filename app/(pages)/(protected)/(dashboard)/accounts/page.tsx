"use client";

import { AssetsEmptyPlaceholder } from "@/components/dashboard/assets/assets-placeholder";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/useAccounts";

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();

  return (
    <div className="p-4">
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(12)].map((_, index) => (
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
            <Card
              key={account.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="py-2">
                <p>
                  {account.currency} {account.value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
