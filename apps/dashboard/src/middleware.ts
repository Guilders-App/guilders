import { updateSession } from "@guilders/database/middleware";
import { createClient } from "@guilders/database/server";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/sign-up") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  // Not authenticated
  if (!user && !authPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);

    return NextResponse.redirect(url);
  }

  const { data: mfaData } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  // Enrolled for mfa but not verified
  if (
    mfaData &&
    mfaData.nextLevel === "aal2" &&
    mfaData.nextLevel !== mfaData.currentLevel &&
    !authPage
  ) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
