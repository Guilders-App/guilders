"use client";

import { AssetsCard } from "@/components/dashboard/assets-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";
import { TransactionsCard } from "@/components/dashboard/net-worth-transactions";
import { useAccountStore } from "@/lib/store/accountStore";
import { useCurrencyStore } from "@/lib/store/currencyStore";
import { useExchangeRateStore } from "@/lib/store/exchangeRateStore";
import { useSnapTradeStore } from "@/lib/store/snaptradeStore";
import { useEffect } from "react";

export default function ProtectedPage() {
  const { initializeAccounts } = useAccountStore();
  const { fetchCurrencies } = useCurrencyStore();
  const { fetchExchangeRates } = useExchangeRateStore();
  const { registerUser } = useSnapTradeStore();

  useEffect(() => {
    initializeAccounts();
    fetchCurrencies();
    fetchExchangeRates();
    registerUser();
  }, [initializeAccounts, fetchCurrencies, fetchExchangeRates, registerUser]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <NetWorthCard />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <AssetsCard />
        </div>
        <div className="col-span-2">
          <TransactionsCard />
        </div>
      </div>
    </div>
  );
}
