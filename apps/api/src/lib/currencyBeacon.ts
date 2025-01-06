import type { Bindings } from "@/common/variables";
import { z } from "zod";

const BASE_URL = "https://api.currencybeacon.com/v1";

// Response schemas
const rateResponseSchema = z.object({
  base: z.string(),
  date: z.string(),
  rates: z.record(z.number()),
});

const currencyResponseSchema = z.array(
  z.object({
    name: z.string(),
    countries: z.array(z.string()),
  }),
);

const convertResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  result: z.number(),
  date: z.string(),
});

type RateResponse = z.infer<typeof rateResponseSchema>;
type CurrencyResponse = z.infer<typeof currencyResponseSchema>;
type ConvertResponse = z.infer<typeof convertResponseSchema>;

export class CurrencyBeaconClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(
    endpoint: string,
    params: Record<string, string> = {},
  ) {
    const queryParams = new URLSearchParams({
      ...params,
      api_key: this.apiKey,
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    const data = await response.json();
    return data.response as T;
  }

  async getLatestRates(base: string, symbols?: string[]) {
    const params: Record<string, string> = { base };
    if (symbols?.length) {
      params.symbols = symbols.join(",");
    }

    return this.fetch<RateResponse>("/latest", params);
  }

  async getHistoricalRates(base: string, date: string, symbols?: string[]) {
    const params: Record<string, string> = { base, date };
    if (symbols?.length) {
      params.symbols = symbols.join(",");
    }

    return this.fetch<RateResponse>("/historical", params);
  }

  async getTimeseries(
    base: string,
    startDate: string,
    endDate: string,
    symbols?: string[],
  ) {
    const params: Record<string, string> = {
      base,
      start_date: startDate,
      end_date: endDate,
    };
    if (symbols?.length) {
      params.symbols = symbols.join(",");
    }

    return this.fetch<Record<string, RateResponse>>("/timeseries", params);
  }

  async getCurrencies(type: "fiat" | "crypto") {
    return this.fetch<CurrencyResponse>("/currencies", { type });
  }

  async convert(from: string, to: string, amount: number) {
    const params = {
      from,
      to,
      amount: amount.toString(),
    };

    return this.fetch<ConvertResponse>("/convert", params);
  }
}

export const getCurrencyBeacon = (env: Bindings) =>
  new CurrencyBeaconClient(env.CURRENCY_BEACON_API_KEY);
