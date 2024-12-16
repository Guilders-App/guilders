"use client";

import { AccountsCard } from "@/components/dashboard/accounts/account-card";
import { CategoriesCard } from "@/components/dashboard/categories/categories-card";
import { NetWorthCard } from "@/components/dashboard/net-worth-card";
import { TransactionsCard } from "@/components/dashboard/transactions/transactions-card";
import { Button } from "@guilders/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const transactionsMenu = (
    <Link href="/transactions">
      <Button variant="secondary">
        View All
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
  return (
    <div className="grid gap-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <NetWorthCard className="col-span-1 md:col-span-3" />
        <CategoriesCard className="col-span-1 md:col-span-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="col-span-1 md:col-span-3">
          <AccountsCard className="h-[400px]" />
        </div>
        <div className="col-span-1 md:col-span-2">
          <TransactionsCard
            className="h-[400px]"
            menuComponent={transactionsMenu}
          />
        </div>
      </div>
    </div>
  );
}
