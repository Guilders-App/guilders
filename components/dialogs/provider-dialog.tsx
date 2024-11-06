"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useEffect, useRef } from "react";

interface ProviderDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  redirectUri: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ProviderDialog({
  isOpen,
  setIsOpen,
  redirectUri,
}: ProviderDialogProps) {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessageEvent = (e: MessageEvent) => {
      if (e.data) {
        const data = e.data;
        if (data.status === "SUCCESS") {
          const authorizationId = data.authorizationId;
          console.log("Authorization ID:", authorizationId);
          // Create connected account
          setIsOpen(false);
          toast({
            title: "Success",
            description: "You have successfully connected to the institution!",
          });
        }
        if (data.status === "ERROR") {
          toast({
            title: "Error",
            description: "There was an error connecting to the institution.",
          });
          setIsOpen(false);
        }
        if (
          data === "CLOSED" ||
          data === "CLOSE_MODAL" ||
          data === "ABANDONED"
        ) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("message", handleMessageEvent, false);

    return () => {
      window.removeEventListener("message", handleMessageEvent, false);
    };
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="hidden">Provider Dialog</DialogTitle>
      <DialogContent
        showCloseIcon={false}
        className="sm:max-w-[600px] h-[80vh] p-0"
      >
        <iframe
          ref={iframeRef}
          src={redirectUri}
          className="w-full h-full border-none rounded-lg"
          allowFullScreen
        />
      </DialogContent>
    </Dialog>
  );
}
