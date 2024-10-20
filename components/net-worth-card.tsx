import { Category } from "@/utils/types";
import { ChevronUp } from "lucide-react";
import { Categories } from "./categories";
import { Diversification } from "./diversification";
import TimeRangeSelector from "./time-range-selector";
import { TopNetWorth } from "./top-net-worth";
import { NetWorthChart } from "./ui/net-worth-chart";

export function NetWorthCard() {
  const categories: Category[] = [
    { name: "depository", value: 40 },
    { name: "brokerage", value: 17 },
    { name: "crypto", value: 14 },
    { name: "property", value: 11 },
    { name: "vehicle", value: 10 },
    { name: "creditcard", value: 10 },
    { name: "loan", value: 0 },
  ];

  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg flex-grow">
      <div className="flex">
        <div className="w-3/5 p-6">
          <div className="mb-6">
            <div className="flex items-baseline">
              <h2 className="text-lg font-light text-gray-400 mb-2">
                Total Net Worth
              </h2>
              <span className="text-xs bg-[#182f28] py-2 px-3 rounded-md text-[#2ff795] ml-auto flex items-center font-mono">
                <ChevronUp className="mr-1" size={16} />
                +543.42 (0.18%) {/* TODO: Add this data */}
              </span>
            </div>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-light text-gray-400">$</span>
              <span className="text-4xl font-normal font-mono tracking-tight">
                728,510 {/* TODO: Add this data */}
              </span>
            </div>
            {/* TODO: Add time range selector on change */}
            <TimeRangeSelector />
            {/* TODO: Add this data */}
            <NetWorthChart />
          </div>
        </div>
        <div className="w-2/5 bg-[#232526] p-6 border-l border-grey_border">
          <Categories categories={categories} />
          <div className="border-t border-gray-700 my-6"></div>
          <Diversification diversificationScore={7} />
          <TopNetWorth />
        </div>
      </div>
    </div>
  );
}
