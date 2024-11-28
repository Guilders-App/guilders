import { VezgoCallbackBody } from "./types";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body: VezgoCallbackBody = await request.json();

  console.log(body);
  console.log(request.body);
  console.log(request.headers);

  return NextResponse.json({ message: "Hello, World!" });
}
