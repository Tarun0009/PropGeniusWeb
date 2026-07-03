import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  PROTECTED_HOME,
  buildLoginRedirect,
  getSafeRedirectPath,
  isAuthEntryRoute,
  isPublicRoute,
} from "@/features/auth/config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (user && isAuthEntryRoute(pathname)) {
    const redirectPath = getSafeRedirectPath(
      request.nextUrl.searchParams.get("next"),
      PROTECTED_HOME
    );
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(
      new URL(buildLoginRedirect(pathname, search), request.url)
    );
  }

  return supabaseResponse;
}