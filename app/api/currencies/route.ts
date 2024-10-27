import { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

type CurrencyResponse = Omit<Tables<"currency">, "id">;

export async function GET(_: Request) {
  try {
    const supabase = await createClient();

    const { data: currencies, error } = await supabase
      .from("currency")
      .select("code, name, country");

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { success: false, error: "Error fetching currencies" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      currencies: currencies as CurrencyResponse[],
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return Response.json(
      { success: false, error: "Error fetching currencies" },
      { status: 500 }
    );
  }
}
