import { ChangeIndicator } from "@/components/dashboard/change-indicator";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { NetWorthDisplay } from "@/components/dashboard/net-worth-display";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TimeRangeSelector } from "./time-range-selector";

export function NetWorthInfo({ className }: { className?: string }) {
  const { data: accounts } = trpc.account.getAll.useQuery();

  const totalValue =
    accounts?.reduce((acc, account) => {
      return acc + account.value;
    }, 0) ?? 0;
  const totalCost =
    accounts?.reduce((acc, account) => {
      return acc + (account.cost ?? account.value);
    }, 0) ?? 0;
  const change = {
    value: totalValue - totalCost,
    percentage:
      totalCost == 0 ? 0 : ((totalValue - totalCost) / totalCost) * 100,
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col p-6 space-y-0">
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="text-md font-medium">Net Worth</CardTitle>
          <ChangeIndicator change={change} showAbsoluteChange />
        </div>
        <NetWorthDisplay />
      </CardHeader>
      <CardContent>
        <TimeRangeSelector />
        <NetWorthChart />
      </CardContent>
    </Card>
  );
}
