import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Account } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AssetsTable } from "./assets-table";

interface AssetsCardProps {
  className?: string;
  showViewAll?: boolean;
  title?: string;
  accounts?: Account[];
}

export function AssetsCard({
  className,
  showViewAll = true,
  title = "Assets",
  accounts,
}: AssetsCardProps) {
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
          <AssetsTable accounts={accounts} />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
