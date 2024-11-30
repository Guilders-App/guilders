import { Skeleton } from "@/components/ui/skeleton";
import { useAccounts } from "@/hooks/useAccounts";
import {
  AccountSubtype,
  getCategoryColor,
  getCategoryDisplayName,
} from "@/lib/db/types";
import { useMemo } from "react";

export function NetWorthCategories() {
  const { data: accounts, isLoading, isError, error } = useAccounts();

  const categories = useMemo(() => {
    if (!accounts) return { positive: [], negative: [] };

    const categoryMap: Record<AccountSubtype, number> = {
      depository: 0,
      brokerage: 0,
      crypto: 0,
      property: 0,
      vehicle: 0,
      creditcard: 0,
      loan: 0,
      stock: 0,
    };

    accounts.forEach((account) => {
      categoryMap[account.subtype] += account.value;
    });

    const categoriesArray = Object.entries(categoryMap)
      .map(([name, value]) => ({ name: name as AccountSubtype, value }))
      .filter((category) => category.value !== 0);

    return {
      positive: categoriesArray.filter((c) => c.value > 0),
      negative: categoriesArray.filter((c) => c.value < 0),
    };
  }, [accounts]);

  const { positiveSum, negativeSum } = useMemo(() => {
    return {
      positiveSum: categories.positive.reduce(
        (sum, category) => sum + category.value,
        0
      ),
      negativeSum: Math.abs(
        categories.negative.reduce((sum, category) => sum + category.value, 0)
      ),
    };
  }, [categories]);

  return (
    <>
      {/* <h2 className="text-xl font-light text-white mb-4">Categories</h2> */}

      {isError && (
        <div className="text-red-500">
          Error loading accounts: {error.message}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center">
              <Skeleton className="w-3 h-3 rounded-full mr-2" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8 ml-auto" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {categories.positive.length > 0 && (
            <>
              <h3 className="text-md font-medium mb-2 text-foreground/80">
                Assets
              </h3>
              <div className="flex mb-2">
                {categories.positive.map((category, index) => {
                  const percentage = (
                    (category.value / positiveSum) *
                    100
                  ).toFixed(0);
                  return (
                    <div
                      key={category.name}
                      className={`h-4
                        ${index > 0 ? "ml-0.5" : ""}
                        ${index < categories.positive.length - 1 ? "mr-0.5" : ""}
                        ${index === 0 ? "rounded-l-sm" : ""}
                        ${index === categories.positive.length - 1 ? "rounded-r-sm" : ""}
                      `}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category.name),
                      }}
                    ></div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {categories.positive.map((category) => {
                  const percentage = (
                    (category.value / positiveSum) *
                    100
                  ).toFixed(0);
                  return (
                    <div key={category.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: getCategoryColor(category.name),
                        }}
                      ></div>
                      <span className="text-sm font-light">
                        {getCategoryDisplayName(category.name)}
                      </span>
                      <span className="text-foreground/60 font-light text-sm ml-auto">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {categories.negative.length > 0 && (
            <>
              <h3 className="text-md font-medium mb-2 text-foreground/80">
                Liabilities
              </h3>
              <div className="flex mb-2">
                {categories.negative.map((category, index) => {
                  const percentage = (
                    (Math.abs(category.value) / negativeSum) *
                    100
                  ).toFixed(0);
                  return (
                    <div
                      key={category.name}
                      className={`h-4
                        ${index > 0 ? "ml-0.5" : ""}
                        ${index < categories.negative.length - 1 ? "mr-0.5" : ""}
                        ${index === 0 ? "rounded-l-sm" : ""}
                        ${index === categories.negative.length - 1 ? "rounded-r-sm" : ""}
                      `}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(category.name),
                        opacity: 0.7,
                      }}
                    ></div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.negative.map((category) => {
                  const percentage = (
                    (Math.abs(category.value) / negativeSum) *
                    100
                  ).toFixed(0);
                  return (
                    <div key={category.name} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: getCategoryColor(category.name),
                        }}
                      ></div>
                      <span className="text-sm font-light">
                        {getCategoryDisplayName(category.name)}
                      </span>
                      <span className="text-foreground/60 font-light text-sm ml-auto">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
