import { resend } from "@/lib/resend";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({
      success: false,
      error: { message: "Email is required" },
    });
  }

  console.log(email);

  const { error } = await resend.contacts.create({
    email,
    audienceId: process.env.RESEND_WAITLIST_AUDIENCE_ID,
  });

  if (error) {
    console.log("error", error);
    return NextResponse.json({ success: false, error: error });
  }

  return NextResponse.json({
    success: true,
    message: "You've been added to the waitlist.",
  });
}
