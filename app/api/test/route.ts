import { saltedge } from "@/lib/providers/saltedge/client";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
  const customers = await saltedge.getCustomers();
  return NextResponse.json(customers);
}
