import { trpc } from "@/lib/trpc/client";

export function NetWorthDisplay() {
  const { data: accounts } = trpc.account.getAll.useQuery();
  const totalValue = accounts?.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex items-baseline">
      <span className="text-2xl font-light text-gray-400">$</span>
      <span className="text-4xl font-normal font-mono tracking-tight">
        {totalValue?.toLocaleString()}
      </span>
    </div>
  );
}
