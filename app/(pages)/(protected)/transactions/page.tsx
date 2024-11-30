"use client";

import { TransactionsEmptyPlaceholder } from "@/components/dashboard/transactions/transactions-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactions } from "@/hooks/useTransactions";

export default function TransactionsPage() {
  const { data: transactions, isLoading, error } = useTransactions();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
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
              Error loading transactions. Please try again later.
            </p>
          </div>
        ) : transactions && transactions.length === 0 ? (
          <TransactionsEmptyPlaceholder />
        ) : (
          transactions?.map((transaction) => (
            <Card
              key={transaction.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="py-4">
                <CardTitle className="text-base">
                  {transaction.description}
                </CardTitle>
                <p className="text-sm text-gray-600">{transaction.category}</p>
              </CardHeader>
              <CardContent className="py-2">
                <p>
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
