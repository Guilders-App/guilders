import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/common/form-message";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import Image from "next/image";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
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

        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-muted-foreground text-center">
          Please sign in to continue
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-xs text-muted-foreground hover:text-foreground leading-[14px]"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <PasswordInput
                name="password"
                placeholder="********"
                required
                autoComplete="current-password"
              />
            </div>

            <SubmitButton
              className="mt-2 w-full"
              pendingText="Signing In..."
              formAction={signInAction}
            >
              Sign in
            </SubmitButton>
          </div>

          <FormMessage message={searchParams} />

          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>Don't have an account?</p>
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
