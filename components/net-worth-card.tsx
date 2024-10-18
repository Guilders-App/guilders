import { ChevronUp } from "lucide-react";
import { Categories, Category } from "./categories";
import TimeRangeSelector from "./time-range-selector";
import { NetWorthChart } from "./ui/net-worth-chart";

export function NetWorthCard() {
  const categories: Category[] = [
    { name: "Accounts", percentage: "38%", color: "bg-blue-400" },
    { name: "Stocks", percentage: "17%", color: "bg-cyan-400" },
    { name: "Crypto", percentage: "14%", color: "bg-green-400" },
    { name: "Real Estate", percentage: "11%", color: "bg-purple-400" },
    { name: "Cars", percentage: "10%", color: "bg-indigo-400" },
    { name: "Other", percentage: "10%", color: "bg-red-400" },
  ];

  return (
    <div className="bg-grey4 border border-grey_border shadow-md rounded-lg p-6 flex-grow">
      <div className="flex">
        {/* Left side - 60% width */}
        <div className="w-3/5 pr-6">
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
        <div className="w-2/5">
          <h2 className="text-lg font-light text-gray-400 mb-4">Categories</h2>
          <Categories categories={categories} />
          <div className="border-t border-gray-700 my-6"></div>
          <div className="mb-6">
            <h2 className="text-lg font-light text-gray-400 mb-2">
              Diversification Score
            </h2>
            <div className="flex items-center">
              <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                <div
                  className="bg-green-400 h-2.5 rounded-full"
                  style={{ width: "78%" }}
                ></div>
              </div>
              <span className="text-green-400 font-mono">78</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-light text-gray-400 mb-2">
              Top 1.3% Net Worth in Poland
            </h2>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-yellow-400 h-2.5 rounded-full"
                style={{ width: "98.7%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
