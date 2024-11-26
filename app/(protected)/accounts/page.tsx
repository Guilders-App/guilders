"use client";

import { AssetsEmptyPlaceholder } from "@/components/dashboard/assets-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = trpc.account.getAll.useQuery();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Accounts</h1>
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
              <CardHeader className="py-4">
                <CardTitle className="text-base">{account.name}</CardTitle>
                <p className="text-sm text-gray-600">
                  {account.type} - {account.subtype}
                </p>
              </CardHeader>
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
