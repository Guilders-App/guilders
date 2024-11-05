import { useMutation } from "@tanstack/react-query";

export function useCreateConnection(providerName: string) {
  return useMutation({
    mutationFn: async (institutionId: string) => {
      const response = await fetch(`/api/connections/connect/${providerName}`, {
        method: "POST",
        body: JSON.stringify({ institution_id: institutionId }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || `Failed to create a ${providerName} connection`
        );
      }
      return data;
    },
  });
}
