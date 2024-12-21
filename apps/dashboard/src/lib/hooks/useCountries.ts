import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "../api";

const queryKey = ["countries"] as const;

export function useCountries() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const api = await getApiClient();
      const { data, error } = await (await api.countries.$get()).json();
      if (error) throw new Error(error);
      return data;
    },
  });
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
  return useQuery({
    queryKey: [...queryKey, code],
    queryFn: async () => {
      const api = await getApiClient();
      const { data, error } = await (
        await api.countries[":code"].$get({
          param: { code },
        })
      ).json();

      if (error) throw new Error(error);
      return data;
    },
  });
}
