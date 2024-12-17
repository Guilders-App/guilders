"use server";

import { resend } from "../utils/resend";

type SubscribeResult = {
  success: boolean;
  message: string;
};

export async function subscribeAction(
  formData: FormData,
): Promise<SubscribeResult> {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid email address",
    };
  }

  try {
    await resend.contacts.create({
      email,
      audienceId: process.env.RESEND_WAITLIST_AUDIENCE_ID,
    });

    return {
      success: true,
      message: "Thanks for joining! We'll keep you updated.",
    };
  } catch (error) {
    // Check if it's a duplicate email error from Resend
    if (error instanceof Error && error.message.includes("already exists")) {
      return {
        success: false,
        message: "You're already on the waitlist!",
      };
    }

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
