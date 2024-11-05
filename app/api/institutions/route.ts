import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("institution").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.dir(data, { maxArrayLength: 10 });

  return NextResponse.json({ data });
}
