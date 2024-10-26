import { Skeleton } from "@/components/ui/skeleton";
import { useAccountStore } from "@/lib/store/accountStore";
import {
  AccountSubtype,
  getCategoryColor,
  getCategoryDisplayName,
} from "@/lib/supabase/types";
import { useMemo } from "react";

export function NetWorthCategories() {
  const { accounts, isInitialLoading } = useAccountStore();

  const categories = useMemo(() => {
    const categoryMap: Record<AccountSubtype, number> = {
      depository: 0,
      brokerage: 0,
      crypto: 0,
      property: 0,
      vehicle: 0,
      creditcard: 0,
      loan: 0,
    };

    accounts.forEach((account) => {
      categoryMap[account.subtype] += account.value;
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name: name as AccountSubtype, value }))
      .filter((category) => category.value !== 0);
  }, [accounts]);

  const totalSum = useMemo(
    () => categories.reduce((sum, category) => sum + category.value, 0),
    [categories]
  );

  if (isInitialLoading) {
    return (
      <div>
        <h2 className="text-xl font-light text-white mb-4">Categories</h2>
        <Skeleton className="h-4 w-full mb-2" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="w-3 h-3 rounded-full mr-2" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-light text-white mb-4">Categories</h2>
      <div className="flex mb-2">
        {categories.map((category, index) => {
          const percentage = ((category.value / totalSum) * 100).toFixed(0);
          return (
            <div
              key={category.name}
              className={`h-4
                ${index > 0 ? "ml-0.5" : ""} 
                ${index < categories.length - 1 ? "mr-0.5" : ""}
                ${index == 0 ? "rounded-l-sm" : ""}
                ${index == categories.length - 1 ? "rounded-r-sm" : ""}
                `}
              style={{
                width: `${percentage}%`,
                backgroundColor: getCategoryColor(category.name),
              }}
            ></div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const percentage = ((category.value / totalSum) * 100).toFixed(0);
          return (
            <div key={category.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getCategoryColor(category.name) }}
              ></div>
              <span className="text-white text-sm font-light">
                {getCategoryDisplayName(category.name)}
              </span>
              <span className="text-gray-400 font-light text-sm ml-auto">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
