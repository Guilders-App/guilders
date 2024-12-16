import { Button } from "@guilders/ui/button";
import { CardContent } from "@guilders/ui/card";
import { cn } from "@guilders/ui/cn";
import { Input } from "@guilders/ui/input";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeAction } from "../actions/subscribe";

function SubmitButton() {
  const { pending } = useFormStatus();

  return pending ? (
    <Button disabled className="w-full sm:w-auto">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Please wait
    </Button>
  ) : (
    <Button type="submit" className="w-full sm:w-auto">
      Join waitlist
    </Button>
  );
}

export default function NewsletterForm({ className }: { className?: string }) {
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  return (
    <CardContent className={cn("w-full max-w-md", className)}>
      <form
        action={async (formData) => {
          setFeedback({ type: null, message: "" });

          try {
            const result = await subscribeAction(formData);
            setFeedback({
              type: result.success ? "success" : "error",
              message: result.message,
            });
          } catch (error) {
            setFeedback({
              type: "error",
              message: "Something went wrong. Please try again later.",
            });
          }
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
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
              aria-describedby="feedback-message"
            />
          </div>

          <SubmitButton />
        </div>

        {feedback.message && (
          <div
            id="feedback-message"
            className={cn(
              "text-sm flex items-center gap-2",
              feedback.type === "success" ? "text-green-600" : "text-red-600",
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {feedback.message}
          </div>
        )}
      </form>
    </CardContent>
  );
}
