import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/common/form-message";
import { SubmitButton } from "@/components/common/submit-button";
import { env } from "@/env";
import { Input } from "@guilders/ui/input";
import { Label } from "@guilders/ui/label";
import { PasswordInput } from "@guilders/ui/password-input";
import Image from "next/image";
import Link from "next/link";

export default async function Signup(props: {
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

        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        <p className="text-muted-foreground text-center">
          Sign up to get started
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

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                name="password"
                placeholder="********"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <SubmitButton
              className="mt-2 w-full"
              pendingText="Creating account..."
              formAction={signUpAction}
              disabled={env.NODE_ENV !== "development"}
            >
              Create account
            </SubmitButton>
          </div>

          <FormMessage message={searchParams} />

          <p className="text-xs text-muted-foreground text-center">
            By continuing to sign up, you agree to our
            <br />
            <Link
              href="/terms-of-service"
              className="font-medium text-primary hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-primary hover:underline"
            >
              Privacy Policy
            </Link>
          </p>

          <div className="flex justify-center gap-1 text-xs text-muted-foreground">
            <p>Already have an account?</p>
            <Link
              href="/login"
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
