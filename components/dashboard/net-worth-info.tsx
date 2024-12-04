import { ChangeIndicator } from "@/components/dashboard/change-indicator";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { NetWorthDisplay } from "@/components/dashboard/net-worth-display";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useRates } from "@/lib/hooks/useRates";
import { useUser } from "@/lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TimeRangeSelector } from "./time-range-selector";

export function NetWorthInfo({ className }: { className?: string }) {
  const { data: accounts } = useAccounts();
  const { data: rates } = useRates();
  const { data: user } = useUser();

  const convertToUserCurrency = (value: number, fromCurrency: string) => {
    if (!rates || !user) return value;
    if (fromCurrency === user.currency) return value;

    const fromRate =
      rates.find((r) => r.currency_code === fromCurrency)?.rate ?? 1;
    const toRate =
      rates.find((r) => r.currency_code === user.currency)?.rate ?? 1;

    return (value * fromRate) / toRate;
  };

  const totalValue =
    accounts?.reduce((acc, account) => {
      const convertedValue = convertToUserCurrency(
        account.value,
        account.currency
      );
      return acc + convertedValue;
    }, 0) ?? 0;

  const totalCost =
    accounts?.reduce((acc, account) => {
      const cost = account.cost ?? account.value;
      const convertedCost = convertToUserCurrency(cost, account.currency);
      return acc + convertedCost;
    }, 0) ?? 0;

  const change = {
    value: totalValue - totalCost,
    percentage:
      totalCost === 0 ? 0 : ((totalValue - totalCost) / totalCost) * 100,
    currency: user?.currency ?? "USD",
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
