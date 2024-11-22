import { useTransactions } from "@/hooks/useTransactions";
import { Skeleton } from "../ui/skeleton";
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
        transactions.map((transaction, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  transaction.amount > 0
                    ? "bg-green-100 dark:bg-green-900"
                    : transaction.amount < 0
                      ? "bg-red-100 dark:bg-red-900"
                      : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`text-xl ${
                    transaction.amount > 0
                      ? "text-green-600 dark:text-green-400"
                      : transaction.amount < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {transaction.amount > 0
                    ? "↑"
                    : transaction.amount < 0
                      ? "↓"
                      : "→"}
                </span>
              </div>
              <div>
                <p
                  className={`font-medium font-mono ${
                    transaction.amount > 0
                      ? "text-green-600 dark:text-green-400"
                      : transaction.amount < 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                  }`}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.category}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(transaction.date).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
