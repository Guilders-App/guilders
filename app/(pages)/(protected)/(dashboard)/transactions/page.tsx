"use client";

import { TransactionItem } from "@/components/dashboard/transactions/transaction-item";
import { TransactionsEmptyPlaceholder } from "@/components/dashboard/transactions/transactions-placeholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/lib/hooks/useDialog";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useUser } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import { convertToUserCurrency } from "@/lib/utils/financial";
import NumberFlow from "@number-flow/react";
import { Filter, Plus, Search } from "lucide-react";

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { open: openAddTransaction } = useDialog("addTransaction");

  const totalIncome =
    transactions?.reduce(
      (sum, t) =>
        sum +
        (t.amount > 0
          ? convertToUserCurrency(
              t.amount,
              t.currency,
              [],
              user?.currency ?? "USD"
            )
          : 0),
      0
    ) ?? 0;

  const totalExpenses =
    transactions?.reduce(
      (sum, t) =>
        sum +
        (t.amount < 0
          ? Math.abs(
              convertToUserCurrency(
                t.amount,
                t.currency,
                [],
                user?.currency ?? "USD"
              )
            )
          : 0),
      0
    ) ?? 0;

  const totalTransactions = transactions?.length ?? 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <Button onClick={() => openAddTransaction()} size="sm">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                totalTransactions
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {isLoading || isLoadingUser ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <NumberFlow
                  value={totalIncome}
                  format={{
                    style: "currency",
                    currency: user?.currency ?? "USD",
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {isLoading || isLoadingUser ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <NumberFlow
                  value={totalExpenses}
                  format={{
                    style: "currency",
                    currency: user?.currency ?? "USD",
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64 md:flex-none">
                <Button
                  variant="outline"
                  className={cn(
                    "relative w-full justify-start text-sm text-muted-foreground",
                    "bg-background hover:bg-accent hover:text-accent-foreground",
                    "border border-input",
                    "ring-offset-background",
                    "transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                >
                  <Search className="mr-2 h-4 w-4 shrink-0" />
                  <span>Search transactions...</span>
                </Button>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <TransactionsEmptyPlaceholder />
            ) : (
              transactions
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
