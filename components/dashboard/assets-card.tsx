import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { AssetsTable } from "./assets-table";

const accounts = [
  {
    name: "Checking Account",
    cost: 4031.4,
    value: 10000,
  },
  {
    name: "Robinhood",
    cost: 9800,
    value: 9574.6,
  },
  {
    name: "Trading212",
    cost: 7500,
    value: 7927.5,
  },
  {
    name: "Crypto Wallet",
    cost: 3000,
    value: 3363,
  },
];

export function AssetsCard() {
  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-light">Assets</h2>
        <Button variant="secondary">
          View All
          <ArrowRight />
        </Button>
      </div>
      <AssetsTable accounts={accounts} />
    </div>
  );
}
