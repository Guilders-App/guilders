import { useDialog } from "@/lib/hooks/useDialog";
import type { Transaction } from "@guilders/api/types";
import NumberFlow from "@number-flow/react";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { open } = useDialog("editTransaction");

  return (
    <div
      className="flex justify-between items-center p-2 hover:bg-secondary rounded-lg cursor-pointer"
      onClick={() => open({ transaction })}
    >
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
            {transaction.amount > 0 ? "↑" : transaction.amount < 0 ? "↓" : "→"}
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
            <NumberFlow
              value={Math.abs(transaction.amount)}
              format={{
                style: "currency",
                currency: transaction.currency,
              }}
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {transaction.description}
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
  );
}
