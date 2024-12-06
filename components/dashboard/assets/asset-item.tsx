import { ChangeBadge } from "@/components/common/change-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Account } from "@/lib/db/types";
import NumberFlow from "@number-flow/react";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AccountIcon } from "./account-icon";

interface AssetItemProps {
  account: Account;
  isChild?: boolean;
}

export function AssetItem({ account, isChild = false }: AssetItemProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent accordion from toggling when clicking the row
    router.push(`/accounts/${account.id}`);
  };

  const changePercentage =
    account.cost !== null
      ? ((account.value - account.cost) / account.cost) * 100
      : 0;

  const commonRowContent = (
    <>
      <div className="flex items-center gap-4">
        <AccountIcon
          account={account}
          width={32}
          height={32}
          hasImageError={imageError}
          onImageError={() => setImageError(true)}
        />
        <div className="flex items-center gap-2">
          <p className="font-medium">{account.name}</p>
          {account.institution_connection?.broken && (
            <TriangleAlert className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-medium">
          <NumberFlow
            value={account.value}
            format={{
              style: "currency",
              currency: account.currency,
            }}
          />
        </p>
        <ChangeBadge
          change={{
            value: account.cost !== null ? account.value - account.cost : 0,
            percentage: changePercentage,
            currency: account.currency,
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
      key={account.id}
      className={`flex items-center justify-between px-2 py-2 pr-6 rounded-lg hover:bg-secondary dark:hover:bg-secondary cursor-pointer ${
        isChild ? "ml-6" : ""
      }`}
    >
      {commonRowContent}
    </div>
  );
}
