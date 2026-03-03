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
  // This avoids all @supabase/ssr initialization issues on Vercel Edge.
  // The middleware only gates access; real JWT validation happens in API routes.
  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") &&
        cookie.name.endsWith("-auth-token") &&
        cookie.value.length > 0
    );

  const response = hasAuthCookie
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
