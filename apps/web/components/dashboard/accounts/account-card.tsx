import { AccountsTable } from "@/apps/web/components/dashboard/accounts/accounts-table";
import { Button } from "@/apps/web/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/apps/web/components/ui/card";
import { ScrollArea, ScrollBar } from "@/apps/web/components/ui/scroll-area";
import { Account } from "@/apps/web/lib/db/types";
import { cn } from "@/apps/web/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface AccountsCardProps {
  className?: string;
  showViewAll?: boolean;
  title?: string;
  accounts?: Account[];
}

export function AccountsCard({
  className,
  showViewAll = true,
  title = "Accounts",
  accounts,
}: AccountsCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        {showViewAll && (
          <Link href="/accounts">
            <Button variant="secondary">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <AccountsTable accounts={accounts} />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
