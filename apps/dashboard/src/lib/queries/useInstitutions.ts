import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAccounts } from "./useAccounts";
import { useInstitutionConnection } from "./useInstitutionConnection";

const queryKey = ["institutions"] as const;

export function useInstitutions() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const api = await getApiClient();
      const response = await api.institutions.$get();
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
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
    account?.institution_connection_id ?? 0,
  );

  return useInstitutionById(institutionConnection?.institution_id);
}
