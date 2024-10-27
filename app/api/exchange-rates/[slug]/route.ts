import { NextResponse } from "next/server";

type SynthExchangeRateResponse = {
  data: {
    date: string;
    time: string;
    source: string;
    rates: Record<string, number>;
  };
};

export type ExchangeRateResponse = SynthExchangeRateResponse["data"];

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const response = await fetch(
      `https://api.synthfinance.com/rates/live?to=${encodeURIComponent(slug.toUpperCase())}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SYNTH_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = (await response.json()) as SynthExchangeRateResponse;
    console.log("Exchange rate data:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching exchange rate" },
      { status: 500 }
    );
  }
}
