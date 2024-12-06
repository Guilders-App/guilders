"use client";

import { AccountIcon } from "@/components/dashboard/assets/account-icon";
import { AssetsTable } from "@/components/dashboard/assets/assets-table";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { TransactionsTable } from "@/components/dashboard/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount, useRemoveAccount } from "@/lib/hooks/useAccounts";
import { useDialog } from "@/lib/hooks/useDialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

export default function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: account, isLoading } = useAccount(parseInt(id));
  const [imageError, setImageError] = useState(false);
  const { open: openEdit } = useDialog("editAccount");
  const { open: openConfirmation } = useDialog("confirmation");
  const { mutate: removeAccount, isPending: isDeleting } = useRemoveAccount();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-4">
        <p>Account not found</p>
      </div>
    );
  }

  const change = {
    value: account.cost ? account.value - account.cost : 0,
    percentage: account.cost
      ? ((account.value - account.cost) / account.cost) * 100
      : 0,
    currency: account.currency,
  };

  const handleEdit = () => {
    if (account) {
      openEdit({ account });
    }
  };

  const handleDelete = () => {
    if (!account) return;

    openConfirmation({
      title: "Delete Account",
      description:
        "Are you sure you want to delete this account? This action cannot be undone.",
      confirmText: "Delete Account",
      isLoading: isDeleting,
      onConfirm: () => {
        removeAccount(account.id, {
          onSuccess: () => {
            toast.success("Account deleted");
            router.push("/accounts");
          },
          onError: (error) => {
            toast.error("Error deleting account");
            console.error("Error deleting account:", error);
          },
        });
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <AccountIcon
          account={account}
          hasImageError={imageError}
          onImageError={() => setImageError(true)}
        />
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{account.name}</h1>
            {account.institution_connection?.institution?.name && (
              <p className="text-sm text-muted-foreground">
                {account.institution_connection.institution.name}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <BalanceCard
        title={account.subtype === "depository" ? "Balance" : "Value"}
        value={account.value}
        currency={account.currency}
        change={change}
      />

      {account.subtype === "depository" ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {account.subtype === "depository" ? "Transactions" : "Holdings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable accountId={account.id} />
          </CardContent>
        </Card>
      ) : null}
      {account.subtype === "brokerage" && account.children.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetsTable accounts={account.children} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
