"use client";

import React, { useState } from "react";

type TimeRange = "1 Day" | "1 Week" | "1 Month" | "1 Year" | "All";

export const TimeRangeSelector: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1 Month");
  const ranges: TimeRange[] = ["1 Day", "1 Week", "1 Month", "1 Year", "All"];

  return (
    <div className="flex space-x-2 mb-4">
      {ranges.map((range) => (
        <button
          key={range}
          className={`px-3 h-8 py-1 rounded-full text-sm transition-colors
            ${
              selectedRange === range
                ? "bg-gray-800 dark:bg-neutral-700 text-white border border-gray-600 dark:border-neutral-600"
                : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700"
            }`}
          onClick={() => setSelectedRange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
};
