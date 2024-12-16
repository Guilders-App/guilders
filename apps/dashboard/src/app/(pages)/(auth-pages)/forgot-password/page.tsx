import { forgotPasswordAction } from "@/apps/web/app/actions";
import {
  FormMessage,
  Message,
} from "@/apps/web/components/common/form-message";
import { SubmitButton } from "@/apps/web/components/common/submit-button";
import { Input } from "@/apps/web/components/ui/input";
import { Label } from "@/apps/web/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-md bg-background px-6 py-6 shadow">
        <div className="flex flex-col items-center mb-4">
          <Image
            src="/assets/logo/logo_filled_rounded.svg"
            alt="logo"
            width={64}
            height={64}
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-muted-foreground text-center">
          Enter your email to receive a reset link
        </p>

        <form className="flex flex-col gap-4 mt-4">
          <div className="grid gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="john@doe.com"
                required
              />
            </div>

            <SubmitButton
              className="mt-2 w-full"
              pendingText="Sending reset link..."
              formAction={forgotPasswordAction}
            >
              Send Reset Link
            </SubmitButton>
          </div>

          <FormMessage message={searchParams} />

          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>Remember your password?</p>
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
