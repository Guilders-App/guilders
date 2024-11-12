import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("SaltEdge callback received");
  const body = await request.json();
  console.log("Headers:");
  console.log(request.headers);
  console.log("Body:");
  console.log(body);
  return NextResponse.json({ message: "Hello, World!" });
}
