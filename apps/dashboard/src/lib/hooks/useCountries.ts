import type { Tables } from "@guilders/database/types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["countries"] as const;

type CountryData = {
  countries: Tables<"country">[];
  countriesMap: Map<string, string>; // code -> name mapping
};

export function useCountries() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/countries");
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch countries");
      }
      const countries = data.countries as Tables<"country">[];

      // Create a Map for O(1) lookups
      const countriesMap = new Map(
        countries.map((country) => [country.code, country.name]),
      );

      return {
        countries,
        countriesMap,
      } as CountryData;
    },
  });
}
