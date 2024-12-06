"use client";

import { AssetsCard } from "@/components/dashboard/assets/assets-card";
import { CategoriesCard } from "@/components/dashboard/categories/categories-card";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";
import { TransactionsCard } from "@/components/dashboard/transactions/transactions-card";

export default function ProtectedPage() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-5 gap-6">
        <NetWorthCard className="col-span-3" />
        <CategoriesCard className="col-span-2" />
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
