import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

const transactions = [
  {
    amount: 500.0,
    account: "Account Barclays 1948",
    date: "3 Jan",
    time: "15:41",
    type: "income",
  },
  {
    amount: 4300.0,
    account: "Account Barclays 1948",
    date: "2 Jan",
    time: "20:53",
    type: "income",
  },
  {
    amount: -500.0,
    account: "Account Santander 1511",
    date: "1 Jan",
    time: "11:09",
    type: "expense",
  },
  {
    amount: 435.41,
    account: "AAPL 2 shares",
    date: "30 Dec",
    time: "19:31",
    type: "income",
  },
  {
    amount: 500.0,
    account: "Barclays 1948 to Santander 1511",
    date: "23 Dec",
    time: "15:41",
    type: "transfer",
  },
  {
    amount: 500.0,
    account: "Account Barclays 1948",
    date: "13 Dec",
    time: "16:03",
    type: "income",
  },
];

export function TransactionsCard() {
  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Transactions</h2>
        <Button variant="secondary">
          View All
          <ArrowRight />
        </Button>
      </div>
      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  transaction.type === "income"
                    ? "bg-green-900"
                    : transaction.type === "expense"
                      ? "bg-red-900"
                      : "bg-gray-700"
                }`}
              >
                <span
                  className={`text-xl ${
                    transaction.type === "income"
                      ? "text-green-400"
                      : transaction.type === "expense"
                        ? "text-red-400"
                        : "text-gray-400"
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
                      ? "text-green-400"
                      : transaction.type === "expense"
                        ? "text-red-400"
                        : "text-white"
                  }`}
                >
                  ${Math.abs(transaction.amount).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">{transaction.account}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">{transaction.date}</p>
              <p className="text-xs text-gray-500">{transaction.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
