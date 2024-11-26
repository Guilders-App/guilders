import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Account } from "@/lib/db/types";
import { trpc } from "@/lib/trpc/client";
import {
  Bitcoin,
  CarFront,
  ChartCandlestick,
  CirclePercent,
  CreditCard,
  DollarSign,
  HandCoins,
  House,
  Landmark,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { AssetsEmptyPlaceholder } from "./assets-placeholder";
import { ChangeIndicator } from "./change-indicator";

export function AssetsTable() {
  const { data: accounts, isLoading, error } = trpc.account.getAll.useQuery();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const renderAccount = (account: Account, isChild = false) => {
    const changePercentage =
      account.cost !== null
        ? ((account.value - account.cost) / account.cost) * 100
        : 0;

    const getFallbackIcon = () => {
      switch (account.subtype) {
        case "depository":
          return <Landmark className="w-6 h-6" />;
        case "brokerage":
          return <ChartCandlestick className="w-6 h-6" />;
        case "crypto":
          return <Bitcoin className="w-6 h-6" />;
        case "property":
          return <House className="w-6 h-6" />;
        case "creditcard":
          return <CreditCard className="w-6 h-6" />;
        case "loan":
          return <HandCoins className="w-6 h-6" />;
        case "vehicle":
          return <CarFront className="w-6 h-6" />;
        case "stock":
          return <CirclePercent className="w-6 h-6" />;
        default:
          return <DollarSign className="w-6 h-6" />;
      }
    };

    const commonRowContent = (
      <>
        <div className="flex items-center gap-4">
          {account.image && !imageErrors[account.id] ? (
            <Image
              src={account.image}
              alt={account.name}
              width={32}
              height={32}
              className="rounded-full"
              onError={() =>
                setImageErrors((prev) => ({ ...prev, [account.id]: true }))
              }
            />
          ) : (
            <div className="w-8 h-8 p-2 flex items-center justify-center text-muted-foreground rounded-full bg-muted">
              {getFallbackIcon()}
            </div>
          )}
          <p className="font-medium">{account.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="font-medium">
            $
            {account.value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <ChangeIndicator
            change={{
              value: account.cost !== null ? account.value - account.cost : 0,
              percentage: changePercentage,
            }}
          />
        </div>
      </>
    );

    return account.children.length > 0 ? (
      <Accordion type="multiple" key={account.id}>
        <AccordionItem value={account.id.toString()} className="border-none">
          <div
            className={`rounded-lg hover:bg-secondary dark:hover:bg-secondary ${
              isChild ? "ml-6" : ""
            }`}
          >
            <AccordionTrigger className="flex items-center w-full px-2 py-2 no-underline hover:no-underline [&[data-state=open]]:no-underline">
              <div className="flex flex-1 items-center justify-between">
                {commonRowContent}
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent>
            {account.children.map((childAccount) =>
              renderAccount(childAccount, true)
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    ) : (
      <div
        key={account.id}
        className={`flex items-center justify-between px-2 py-2 pr-6 rounded-lg hover:bg-secondary dark:hover:bg-secondary ${
          isChild ? "ml-6" : ""
        }`}
      >
        {commonRowContent}
      </div>
    );
  };

  return (
    <div className="space-y-2 min-h-[200px]">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full mb-2" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="mb-4">
            Error loading accounts. Please try again later.
          </p>
        </div>
      ) : accounts && accounts.length === 0 ? (
        <AssetsEmptyPlaceholder />
      ) : (
        accounts?.map((account) => renderAccount(account))
      )}
    </div>
  );
}
