import { NetWorthChart } from "../ui/net-worth-chart";
import { ChangeIndicator } from "./change-indicator";
import { NetWorthDisplay } from "./net-worth-display";
import TimeRangeSelector from "./time-range-selector";

export function NetWorthInfo({
  netWorth,
  change,
}: {
  netWorth: number;
  change: { value: number; percentage: number };
}) {
  return (
    <div className="w-3/5 pt-6 px-6">
      <div className="flex items-baseline">
        <h2 className="text-lg font-light text-gray-400 mb-2">
          Total Net Worth
        </h2>
        <ChangeIndicator change={change} showAbsoluteChange />
      </div>
      <NetWorthDisplay value={netWorth} />
      <TimeRangeSelector />
      <NetWorthChart />
    </div>
  );
}
