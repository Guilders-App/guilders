import type { Country } from "@guilders/database/types";
import { useApiQuery } from "./useApiQuery";

const queryKey = ["countries"] as const;

export function useCountries() {
  return useApiQuery<Country[]>(queryKey, (api) => api.countries);
}

export function useCountriesMap() {
  const { data } = useCountries();
  return data?.reduce(
    (acc, country) => {
      acc[country.code] = country.name;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export function useCountry(code: string) {
  return useApiQuery<Country>([...queryKey, code], (api) => ({
    $get: () => api.countries[":code"].$get({ param: { code } }),
  }));
}
