import { NextResponse } from "next/server";

// TODO: Use the Synth API, but it currently doesn't support batch requests,
// so we need to fallback to the hacky free api. Only updates once a day.
export async function GET() {
  const primaryUrl =
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json";
  const fallbackUrl =
    "https://latest.currency-api.pages.dev/v1/currencies/eur.json";

  try {
    let data;
    let fallbackUrlUsed = false;
    try {
      data = await fetchAllRates(primaryUrl);
    } catch (error) {
      console.warn("Primary URL failed, trying fallback URL");
      data = await fetchAllRates(fallbackUrl);
      fallbackUrlUsed = true;
    }

    // Check if the date is today (sometimes the API is outdated)
    const today = new Date().toISOString().split("T")[0];
    if (data.date !== today && !fallbackUrlUsed) {
      data = await fetchAllRates(fallbackUrl);
    }

    return NextResponse.json({
      success: true,
      date: data.date,
      rates: data.eur,
    });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching exchange rates" },
      { status: 500 }
    );
  }
}

async function fetchAllRates(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
