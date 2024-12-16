"use client";

import { ChangeIndicator } from "@/apps/web/components/common/change-indicator";
import { Card, CardContent } from "@/apps/web/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/apps/web/components/ui/chart";
import { Account } from "@/apps/web/lib/db/types";
import { useRates } from "@/apps/web/lib/hooks/useRates";
import { useUser } from "@/apps/web/lib/hooks/useUser";
import { convertToUserCurrency } from "@/apps/web/lib/utils/financial";
import NumberFlow from "@number-flow/react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface CompactBalanceCardProps {
  title: string;
  accounts?: Account[];
  invertColors?: boolean;
  className?: string;
}

// Mock data for the chart (can be replaced with real data later)
const chartData = [
  { month: "Jan", value: 100 },
  { month: "Feb", value: 120 },
  { month: "Mar", value: 150 },
  { month: "Apr", value: 300 },
  { month: "May", value: 280 },
  { month: "Jun", value: 350 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function CompactBalanceCard({
  title,
  accounts = [],
  invertColors = false,
  className,
}: CompactBalanceCardProps) {
  const { data: user } = useUser();
  const { data: rates } = useRates();
  const userCurrency = user?.settings.currency || "EUR";

  // Calculate total value and cost in user's currency
  const totalValue = accounts.reduce(
    (sum, account) =>
      sum +
      convertToUserCurrency(
        account.value,
        account.currency,
        rates,
        userCurrency
      ),
    0
  );

  const totalCost = accounts.reduce(
    (sum, account) =>
      sum +
      convertToUserCurrency(
        account.cost || 0,
        account.currency,
        rates,
        userCurrency
      ),
    0
  );

  // Calculate change
  const change = {
    value: totalCost ? totalValue - totalCost : 0,
    percentage: totalCost ? (totalValue - totalCost) / totalCost : 0,
    currency: userCurrency,
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 flex gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </h3>
          <NumberFlow
            value={totalValue}
            format={{
              style: "currency",
              currency: userCurrency,
            }}
            className="text-2xl font-normal font-mono tracking-tight"
          />
          <ChangeIndicator change={change} invertColors={invertColors} />
        </div>

        <div className="w-32">
          {/* @ts-ignore */}
          <ChartContainer className="h-[80px]" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#fillValue)"
                  fillOpacity={0.4}
                  stroke="var(--color-value)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
