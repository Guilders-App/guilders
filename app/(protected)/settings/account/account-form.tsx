"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
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
import { useCurrencies } from "@/hooks/useCurrencies";
import { toast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";

const accountFormSchema = z.object({
  email: z.string().email(),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const { data: user, isLoading: isUserLoading, error: userError } = useUser();

  const {
    data: currencies,
    isLoading: isCurrenciesLoading,
    error: currenciesError,
  } = useCurrencies();

  if (currenciesError || userError) {
    toast({
      title: "Error loading settings",
      description: "Unable to load settings. Please try again later.",
      variant: "destructive",
    });
  }

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: useMemo(() => {
      return {
        email: user?.email ?? "",
        currency: user?.currency ?? "",
      };
    }, [user]),
  });

  function onSubmit(data: AccountFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

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
                value={field.value}
                disabled={isCurrenciesLoading || isUserLoading || !currencies}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isCurrenciesLoading || isUserLoading
                          ? "Loading..."
                          : "Select currency"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sortedCurrencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code}
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
        <Button type="submit">Update account</Button>
      </form>
    </Form>
  );
}
