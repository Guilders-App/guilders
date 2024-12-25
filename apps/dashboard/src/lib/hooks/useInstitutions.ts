import type { Institution } from "@guilders/database/types";
import { useAccounts } from "./useAccounts";
import { useApiQuery } from "./useApiQuery";
import { useInstitutionConnection } from "./useInstitutionConnection";

const queryKey = ["institutions"] as const;

export function useInstitutions() {
  return useApiQuery<Institution[]>(queryKey, (api) => api.institutions);
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
