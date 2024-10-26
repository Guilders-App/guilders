import { NetWorthDetails } from "./net-worth-details";
import { NetWorthInfo } from "./net-worth-info";

export function NetWorthCard() {
  const netWorth = 728510;
  const change = { value: 543.42, percentage: 0.18 };
  const diversificationScore = 7;
  const percentage = 93.7;

  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg flex-grow">
      <div className="flex">
        <NetWorthInfo netWorth={netWorth} change={change} />
        <NetWorthDetails
          diversificationScore={diversificationScore}
          percentage={percentage}
        />
      </div>
    </div>
  );
}
