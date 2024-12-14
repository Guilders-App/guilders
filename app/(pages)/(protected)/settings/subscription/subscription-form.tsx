"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePortalSession, useSubscription } from "@/lib/hooks/useSubscription";
import { useUser } from "@/lib/hooks/useUser";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SubscriptionForm() {
  const { data: user, isLoading } = useUser();
  const { mutateAsync: createSubscription, isPending: isProcessing } =
    useSubscription();
  const { mutateAsync: createPortalSession, isPending: isRedirecting } =
    usePortalSession();
  const router = useRouter();

  const handleSubscribe = async () => {
    try {
      const url = await createSubscription();
      router.push(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to redirect to checkout", {
        description: "Please try again later.",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      const url = await createPortalSession();
      router.push(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to open customer portal", {
        description: "Please try again later.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">Loading...</div>
    );
  }

  const isSubscribed = user?.subscription?.status === "active";
  const periodEnd = user?.subscription?.current_period_end
    ? new Date(user.subscription.current_period_end)
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isSubscribed ? "Pro Plan" : "Upgrade to Pro"}</CardTitle>
        <CardDescription>
          {isSubscribed
            ? "You are currently on the Pro plan"
            : "Unlock all features with our Pro plan"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>
              Automatic account tracking for banks, investments, crypto & more
            </span>
          </div>
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>Unlimited AI Advisor & other upcoming AI features</span>
          </div>
          <div className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>Priority support & founder phone number</span>
          </div>
        </div>
        {isSubscribed && periodEnd && (
          <p className="text-sm text-muted-foreground">
            Your subscription will renew on{" "}
            {periodEnd.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={isSubscribed ? handleManageSubscription : handleSubscribe}
          disabled={isProcessing || isRedirecting}
        >
          {(isProcessing || isRedirecting) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSubscribed ? "Manage Subscription" : `Subscribe - €7.99/month`}
        </Button>
      </CardFooter>
    </Card>
  );
}
