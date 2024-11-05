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
          className={`px-3 h-8 py-1 rounded-full text-sm ${
            selectedRange === range
              ? "bg-grey2 text-white border border-grey_highlight_2"
              : "bg-grey2 text-white border border-grey2"
          }`}
          onClick={() => setSelectedRange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
};
