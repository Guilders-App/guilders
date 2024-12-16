"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/apps/web/components/ui/dialog";
import { useDialog } from "@/apps/web/lib/hooks/useDialog";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function ProviderDialog() {
  const { isOpen, data, close } = useDialog("provider");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const successToast = {
    title: "Success",
    description: data
      ? `You have successfully ${
          data.operation === "connect" ? "connected" : "fixed the connection"
        } to the institution!`
      : "",
  };

  const errorToast = {
    title: "Error",
    description: data
      ? `There was an error ${
          data.operation === "connect" ? "connecting" : "fixing the connection"
        } to the institution.`
      : "",
  };

  useEffect(() => {
    const handleMessageEvent = (e: MessageEvent) => {
      // Ignore messages from localhost
      if (e.origin === "http://localhost:3000") return;

      if (e.origin === "https://app.snaptrade.com") {
        if (e.data) {
          const data = e.data;
          if (data.status === "SUCCESS") {
            close();
            toast.success(successToast.title, {
              description: successToast.description,
            });
          }
          if (data.status === "ERROR") {
            toast.error(errorToast.title, {
              description: errorToast.description,
            });
            close();
          }
          if (
            data === "CLOSED" ||
            data === "CLOSE_MODAL" ||
            data === "ABANDONED"
          ) {
            close();
          }
        }
      } else if (e.origin === "https://www.saltedge.com") {
        if (e.data === "cancel") {
          close();
        } else {
          const { data: messageData } = JSON.parse(e.data);
          if (!messageData) return;

          if (messageData.stage === "success") {
            close();
            toast.success(successToast.title, {
              description: successToast.description,
            });
          } else if (messageData.stage === "error") {
            toast.error(errorToast.title, {
              description: errorToast.description,
            });
            close();
          }
        }
      }
    };

    window.addEventListener("message", handleMessageEvent, false);
    return () =>
      window.removeEventListener("message", handleMessageEvent, false);
  }, [close, toast, successToast, errorToast]);

  if (!isOpen || !data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={close}>
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
          src={data.redirectUri}
          className="w-full h-full border-none rounded-lg"
          allow="clipboard-read *; clipboard-write *"
        />
      </DialogContent>
    </Dialog>
  );
}
