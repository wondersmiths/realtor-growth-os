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

  // Skip auth check entirely for public routes
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next({ request });
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Collect cookies set by the Supabase client (may arrive asynchronously
  // via onAuthStateChange → applyServerStorage → setAll)
  let pendingCookies: Array<{
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies so subsequent reads see updated values
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Store cookies to apply to the response later
          pendingCookies = cookiesToSet;
        },
      },
    }
  );

  // Validate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The onAuthStateChange callback in @supabase/ssr is async but NOT awaited
  // by the auth client. Flushing microtasks ensures applyServerStorage (and
  // our setAll callback) has completed before we build the response.
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Build the final response
  let response: NextResponse;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next({ request });
  }

  // Apply any cookies that were set during getUser() / token refresh
  pendingCookies.forEach(({ name, value, options }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.cookies.set(name, value, options as Record<string, any>);
  });

  // Inject x-pathname header for layout to conditionally render nav
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
