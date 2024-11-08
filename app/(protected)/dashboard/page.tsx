"use client";

import { AssetsCard } from "@/components/dashboard/assets-card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NetWorthDetails } from "@/components/dashboard/net-worth-details";
import { NetWorthInfo } from "@/components/dashboard/net-worth-info";
import { TransactionsCard } from "@/components/dashboard/net-worth-transactions";

export default function ProtectedPage() {
  // useEffect(() => {
  //   fetch("/api/cron/insert-institutions");
  // }, []);
  return (
    <div className="grid gap-6">
      <DashboardHeader />
      <div className="grid grid-cols-5 gap-6">
        <NetWorthInfo className="col-span-3" />
        <NetWorthDetails className="col-span-2" />
      </div>
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
