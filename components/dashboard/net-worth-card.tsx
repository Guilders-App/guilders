import { Category } from "@/utils/types";
import { NetWorthDetails } from "./net-worth-details";
import { NetWorthInfo } from "./net-worth-info";

// TODO: Move categories data outside the component
const categories: Category[] = [
  { name: "depository", value: 40 },
  { name: "brokerage", value: 17 },
  { name: "crypto", value: 14 },
  { name: "property", value: 11 },
  { name: "vehicle", value: 10 },
  { name: "creditcard", value: 10 },
  { name: "loan", value: 0 },
];

export function NetWorthCard() {
  // TODO: Implement state management for netWorth and change data
  const netWorth = 728510;
  const change = { value: 543.42, percentage: 0.18 };
  const diversificationScore = 7;
  const percentage = 93.7;

  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg flex-grow">
      <div className="flex">
        <NetWorthInfo netWorth={netWorth} change={change} />
        <NetWorthDetails
          categories={categories}
          diversificationScore={diversificationScore}
          percentage={percentage}
        />
      </div>
    </div>
  );
}
