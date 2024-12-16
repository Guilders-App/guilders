import { Button } from "@guilders/ui/button";
import { CardContent } from "@guilders/ui/card";
import { cn } from "@guilders/ui/cn";
import { Input } from "@guilders/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { subscribeAction } from "../actions/subscribe";

export default function NewsletterForm({ className }: { className?: string }) {
  const [isSubmitted, setSubmitted] = useState(false);

  return (
    <CardContent className={cn("w-full max-w-md", className)}>
      <form
        action={async (formData) => {
          setSubmitted(true);
          await subscribeAction(formData);

          setTimeout(() => {
            setSubmitted(false);
          }, 5000);
        }}
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        noValidate
      >
        <div className="flex-1">
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            data-1p-ignore="true"
          />
        </div>
        {isSubmitted ? (
          <Button disabled className="w-full sm:w-auto">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit" className="w-full sm:w-auto">
            Join waitlist
          </Button>
        )}
      </form>
    </CardContent>
  );
}
