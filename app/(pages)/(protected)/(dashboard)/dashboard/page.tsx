"use client";

import { AssetsCard } from "@/components/dashboard/assets/assets-card";
import { NetWorthDetails } from "@/components/dashboard/net-worth-details";
import { NetWorthInfo } from "@/components/dashboard/net-worth-info";
import { TransactionsCard } from "@/components/dashboard/transactions/transactions-card";

export default function ProtectedPage() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-5 gap-6">
        <NetWorthInfo className="col-span-3" />
        <NetWorthDetails className="col-span-2" />
      </div>
      {/* TODO: Make this responsive to screen size */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <AssetsCard className="h-[400px]" />
        </div>
        <div className="col-span-2">
          <TransactionsCard className="h-[400px]" />
        </div>
      </div>
    </div>
  );
}
