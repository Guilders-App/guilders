"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toast, useToast } from "@/hooks/useToast";
import { useEffect, useRef } from "react";

interface ProviderDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  redirectUri: string;
  operation: "connect" | "reconnect";
}

type SaltEdgeCallback = {
  data: {
    connection_id: string;
    stage: "fetching" | "success" | "error";
    secret: string;
    custom_fields: Record<string, string>;
    api_stage: string;
  };
};

export function ProviderDialog({
  isOpen,
  setIsOpen,
  redirectUri,
  operation,
}: ProviderDialogProps) {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const successToast: Toast = {
    title: "Success",
    description: `You have successfully ${
      operation === "connect" ? "connected" : "fixed the connection"
    } to the institution!`,
  };
  const errorToast: Toast = {
    title: "Error",
    description: `There was an error ${
      operation === "connect" ? "connecting" : "fixing the connection"
    } to the institution.`,
  };

  useEffect(() => {
    const handleMessageEvent = (e: MessageEvent) => {
      // Ignore messages from localhost
      if (e.origin === "http://localhost:3000") return;

      if (e.origin === "https://app.snaptrade.com") {
        if (e.data) {
          const data = e.data;
          if (data.status === "SUCCESS") {
            setIsOpen(false);
            toast(successToast);
          }
          if (data.status === "ERROR") {
            toast(errorToast);
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
      } else if (e.origin === "https://www.saltedge.com") {
        const { data }: SaltEdgeCallback = JSON.parse(e.data);
        if (data.stage === "success") {
          setIsOpen(false);
          toast(successToast);
        } else if (data.stage === "error") {
          toast(errorToast);
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
        <DialogDescription className="hidden">
          Provider Connection Dialog
        </DialogDescription>
        <iframe
          ref={iframeRef}
          src={redirectUri}
          className="w-full h-full border-none rounded-lg"
          // Required for
          // - Vezgo - copy function in WalletConnect in Widget Mode
          allow="clipboard-read *; clipboard-write *"
          // Test security feature
          credentialless="true"
        />
      </DialogContent>
    </Dialog>
  );
}
