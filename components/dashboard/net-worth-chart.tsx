"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", value: 100 },
  { month: "February", value: 120 },
  { month: "March", value: 150 },
  { month: "April", value: 300 },
  { month: "May", value: 280 },
  { month: "June", value: 350 },
  { month: "July", value: 380 },
  { month: "August", value: 390 },
  { month: "September", value: 410 },
  { month: "October", value: 450 },
  { month: "November", value: 500 },
  { month: "December", value: 520 },
];

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function NetWorthChart() {
  return (
    //@ts-ignore
    <ChartContainer
      className="max-h-[216px] w-full relative"
      config={chartConfig}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
        <p className="text-muted-foreground text-sm">
          Historical data not supported yet
        </p>
      </div>

      <AreaChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value: string) => value.slice(0, 3)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
        <Area
          dataKey="value"
          type="natural"
          fill="url(#fillValue)"
          fillOpacity={0.4}
          stroke="var(--color-value)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
