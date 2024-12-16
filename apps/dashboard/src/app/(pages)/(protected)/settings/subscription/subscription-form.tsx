"use client";

import { Button } from "@/apps/web/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/apps/web/components/ui/card";
import {
  usePortalSession,
  useSubscription,
} from "@/apps/web/lib/hooks/useSubscription";
import { useUser } from "@/apps/web/lib/hooks/useUser";
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
  const isTrialing = user?.subscription?.status === "trialing";
  const periodEnd = user?.subscription?.current_period_end
    ? new Date(user.subscription.current_period_end)
    : null;
  const trialEnd = user?.subscription?.trial_end
    ? new Date(user.subscription?.trial_end)
    : null;
  const hasTrialExpired = trialEnd && trialEnd < new Date();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isTrialing
            ? "Pro Trial"
            : isSubscribed
              ? "Pro Plan"
              : "Upgrade to Pro"}
        </CardTitle>
        <CardDescription>
          {isTrialing
            ? "You are currently on the Pro trial"
            : isSubscribed
              ? "You are currently on the Pro plan"
              : hasTrialExpired
                ? "Unlock all features with our Pro plan"
                : "Try Pro free for 14 days, no credit card required"}
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
        {isTrialing ? (
          <p className="text-sm text-muted-foreground">
            Your trial ends on{" "}
            {trialEnd?.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        ) : isSubscribed ? (
          <p className="text-sm text-muted-foreground">
            Your subscription will renew on{" "}
            {periodEnd?.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">
              €7.99/month after your trial ends
            </p>
            <p className="text-xs text-muted-foreground">
              Cancel anytime. No credit card required.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={
            isSubscribed || isTrialing
              ? handleManageSubscription
              : handleSubscribe
          }
          disabled={isProcessing || isRedirecting}
        >
          {(isProcessing || isRedirecting) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSubscribed || isTrialing
            ? "Manage Subscription"
            : hasTrialExpired
              ? "Subscribe - €7.99/month"
              : "Start 14-day free trial"}
        </Button>
      </CardFooter>
    </Card>
  );
}
