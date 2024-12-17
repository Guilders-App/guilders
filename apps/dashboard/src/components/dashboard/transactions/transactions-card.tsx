import { Card, CardContent, CardHeader, CardTitle } from "@guilders/ui/card";
import { cn } from "@guilders/ui/cn";
import { ScrollArea, ScrollBar } from "@guilders/ui/scroll-area";
import type { ReactNode } from "react";
import { TransactionsTable } from "./transactions-table";

interface TransactionsCardProps {
  className?: string;
  title?: string;
  menuComponent?: ReactNode;
  children?: ReactNode;
}

export function TransactionsCard({
  className,
  title = "Transactions",
  menuComponent,
  children,
}: TransactionsCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <CardTitle>{title}</CardTitle>
          {menuComponent && (
            <div className="flex items-center gap-2">{menuComponent}</div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          {children || <TransactionsTable />}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
