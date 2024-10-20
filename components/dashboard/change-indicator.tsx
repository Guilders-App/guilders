import { ChevronUp } from "lucide-react";

export function ChangeIndicator({
  change,
}: {
  change: { value: number; percentage: number };
}) {
  return (
    <span className="text-xs bg-[#182f28] p-2 rounded-md text-[#2ff795] ml-auto flex items-center font-mono">
      <ChevronUp className="mr-1" size={16} />+{change.value.toFixed(2)} (
      {change.percentage.toFixed(2)}%)
    </span>
  );
}
