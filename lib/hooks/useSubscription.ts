import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSubscription() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create subscription");
      }

      const { url } = await response.json();
      return url;
    },
    onError: (error) => {
      toast.error("Failed to process subscription", {
        description: error.message || "Please try again later.",
      });
    },
  });
}

export function usePortalSession() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create portal session");
      }

      const { url } = await response.json();
      return url;
    },
    onError: (error) => {
      toast.error("Failed to open customer portal", {
        description: error.message || "Please try again later.",
      });
    },
  });
}
