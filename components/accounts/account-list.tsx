"use client";

import { trpc } from "@/lib/trpc/client";

export function AccountList() {
  const { data: accounts, isLoading } = trpc.account.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {accounts?.map((account) => <div key={account.id}>{account.name}</div>)}
    </div>
  );
}
