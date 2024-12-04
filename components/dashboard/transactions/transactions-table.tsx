import { useTransactions } from "@/lib/hooks/useTransactions";
import { Skeleton } from "../../ui/skeleton";
import { TransactionItem } from "./transaction-item";
import { TransactionsEmptyPlaceholder } from "./transactions-placeholder";

export function TransactionsTable() {
  const { data: transactions, isLoading, error } = useTransactions();

  return (
    <div className="space-y-4 min-h-[200px]">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      ) : error || !transactions ? (
        <div className="text-center py-8">
          <p className="mb-4">
            Error loading accounts. Please try again later.
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <TransactionsEmptyPlaceholder />
      ) : (
        transactions
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
      )}
    </div>
  );
}
