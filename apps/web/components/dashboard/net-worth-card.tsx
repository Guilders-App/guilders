import { BalanceCard } from "@/apps/web/components/dashboard/balance-card";
import { useAccounts } from "@/apps/web/lib/hooks/useAccounts";
import { useRates } from "@/apps/web/lib/hooks/useRates";
import { useUser } from "@/apps/web/lib/hooks/useUser";
import { convertToUserCurrency } from "@/apps/web/lib/utils/financial";

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
        user?.settings.currency ?? "EUR"
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
        user?.settings.currency ?? "EUR"
      );
      return acc + convertedCost;
    }, 0) ?? 0;

  const change = {
    value: totalValue - totalCost,
    percentage: totalCost === 0 ? 0 : (totalValue - totalCost) / totalCost,
    currency: user?.settings.currency ?? "EUR",
  };

  return (
    <BalanceCard
      title="Net Worth"
      value={totalValue}
      currency={user?.settings.currency ?? "EUR"}
      change={change}
      className={className}
    />
  );
}
