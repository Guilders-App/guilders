"use client";

import { Button } from "@/apps/web/components/ui/button";
import { Input } from "@/apps/web/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/apps/web/components/ui/input-otp";
import { Label } from "@/apps/web/components/ui/label";
import { createClient } from "@/apps/web/lib/db/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function RecoveryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [needsMFA, setNeedsMFA] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Check if user has MFA enabled
      const { data: factors } = await supabase.auth.mfa.listFactors();

      if (factors?.all && factors.all.length > 0) {
        setPendingPassword(data.password);
        setNeedsMFA(true);
        // Get the first TOTP factor
        const totpFactor = factors.all.find(
          (factor) => factor.factor_type === "totp"
        );
        if (totpFactor?.id) {
          setFactorId(totpFactor.id);
        }
      } else {
        // No MFA, update password directly
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (error) throw error;

        toast.success("Password updated successfully");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Failed to update password", {
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
      const supabase = createClient();

      const { data, error } = await supabase.auth.mfa.challenge({ factorId });
      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code: verifyCode,
      });

      if (verifyError) throw verifyError;

      if (!pendingPassword) throw new Error("No password found");

      const { error: updateError } = await supabase.auth.updateUser({
        password: pendingPassword,
      });

      if (updateError) throw updateError;

      setPendingPassword(null);

      toast.success("Password updated successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to verify code", {
        description: "Please check the code and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
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

          {!needsMFA ? (
            <>
              <h1 className="text-2xl font-bold text-center">Reset Password</h1>
              <p className="text-muted-foreground text-center">
                Please enter your new password
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4 mt-4"
              >
                <div className="grid gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your new password"
                      disabled={isLoading}
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center">Verify 2FA</h1>
              <p className="text-muted-foreground text-center">
                Enter your two-factor authentication code
              </p>

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
                    "Verify & Continue"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
