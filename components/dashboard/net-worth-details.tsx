import { NetWorthCategories } from "./net-worth-categories";
import { NetWorthDiversification } from "./net-worth-diversification";
import { TopNetWorth } from "./top-net-worth";

export function NetWorthDetails({
  diversificationScore,
  percentage,
}: {
  diversificationScore: number;
  percentage: number;
}) {
  return (
    <div className="w-2/5 bg-[#232526] p-6 border-l border-grey_border">
      <NetWorthCategories />
      <div className="border-t border-gray-700 my-6"></div>
      <NetWorthDiversification diversificationScore={diversificationScore} />
      <TopNetWorth percentage={percentage} />
    </div>
  );
}
