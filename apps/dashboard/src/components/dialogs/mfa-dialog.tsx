"use client";

import { Badge } from "@/apps/web/components/ui/badge";
import { Button } from "@/apps/web/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/apps/web/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/apps/web/components/ui/input-otp";
import { createClient } from "@/apps/web/lib/db/client";
import { useDialog } from "@/apps/web/lib/hooks/useDialog";
import { useSecurityStore } from "@/apps/web/lib/store/securityStore";
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Setup Authenticator App</DialogTitle>
          <DialogDescription>
            Each time you sign in, in addition to your password, you'll use an
            authenticator app to generate a one-time code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Step 1</Badge>
              <h3 className="font-medium">Scan QR Code</h3>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Scan the QR code below or manually enter the secret into your
                authenticator app.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-secondary/50 p-4 rounded-lg">
                <div className="flex justify-center w-[200px] h-[200px] shrink-0">
                  {qrCode ? (
                    <img
                      src={qrCode.trim()}
                      alt="QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-[200px] h-[200px] bg-muted rounded-lg" />
                  )}
                </div>
                {secret && (
                  <div className="flex-1 h-[200px] flex flex-col justify-between py-2 space-y-1">
                    <div className="space-y-0">
                      <p className="text-md font-medium">Can't scan QR code?</p>
                      <p className="text-sm text-muted-foreground">
                        Enter this secret instead:
                      </p>
                    </div>
                    <div className="space-y-2">
                      <code className="block bg-muted p-2 rounded break-all">
                        {secret}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        Copy Code
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Step 2</Badge>
              <h3 className="font-medium">Enter Verification Code</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
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
      </DialogContent>
    </Dialog>
  );
}
