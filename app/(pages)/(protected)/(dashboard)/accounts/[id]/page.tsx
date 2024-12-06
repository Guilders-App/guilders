"use client";

import { ChangeIndicator } from "@/components/dashboard/change-indicator";
import { TimeRangeSelector } from "@/components/dashboard/time-range-selector";
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useRemoveAccount } from "@/lib/hooks/useAccounts";
import { useDialog } from "@/lib/hooks/useDialog";
import NumberFlow from "@number-flow/react";
import {
  Bitcoin,
  CarFront,
  ChartCandlestick,
  CirclePercent,
  CreditCard,
  DollarSign,
  HandCoins,
  House,
  Landmark,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";

// Mock data for the chart
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

export default function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: account, isLoading } = useAccount(parseInt(id));
  const [imageError, setImageError] = useState(false);
  const { open: openEdit } = useDialog("editAccount");
  const { open: openConfirmation } = useDialog("confirmation");
  const { mutate: removeAccount, isPending: isDeleting } = useRemoveAccount();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-4">
        <p>Account not found</p>
      </div>
    );
  }

  const getFallbackIcon = () => {
    switch (account.subtype) {
      case "depository":
        return <Landmark className="w-6 h-6" />;
      case "brokerage":
        return <ChartCandlestick className="w-6 h-6" />;
      case "crypto":
        return <Bitcoin className="w-6 h-6" />;
      case "property":
        return <House className="w-6 h-6" />;
      case "creditcard":
        return <CreditCard className="w-6 h-6" />;
      case "loan":
        return <HandCoins className="w-6 h-6" />;
      case "vehicle":
        return <CarFront className="w-6 h-6" />;
      case "stock":
        return <CirclePercent className="w-6 h-6" />;
      default:
        return <DollarSign className="w-6 h-6" />;
    }
  };

  const change = {
    value: account.cost ? account.value - account.cost : 0,
    percentage: account.cost
      ? ((account.value - account.cost) / account.cost) * 100
      : 0,
    currency: account.currency,
  };

  const handleEdit = () => {
    if (account) {
      openEdit({ account });
    }
  };

  const handleDelete = () => {
    if (!account) return;

    openConfirmation({
      title: "Delete Account",
      description:
        "Are you sure you want to delete this account? This action cannot be undone.",
      confirmText: "Delete Account",
      isLoading: isDeleting,
      onConfirm: () => {
        removeAccount(account.id, {
          onSuccess: () => {
            toast.success("Account deleted");
            router.push("/accounts");
          },
          onError: (error) => {
            toast.error("Error deleting account");
            console.error("Error deleting account:", error);
          },
        });
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 mb-2">
        {account.image && !imageError ? (
          <Image
            src={account.image}
            alt={account.name}
            width={40}
            height={40}
            className="rounded-full w-10 h-10"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-10 h-10 p-2 flex items-center justify-center text-muted-foreground rounded-full bg-muted">
            {getFallbackIcon()}
          </div>
        )}
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{account.name}</h1>
            {account.institution_connection?.institution?.name && (
              <p className="text-sm text-muted-foreground">
                {account.institution_connection.institution.name}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col p-6 space-y-0">
          <div className="flex flex-row justify-between items-center">
            <CardTitle className="text-md font-medium">Balance</CardTitle>
            <ChangeIndicator change={change} showAbsoluteChange />
          </div>
          <div className="flex items-baseline">
            <NumberFlow
              value={account.value}
              format={{
                style: "currency",
                currency: account.currency,
              }}
              className="text-4xl font-normal font-mono tracking-tight"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TimeRangeSelector />
          {/* @ts-ignore */}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {account.subtype === "depository" ? "Transactions" : "Holdings"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {account.subtype === "depository" ? (
            <TransactionsTable accountId={account.id} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Holdings view coming soon...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
