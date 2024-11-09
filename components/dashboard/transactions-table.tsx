import { Skeleton } from "../ui/skeleton";
import { TransactionsEmptyPlaceholder } from "./transactions-placeholder";

type Transaction = {
  amount: number;
  account: string;
  date: string;
  time: string;
  type: "income" | "expense" | "transfer";
};

const transactions: Transaction[] = [
  // {
  //   amount: 500.0,
  //   account: "Account Barclays 1948",
  //   date: "3 Jan",
  //   time: "15:41",
  //   type: "income",
  // },
  // {
  //   amount: 4300.0,
  //   account: "Account Barclays 1948",
  //   date: "2 Jan",
  //   time: "20:53",
  //   type: "income",
  // },
  // {
  //   amount: -500.0,
  //   account: "Account Santander 1511",
  //   date: "1 Jan",
  //   time: "11:09",
  //   type: "expense",
  // },
  // {
  //   amount: 435.41,
  //   account: "AAPL 2 shares",
  //   date: "30 Dec",
  //   time: "19:31",
  //   type: "income",
  // },
  // {
  //   amount: 500.0,
  //   account: "Barclays 1948 to Santander 1511",
  //   date: "23 Dec",
  //   time: "15:41",
  //   type: "transfer",
  // },
  // {
  //   amount: 500.0,
  //   account: "Account Barclays 1948",
  //   date: "13 Dec",
  //   time: "16:03",
  //   type: "income",
  // },
];

export function TransactionsTable() {
  const isLoading = false;
  const error = false;
  return (
    <div className="space-y-4 min-h-[200px]">
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
      ) : transactions && transactions.length === 0 ? (
        <TransactionsEmptyPlaceholder />
      ) : (
        transactions.map((transaction, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  transaction.type === "income"
                    ? "bg-green-100 dark:bg-green-900"
                    : transaction.type === "expense"
                      ? "bg-red-100 dark:bg-red-900"
                      : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`text-xl ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : transaction.type === "expense"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {transaction.type === "income"
                    ? "↑"
                    : transaction.type === "expense"
                      ? "↓"
                      : "→"}
                </span>
              </div>
              <div>
                <p
                  className={`font-medium font-mono ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : transaction.type === "expense"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                  }`}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.account}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {transaction.date}
              </p>
              <p className="text-xs text-gray-500">{transaction.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
