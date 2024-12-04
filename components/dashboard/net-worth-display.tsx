import { useAccounts } from "@/lib/hooks/useAccounts";
import { useRates } from "@/lib/hooks/useRates";
import { useUser } from "@/lib/hooks/useUser";
import NumberFlow from "@number-flow/react";

export function NetWorthDisplay() {
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

  return (
    <div className="flex items-baseline">
      <NumberFlow
        value={totalValue}
        format={{
          style: "currency",
          currency: user?.currency ?? "USD",
        }}
        className="text-4xl font-normal font-mono tracking-tight"
      />
    </div>
  );
}
