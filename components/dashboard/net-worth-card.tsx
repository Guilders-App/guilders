import { BalanceCard } from "@/components/dashboard/balance-card";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useRates } from "@/lib/hooks/useRates";
import { useUser } from "@/lib/hooks/useUser";
import { convertToUserCurrency } from "@/lib/utils/financial";

export function NetWorthCard({ className }: { className?: string }) {
  const { data: accounts } = useAccounts();
  const { data: rates } = useRates();
  const { data: user } = useUser();

  const totalValue =
    accounts?.reduce((acc, account) => {
      const convertedValue = convertToUserCurrency(
        account.value,
        account.currency,
        rates,
        user?.currency ?? "EUR"
      );
      return acc + convertedValue;
    }, 0) ?? 0;

  const totalCost =
    accounts?.reduce((acc, account) => {
      const cost = account.cost ?? account.value;
      const convertedCost = convertToUserCurrency(
        cost,
        account.currency,
        rates,
        user?.currency ?? "EUR"
      );
      return acc + convertedCost;
    }, 0) ?? 0;

  const change = {
    value: totalValue - totalCost,
    percentage: totalCost === 0 ? 0 : (totalValue - totalCost) / totalCost,
    currency: user?.currency ?? "EUR",
  };

  return (
    <BalanceCard
      title="Net Worth"
      value={totalValue}
      currency={user?.currency ?? "EUR"}
      change={change}
      className={className}
    />
  );
}
