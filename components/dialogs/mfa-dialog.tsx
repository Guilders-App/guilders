"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { createClient } from "@/lib/db/client";
import { useDialog } from "@/lib/hooks/useDialog";
import { useSecurityStore } from "@/lib/store/securityStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function MFADialog() {
  const { isOpen, close } = useDialog("mfa");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const checkMFAStatus = useSecurityStore((state) => state.checkMFAStatus);

  useEffect(() => {
    if (isOpen) {
      handleSetup();
    }
  }, [isOpen]);

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (error) {
      console.error("Error setting up MFA:", error);
      toast.error("Failed to setup MFA", {
        description: "There was an error setting up MFA. Please try again.",
      });
      close();
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

      await checkMFAStatus();

      toast.success("2FA Enabled", {
        description: "Two-factor authentication has been successfully enabled.",
      });
      handleClose();
    } catch (error) {
      toast.error("Failed to verify code", {
        description: "Please check the code and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    close();
    setVerifyCode("");
    setFactorId(null);
    setQrCode(null);
    setSecret(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account by enabling 2FA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && !qrCode ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  1. Install an authenticator app like Google Authenticator or
                  Authy
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Scan this QR code with your authenticator app
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <img
                      src={qrCode.trim()}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
                {secret && (
                  <p className="text-sm text-muted-foreground">
                    Or enter this code manually:{" "}
                    <code className="bg-muted p-1 rounded">{secret}</code>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  3. Enter the 6-digit code from your authenticator app
                </p>
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
                    "Verify & Enable 2FA"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
