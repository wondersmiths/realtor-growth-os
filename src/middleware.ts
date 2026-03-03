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

  if (isPublicRoute(pathname)) {
    const response = NextResponse.next({ request });
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Read-only Supabase client — the middleware only checks auth, it does NOT
  // write Set-Cookie headers. This avoids a known issue where the
  // onAuthStateChange → applyServerStorage → setAll pipeline in @supabase/ssr
  // can emit Set-Cookie headers that corrupt the session cookie on Vercel Edge.
  // Token refresh is handled by API routes / server components instead.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Intentionally empty — middleware should not modify cookies.
        },
      },
    }
  );

  // Use getSession() instead of getUser() — reads directly from the cookie
  // without making a network call to Supabase. This is faster, more reliable,
  // and avoids network timeouts on Vercel Edge. API routes still use getUser()
  // for full JWT validation.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = session
    ? NextResponse.next({ request })
    : NextResponse.redirect(new URL("/auth/login", request.url));

  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
