import NumberFlow from "@number-flow/react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ChangeBadge({
  change,
  showAbsoluteChange = false,
}: {
  change: { value: number; percentage: number; currency: string };
  showAbsoluteChange?: boolean;
}) {
  const isPositive = change.value >= 0;
  const absValue = Math.abs(change.value);
  const absPercentage = Math.abs(change.percentage);

  return (
    <span
      className={`text-xs ${showAbsoluteChange === false ? "w-[84px]" : ""} ${
        isPositive
          ? "bg-green-100 dark:bg-[#182f28] text-green-700 dark:text-[#2ff795]"
          : "bg-red-100 dark:bg-[#2d1e1e] text-red-700 dark:text-[#ff4d4d]"
      } p-2 rounded-md ml-auto inline-flex items-center font-mono`}
    >
      {isPositive ? (
        <ChevronUp className="mr-0.5" size={16} />
      ) : (
        <ChevronDown className="mr-0.5" size={16} />
      )}
      {showAbsoluteChange && (
        <>
          <NumberFlow
            value={absValue}
            format={{
              style: "currency",
              currency: change.currency,
            }}
          />
          {" ("}
        </>
      )}
      {absPercentage.toFixed(2)}%{showAbsoluteChange && ")"}
    </span>
  );
}
