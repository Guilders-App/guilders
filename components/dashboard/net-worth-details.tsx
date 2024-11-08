import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NetWorthCategories } from "./net-worth-categories";
import { NetWorthDiversification } from "./net-worth-diversification";
import { TopNetWorth } from "./top-net-worth";

export function NetWorthDetails({ className }: { className?: string }) {
  const diversificationScore = 7;
  const percentage = 93.7;
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <NetWorthCategories />
        <div className="border-t border-gray-700 my-6"></div>
        <NetWorthDiversification diversificationScore={diversificationScore} />
        <TopNetWorth percentage={percentage} />
      </CardContent>
    </Card>
  );
}
