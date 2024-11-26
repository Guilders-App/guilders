"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { toast } from "@/lib/hooks/useToast";
import { trpc } from "@/lib/trpc/client";

const accountFormSchema = z.object({
  email: z.string().email(),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = trpc.user.get.useQuery();
  const { mutateAsync: updateUserSettings } = trpc.user.update.useMutation();

  const {
    data: currencies,
    isLoading: isCurrenciesLoading,
    error: currenciesError,
  } = trpc.currency.getAll.useQuery();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user?.email ?? "",
      currency: user?.currency ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        currency: user.currency,
      });
    }
  }, [user, form]);

  const customOrder = ["USD", "GBP", "EUR"];
  const sortedCurrencies = useMemo(() => {
    if (!currencies) return [];

    const orderedCurrencies = customOrder
      .map((code) => currencies.find((c) => c.code === code))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);

    const remainingCurrencies = currencies
      .filter((c) => !customOrder.includes(c.code))
      .sort((a, b) => a.code.localeCompare(b.code));

    return [...orderedCurrencies, ...remainingCurrencies];
  }, [currencies]);

  if (isUserLoading || isCurrenciesLoading) {
    return (
      <div className="flex items-center justify-center py-6">Loading...</div>
    );
  }

  if (userError) {
    return (
      <div className="text-destructive">
        Error loading user data. Please try again later.
      </div>
    );
  }

  if (currenciesError) {
    return (
      <div className="text-destructive">
        Error loading currencies. Please try again later.
      </div>
    );
  }

  async function onSubmit(data: AccountFormValues) {
    try {
      await updateUserSettings({ email: data.email, currency: data.currency });

      if (data.email !== user?.email) {
        toast({
          title: "Email verification sent",
          description: "Please check your email for a verification link.",
        });
      } else {
        toast({
          title: "Account updated",
          description: "Your account has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormDescription>
                This is the email that will be used to login to your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency">
                      {field.value}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sortedCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This is the currency that will be used for your account.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!form.formState.isDirty || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Updating..." : "Update account"}
        </Button>
      </form>
    </Form>
  );
}
