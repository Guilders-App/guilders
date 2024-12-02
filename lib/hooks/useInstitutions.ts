import { Institution } from "@/lib/db/types";
import { useQuery } from "@tanstack/react-query";
import { useAccounts } from "./useAccounts";
import { useInstitutionConnection } from "./useInstitutionConnection";

const queryKey = ["institutions"] as const;

export function useInstitutions() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/institutions");
      if (!response.ok) throw new Error("Failed to fetch institutions");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch institutions");
      }
      return data.data as Institution[];
    },
  });
}

export function useInstitutionById(institutionId: number | undefined) {
  const { data: institutions } = useInstitutions();
  return institutions?.find((i) => i.id === institutionId);
}

export function useInstitutionByAccountId(accountId: number | undefined) {
  const { data: accounts } = useAccounts();
  const account = accounts?.find((a) => a.id === accountId);
  const { data: institutionConnection } = useInstitutionConnection(
    account?.institution_connection_id
  );

  return useInstitutionById(institutionConnection?.institution_id);
}
