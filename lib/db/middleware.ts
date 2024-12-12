import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const publicRoutes = [
    "/",
    "/forgot-password",
    "/sign-in",
    "/sign-up",
    "/terms-of-service",
    "/privacy-policy",
    "/onboarding",
    "/recovery",
  ];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  const isApiRoute =
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/swagger") ||
    request.nextUrl.pathname.startsWith("/callback");

  if (isApiRoute) {
    return response;
  }

  if (user) {
    // Check MFA status
    const { data: factorData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    const { data: factors } = await supabase.auth.mfa.listFactors();

    const hasMFA = (factors?.all?.length ?? 0) > 0;
    const isMFAVerified = factorData?.currentLevel === factorData?.nextLevel;
    const needsMFAVerification = hasMFA && !isMFAVerified;

    // Check if this is a recovery flow
    const isAuthFlow =
      request.nextUrl.pathname === "/recovery" ||
      request.nextUrl.pathname === "/onboarding";

    if (isPublicRoute && !needsMFAVerification && !isAuthFlow) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else if (!isPublicRoute && userError) {
    // No user session, redirect to sign in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
};
