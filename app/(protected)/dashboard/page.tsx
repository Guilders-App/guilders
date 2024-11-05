"use client";

import { AssetsCard } from "@/components/dashboard/assets-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";
import { TransactionsCard } from "@/components/dashboard/net-worth-transactions";

export default function ProtectedPage() {
  // useEffect(() => {
  //   fetch("/api/cron/insert-institutions");
  // }, []);
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
