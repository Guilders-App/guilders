import { useMutation } from "@tanstack/react-query";

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/newsletter`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error("Failed to subscribe to newsletter");
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error.message || "Failed to subscribe to newsletter"
        );
      }
      return data;
    },
  });
}
