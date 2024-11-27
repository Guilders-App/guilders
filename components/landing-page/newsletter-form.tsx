import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function NewsletterForm({ className }: { className?: string }) {
  const {
    mutate: subscribe,
    isLoading,
    error,
    data,
  } = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    subscribe(email);
  };
  return (
    <CardContent className={cn("w-full max-w-md", className)}>
      <form
        onSubmit={handleSubmit}
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
        {isLoading ? (
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
      <p className="h-5 mt-2 text-sm text-muted-foreground text-center">
        {error ? error.message : data?.message}
      </p>
    </CardContent>
  );
}
