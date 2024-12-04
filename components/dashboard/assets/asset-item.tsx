import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Account } from "@/lib/db/types";
import { useDialog } from "@/lib/hooks/useDialog";
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
  TriangleAlert,
} from "lucide-react";
import Image from "next/image";
import { ChangeIndicator } from "../change-indicator";

interface AssetItemProps {
  account: Account;
  isChild?: boolean;
  imageErrors: Record<string, boolean>;
  onImageError: (accountId: number) => void;
}

export function AssetItem({
  account,
  isChild = false,
  imageErrors,
  onImageError,
}: AssetItemProps) {
  const { open } = useDialog("editAccount");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent accordion from toggling when clicking the row
    open({ account });
  };

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
            className="rounded-full w-8 h-8"
            onError={() => onImageError(account.id)}
          />
        ) : (
          <div className="w-8 h-8 p-2 flex items-center justify-center text-muted-foreground rounded-full bg-muted">
            {getFallbackIcon()}
          </div>
        )}
        <div className="flex items-center gap-2">
          <p className="font-medium">{account.name}</p>
          {account.broken && (
            <TriangleAlert className="h-4 w-4 text-yellow-500" />
          )}
        </div>
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

  if (account.children?.length > 0) {
    return (
      <Accordion type="multiple" key={account.id}>
        <AccordionItem value={account.id.toString()} className="border-none">
          <div
            className={`rounded-lg hover:bg-secondary dark:hover:bg-secondary ${
              isChild ? "ml-6" : ""
            }`}
          >
            <AccordionTrigger
              className="flex items-center w-full px-2 py-2 no-underline hover:no-underline [&[data-state=open]]:no-underline"
              onClick={(e) => e.stopPropagation()} // Prevent double-firing of click events
            >
              <div
                className="flex flex-1 items-center justify-between cursor-pointer"
                onClick={handleClick}
              >
                {commonRowContent}
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent>
            {account.children.map((childAccount) => (
              <AssetItem
                key={childAccount.id}
                account={childAccount}
                isChild={true}
                imageErrors={imageErrors}
                onImageError={onImageError}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-2 py-2 pr-6 rounded-lg hover:bg-secondary dark:hover:bg-secondary cursor-pointer ${
        isChild ? "ml-6" : ""
      }`}
    >
      {commonRowContent}
    </div>
  );
}
