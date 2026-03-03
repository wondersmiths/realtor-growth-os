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

  // Check for Supabase auth cookie directly — no Supabase client needed.
  // Match both single cookies (sb-xxx-auth-token) and chunked cookies
  // (sb-xxx-auth-token.0, sb-xxx-auth-token.1, etc.)
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (cookie) =>
      cookie.name.startsWith("sb-") &&
      (cookie.name.endsWith("-auth-token") ||
        /\-auth-token\.\d+$/.test(cookie.name)) &&
      cookie.value.length > 0
  );

  if (!hasAuthCookie) {
    // Debug: include cookie names in redirect so we can see what middleware received
    const cookieNames = allCookies.map((c) => c.name).join(",");
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("reason", "no-cookie");
    url.searchParams.set("from", pathname);
    url.searchParams.set("cookies", cookieNames || "none");
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next({ request });
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
