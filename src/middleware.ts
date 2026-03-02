import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = [
  "/auth",
  "/rsvp",
  "/sign-in",
  "/api/events/*/rsvp",
  "/api/open-house/*/sign-in",
];

function isPublicRoute(pathname: string): boolean {
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return true;
  }

  return publicRoutes.some((route) => {
    if (route.includes("*")) {
      const regex = new RegExp("^" + route.replace(/\*/g, "[^/]+") + "$");
      return regex.test(pathname);
    }
    return pathname.startsWith(route);
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check entirely for public routes — avoids cookie conflicts
  // with routes that set their own auth cookies (e.g. /api/auth/login)
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next({ request });
    response.headers.set("x-pathname", pathname);
    return response;
  }

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

  // Refresh the session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const sbCookies = request.cookies.getAll().filter((c) => c.name.startsWith("sb-"));
  console.log(`[MW] ${pathname} | user: ${user?.id ?? "null"} | error: ${userError?.message ?? "none"} | sb-cookies: ${sbCookies.map((c) => `${c.name}(${c.value.length}chars)`).join(", ") || "none"}`);

  // Inject x-pathname header for layout to conditionally render nav
  supabaseResponse.headers.set("x-pathname", pathname);

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    const redirectResponse = NextResponse.redirect(url);
    // Propagate any cookies set during getUser() (e.g. cleared expired tokens)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
