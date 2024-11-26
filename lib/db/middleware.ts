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

  const { error } = await supabase.auth.getUser();
  const publicRoutes = [
    "/",
    "/forgot-password",
    "/sign-in",
    "/sign-up",
    "/terms-of-service",
    "/privacy-policy",
  ];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
  const isApiRoute =
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/swagger") ||
    request.nextUrl.pathname.startsWith("/callback");

  if (isApiRoute) {
    return response;
  } else if (isPublicRoute && !error) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (!isPublicRoute && error) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
};
