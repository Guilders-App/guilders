"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useDialog } from "@/lib/hooks/useDialog";
import { useUpdateUserSettings } from "@/lib/hooks/useUser";
import { useSecurityStore } from "@/lib/store/securityStore";
import { Button } from "@guilders/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@guilders/ui/form";
import { Input } from "@guilders/ui/input";
import { Shield, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const securityFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SecurityFormValues = z.infer<typeof securityFormSchema>;

export function SecurityForm() {
  const { hasMFA, isLoadingMFA, checkMFAStatus, unenrollMFA } =
    useSecurityStore();
  const { open: openMFADialog, isOpen } = useDialog("mfa");
  const { mutateAsync: updateUserSettings } = useUpdateUserSettings();

  useEffect(() => {
    checkMFAStatus();
  }, [checkMFAStatus, isOpen]);

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: SecurityFormValues) {
    try {
      await updateUserSettings({
        password: data.newPassword,
      });

      form.reset({
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password updated", {
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password", {
        description: "Please try again.",
      });
    }
  }

  const handleUnenroll = async () => {
    try {
      await unenrollMFA();
      toast.success("2FA Removed", {
        description: "Two-factor authentication has been removed.",
      });
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast.error("Failed to disable 2FA", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security to your account by requiring both a
          password and authentication code.
        </p>

        <div className="flex items-center gap-4 h-10">
          <Button
            variant={hasMFA ? "outline" : "default"}
            className="w-full sm:w-auto"
            onClick={() => !hasMFA && openMFADialog()}
            disabled={isLoadingMFA || hasMFA}
          >
            <Shield className="mr-2 h-4 w-4" />
            {isLoadingMFA
              ? "Loading..."
              : hasMFA
                ? "2FA is Enabled"
                : "Enable 2FA"}
          </Button>

          {hasMFA && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleUnenroll}
              className="shrink-0"
              disabled={isLoadingMFA}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters and contain at least
                    one uppercase letter, one lowercase letter, and one number.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormDescription>
                    Please confirm your new password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={
                !form.formState.isDirty ||
                form.formState.isSubmitting ||
                !form.formState.isValid
              }
            >
              {form.formState.isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
