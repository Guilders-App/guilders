import NumberFlow from "@number-flow/react";

export function ChangeIndicator({
  change,
}: {
  change: { value: number; percentage: number; currency: string };
}) {
  const isPositive = change.value >= 0;
  const absValue = Math.abs(change.value);
  const absPercentage = Math.abs(change.percentage);

  if (change.value === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No change vs last month
      </div>
    );
  }

  return (
    <div
      className={`text-sm ${
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {isPositive ? "+" : "-"}{" "}
      <NumberFlow
        value={absValue}
        format={{
          style: "currency",
          currency: change.currency,
        }}
      />
      {" ("}
      <NumberFlow
        value={absPercentage}
        format={{
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }}
      />
      {") vs last month"}
    </div>
  );
}
