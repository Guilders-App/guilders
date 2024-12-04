"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useCurrencies } from "@/lib/hooks/useCurrencies";
import { useDialog } from "@/lib/hooks/useDialog";
import { useToast } from "@/lib/hooks/useToast";
import { useAddTransaction } from "@/lib/hooks/useTransactions";
import { useUser } from "@/lib/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  currency: z.string().min(1, "Currency is required."),
  description: z.string().min(1, "Description is required."),
  category: z.string().min(1, "Category is required."),
  date: z.string().min(1, "Date is required."),
});

type FormSchema = z.infer<typeof formSchema>;

export function AddTransactionDialog() {
  const { isOpen, close } = useDialog("addTransaction");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { mutate: addTransaction } = useAddTransaction();
  const { data: accounts } = useAccounts();
  const { data: currencies } = useCurrencies();
  const { data: user } = useUser();

  const manualAccounts = accounts?.filter(
    (account) => !account.institution_connection_id
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountId: undefined,
      amount: "",
      currency: user?.currency ?? "",
      description: "",
      category: "",
      date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
    },
  });

  // Set currency when account is selected
  useEffect(() => {
    const accountId = form.watch("accountId");
    const account = accounts?.find((a) => a.id === accountId);
    if (account) {
      form.setValue("currency", account.currency);
    }
  }, [form.watch("accountId"), accounts, form]);

  useEffect(() => {
    if (user?.currency) {
      form.setValue("currency", user.currency);
    }
  }, [user?.currency, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true);

    try {
      await addTransaction({
        account_id: data.accountId,
        amount: parseFloat(data.amount),
        currency: data.currency,
        description: data.description,
        category: data.category,
        date: new Date(data.date).toISOString(),
      });

      toast({
        title: "Transaction added!",
        description: "Your transaction has been added successfully.",
      });
      close();
    } catch (error) {
      toast({
        title: "Error adding transaction",
        description:
          "There was an error adding your transaction. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding transaction:", error);
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new transaction to your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manualAccounts?.map((account) => (
                        <SelectItem
                          key={account.id}
                          value={account.id.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
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
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Enter amount" {...field} />
                    </FormControl>
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-[100px]">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies?.map((currency) => (
                              <SelectItem
                                key={currency.code}
                                value={currency.code}
                              >
                                {currency.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
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
                    <Input placeholder="Enter description" {...field} />
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
                    <Input placeholder="Enter category" {...field} />
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
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} step="60" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Transaction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
