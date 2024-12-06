import { Account } from "@/lib/db/types";
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

interface AccountIconProps {
  account: Account;
  hasImageError: boolean;
  onImageError: (accountId: number) => void;
}

export function AccountIcon({
  account,
  hasImageError,
  onImageError,
}: AccountIconProps) {
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

  if (account.image && !hasImageError) {
    return (
      <Image
        src={account.image}
        alt={account.name}
        width={32}
        height={32}
        className="rounded-full w-8 h-8"
        onError={() => onImageError(account.id)}
      />
    );
  }

  return (
    <div className="w-8 h-8 p-2 flex items-center justify-center text-muted-foreground rounded-full bg-muted">
      {getFallbackIcon()}
    </div>
  );
}
