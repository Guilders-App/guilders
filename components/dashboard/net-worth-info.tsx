import { ChangeIndicator } from "@/components/dashboard/change-indicator";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { NetWorthDisplay } from "@/components/dashboard/net-worth-display";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TimeRangeSelector } from "./time-range-selector";

export function NetWorthInfo({ className }: { className?: string }) {
  const change = { value: 543.42, percentage: 0.18 };
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
