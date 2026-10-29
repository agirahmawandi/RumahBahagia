import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  if (!url || !key || !url.startsWith("http") || url.includes("your-project-ref")) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, key, {
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
    });

    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }

    const pathname = request.nextUrl.pathname;
    const isAuthRoute =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password");
    const isPublicRoute =
      pathname === "/" || isAuthRoute || pathname.startsWith("/auth");

    if (!user && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", pathname);

      const res = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        res.cookies.set(cookie.name, cookie.value, cookie);
      });
      return res;
    }

    if (user && isAuthRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";

      const res = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        res.cookies.set(cookie.name, cookie.value, cookie);
      });
      return res;
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Middleware updateSession caught error:", error);
    return NextResponse.next({ request });
  }
}
