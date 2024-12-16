"use client";

import { signInAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/common/form-message";
import { SubmitButton } from "@/components/common/submit-button";
import { createClient } from "@guilders/database/client";
import { Button } from "@guilders/ui/button";
import { Input } from "@guilders/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@guilders/ui/input-otp";
import { Label } from "@guilders/ui/label";
import { PasswordInput } from "@guilders/ui/password-input";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const supabase = createClient();

  const message: Message = {
    message: searchParams.has("message")
      ? (searchParams.get("message") ?? "")
      : "",
    error: searchParams.has("error") ? (searchParams.get("error") ?? "") : "",
    success: searchParams.has("success")
      ? (searchParams.get("success") ?? "")
      : "",
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      const result = await signInAction(formData);

      if (result?.error) {
        if (result.message === "mfa_required" && result.factorId) {
          setFactorId(result.factorId);
        } else {
          toast.error("Failed to sign in", {
            description: result.message,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to sign in", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factorId || verifyCode.length !== 6) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.mfa.challenge({ factorId });
      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to verify code", {
        description: "Please check the code and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {factorId ? "Enter verification code" : "Please sign in to continue"}
        </p>

        {!factorId ? (
          <form className="flex flex-col gap-4 mt-4" action={handleSubmit}>
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

              <SubmitButton className="mt-2 w-full" pendingText="Signing In...">
                Sign in
              </SubmitButton>
            </div>

            <FormMessage message={message} />

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
        ) : (
          <div className="flex flex-col gap-6 mt-4">
            <div className="flex justify-center items-center">
              <InputOTP
                value={verifyCode}
                onChange={setVerifyCode}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || verifyCode.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Sign In"
              )}
            </Button>

            <FormMessage message={message} />

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setFactorId(null)}
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-sm">
      <div className="rounded-md bg-background px-6 py-6 shadow animate-pulse">
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
        </div>
        <div className="h-8 bg-muted rounded mb-2" />
        <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-4" />
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
