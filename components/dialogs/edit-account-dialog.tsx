"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRemoveAccount, useUpdateAccount } from "@/hooks/useAccounts";
import { useFixConnection, useGetConnections } from "@/hooks/useConnections";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useDialog } from "@/hooks/useDialog";
import { useInstitutionByAccountId } from "@/hooks/useInstitutions";
import { useProvider } from "@/hooks/useProviders";
import { useToast } from "@/hooks/useToast";
import { accountSubtypeLabels, accountSubtypes } from "@/lib/db/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const detailsSchema = z.object({
  accountType: z.enum(accountSubtypes),
  accountName: z.string().min(1, "Account name is required."),
  value: z
    .string()
    .min(1, "Value is required.")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid number format."),
  currency: z.string(),
});

const taxSchema = z.object({
  investable: z.enum([
    "non_investable",
    "investable_easy_convert",
    "investable_cash",
  ]),
  taxability: z.enum(["taxable", "tax_free", "tax_deferred"]),
  taxRate: z
    .string()
    .regex(/^\d*\.?\d*$/, "Invalid tax rate")
    .optional(),
});

const notesSchema = z.object({
  notes: z.string().optional(),
});

const formSchema = detailsSchema.merge(taxSchema).merge(notesSchema);

type FormSchema = z.infer<typeof formSchema>;

export function EditAccountDialog() {
  const { isOpen, data, close } = useDialog("editAccount");
  const { open: openProviderDialog } = useDialog("provider");
  const { toast } = useToast();
  const { data: connections } = useGetConnections();
  const institution = useInstitutionByAccountId(data?.account?.id);
  const connection = connections?.find(
    (c) => c.id === data?.account?.institution_connection_id
  );
  const { data: provider } = useProvider(connection?.provider_id);
  const { data: currencies } = useCurrencies();

  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();
  const { mutate: removeAccount, isPending: isDeleting } = useRemoveAccount();
  const { mutateAsync: fixConnection, isPending: isFixing } =
    useFixConnection();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: data?.account?.subtype ?? accountSubtypes[0],
      accountName: data?.account?.name ?? "",
      value: data?.account?.value.toString() ?? "",
      currency: data?.account?.currency ?? "",
      investable: data?.account?.investable ?? "non_investable",
      taxability: data?.account?.taxability ?? "taxable",
      taxRate: data?.account?.tax_rate?.toString() ?? "",
      notes: data?.account?.notes ?? "",
    },
  });

  useEffect(() => {
    if (data?.account) {
      form.reset({
        accountType: data.account.subtype,
        accountName: data.account.name,
        value: data.account.value.toString(),
        currency: data.account.currency,
        investable: data.account.investable,
        taxability: data.account.taxability,
        taxRate: data.account.tax_rate?.toString() ?? "",
        notes: data.account.notes,
      });
    }
  }, [data?.account, form]);

  if (!isOpen || !data?.account) return null;
  const { account } = data;

  const isSyncedAccount = !!account.institution_connection_id;

  const handleFixConnection = async () => {
    if (!institution || !provider) return;

    const { success, data: redirectUrl } = await fixConnection({
      providerName: provider.name.toLocaleLowerCase(),
      institutionId: institution.id,
      accountId: account.id,
    });

    if (success) {
      close();
      openProviderDialog({
        redirectUri: redirectUrl,
        operation: "reconnect",
      });
    } else {
      close();
      toast({
        title: "Failed to fix connection",
        description: "Unable to fix connection. Please try again later.",
      });
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const updatedAccount = {
      id: account.id,
      subtype: data.accountType,
      name: data.accountName,
      value: parseFloat(data.value),
      currency: data.currency,
      investable: data.investable,
      taxability: data.taxability,
      tax_rate: data.taxRate ? parseFloat(data.taxRate) : null,
      notes: data.notes ?? "",
    };

    updateAccount(updatedAccount, {
      onSuccess: () => {
        toast({
          title: "Account updated",
          description: "Your account has been updated successfully.",
        });
        close();
      },
      onError: (error) => {
        toast({
          title: "Error updating account",
          description:
            "There was an error updating your account. Please try again.",
          variant: "destructive",
        });
        console.error("Error updating account:", error);
      },
    });
  });

  const handleDelete = async () => {
    removeAccount(account.id, {
      onSuccess: () => {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
        });
        close();
      },
      onError: (error) => {
        toast({
          title: "Error deleting account",
          description:
            "There was an error deleting your account. Please try again.",
          variant: "destructive",
        });
        console.error("Error deleting account:", error);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogDescription className="hidden">
          Edit the details of this account.
        </DialogDescription>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tax">Tax</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {isSyncedAccount && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md mb-4">
                    This account is managed by an external connection. Some
                    fields cannot be edited.
                  </div>
                )}
                {account.broken && (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-yellow-500 bg-yellow-500/10 p-3 rounded-md flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>
                          This account&apos;s connection needs to be fixed.
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-foreground ml-auto"
                        onClick={handleFixConnection}
                        disabled={isFixing}
                      >
                        {isFixing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Fixing...
                          </>
                        ) : (
                          "Fix Connection"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSyncedAccount}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accountSubtypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {accountSubtypeLabels[type]}
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
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter account name"
                          {...field}
                          disabled={isSyncedAccount}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter value"
                            {...field}
                            disabled={isSyncedAccount}
                          />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isSyncedAccount}
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

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Danger Zone</p>
                  <p className="text-sm text-muted-foreground">
                    Deleting this account will permanently remove it and all
                    associated data. This action cannot be undone.
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleDelete}
                          disabled={isDeleting || isSyncedAccount}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete Account
                            </>
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {isSyncedAccount && (
                      <TooltipContent>
                        Synced accounts cannot be deleted. Remove the connection
                        instead.
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </TabsContent>

              <TabsContent value="tax" className="space-y-4">
                <FormField
                  control={form.control}
                  name="investable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investability</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select investability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="non_investable">
                            Non-investable
                          </SelectItem>
                          <SelectItem value="investable_easy_convert">
                            Easily Convertible
                          </SelectItem>
                          <SelectItem value="investable_cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxability</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select taxability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="taxable">Taxable</SelectItem>
                          <SelectItem value="tax_free">Tax Free</SelectItem>
                          <SelectItem value="tax_deferred">
                            Tax Deferred
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter tax rate"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter notes about this account"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="documents">
                <div className="text-center text-muted-foreground py-8">
                  Document upload functionality coming soon...
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <Button
                type="submit"
                disabled={isUpdating || isDeleting}
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
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
