"use client";

import { DateTimePicker } from "@/components/common/datetime-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useDialog } from "@/lib/hooks/useDialog";
import { useToast } from "@/lib/hooks/useToast";
import {
  useRemoveTransaction,
  useUpdateTransaction,
} from "@/lib/hooks/useTransactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  accountId: z.number({
    required_error: "Please select an account",
  }),
  amount: z
    .string()
    .min(1, "Amount is required.")
    .regex(/^-?\d+(\.\d{1,2})?$/, "Invalid number format."),
  description: z.string().min(1, "Description is required."),
  category: z.string().min(1, "Category is required."),
  date: z.string().min(1, "Date is required."),
});

type FormSchema = z.infer<typeof formSchema>;

function formatDateForInput(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
}

function formatDateForSubmit(dateString: string) {
  return new Date(dateString).toISOString();
}

export function EditTransactionDialog() {
  const { isOpen, data, close } = useDialog("editTransaction");
  const { toast } = useToast();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateTransaction();
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useRemoveTransaction();
  const { data: accounts } = useAccounts();

  const currentAccount = accounts?.find(
    (account) => account.id === data?.transaction?.account_id
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: data?.transaction?.account_id ?? undefined,
      amount: data?.transaction?.amount.toString() ?? "",
      description: data?.transaction?.description ?? "",
      category: data?.transaction?.category ?? "",
      date: data?.transaction?.date
        ? formatDateForInput(data.transaction.date)
        : "",
    },
  });

  useEffect(() => {
    if (data?.transaction) {
      form.reset({
        accountId: data.transaction.account_id,
        amount: data.transaction.amount.toString(),
        description: data.transaction.description,
        category: data.transaction.category,
        date: formatDateForInput(data.transaction.date),
      });
    }
  }, [data?.transaction, form]);

  if (!isOpen || !data?.transaction) return null;
  const { transaction } = data;

  const isSyncedTransaction = !!transaction.provider_transaction_id;

  const handleSubmit = form.handleSubmit(async (formData) => {
    const updatedTransaction = {
      id: transaction.id,
      account_id: formData.accountId,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formatDateForSubmit(formData.date),
      currency: transaction.currency,
    };

    updateTransaction(updatedTransaction, {
      onSuccess: () => {
        toast({
          title: "Transaction updated",
          description: "Your transaction has been updated successfully.",
        });
        close();
      },
      onError: (error) => {
        toast({
          title: "Error updating transaction",
          description:
            "There was an error updating your transaction. Please try again.",
          variant: "destructive",
        });
        console.error("Error updating transaction:", error);
      },
    });
  });

  const handleDelete = async () => {
    deleteTransaction(transaction.id, {
      onSuccess: () => {
        toast({
          title: "Transaction deleted",
          description: "Your transaction has been deleted successfully.",
        });
        close();
      },
      onError: (error) => {
        toast({
          title: "Error deleting transaction",
          description:
            "There was an error deleting your transaction. Please try again.",
          variant: "destructive",
        });
        console.error("Error deleting transaction:", error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogDescription className="hidden">
          Edit the details of this transaction.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSyncedTransaction && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                This transaction is managed by an external connection. It cannot
                be edited.
              </div>
            )}

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={isSyncedTransaction}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {currentAccount?.name ?? "Select account"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => {
                        const isConnected = !!account.institution_connection_id;
                        return (
                          <SelectItem
                            key={account.id}
                            value={account.id.toString()}
                            disabled={
                              isConnected && account.id !== currentAccount?.id
                            }
                          >
                            {account.name}
                            {isConnected && " (Connected)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      {...field}
                      disabled={isSyncedTransaction}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter description"
                      {...field}
                      disabled={isSyncedTransaction}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category"
                      {...field}
                      disabled={isSyncedTransaction}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      date={field.value ? new Date(field.value) : undefined}
                      onDateChange={(date) => {
                        if (date) {
                          field.onChange(date.toISOString());
                        }
                      }}
                      onTimeChange={(time) => {
                        if (field.value) {
                          const currentDate = new Date(field.value);
                          const [hours, minutes] = time.split(":");
                          currentDate.setHours(
                            parseInt(hours),
                            parseInt(minutes)
                          );
                          field.onChange(currentDate.toISOString());
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Danger Zone</p>
              <p className="text-sm text-muted-foreground">
                Deleting this transaction will permanently remove it. This
                action cannot be undone.
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isDeleting || isSyncedTransaction}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-3 w-3" />
                          Delete Transaction
                        </>
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {isSyncedTransaction && (
                  <TooltipContent>
                    Synced transactions cannot be deleted. Remove the connection
                    instead.
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            <Button
              type="submit"
              disabled={isUpdating || isDeleting || isSyncedTransaction}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
