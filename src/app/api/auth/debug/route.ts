import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  // 1. Raw Cookie header
  const rawCookieHeader = request.headers.get("cookie") || "";

  // 2. Parse cookies manually from raw header
  const manualParsed: Record<string, string> = {};
  rawCookieHeader.split(";").forEach((pair) => {
    const eqIdx = pair.indexOf("=");
    if (eqIdx > 0) {
      const name = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();
      manualParsed[name] = value;
    }
  });

  // 3. Next.js parsed cookies
  const nextjsParsed = request.cookies.getAll().map((c) => ({
    name: c.name,
    valueLength: c.value.length,
    valueStart: c.value.substring(0, 30),
  }));

  // 4. Try Supabase auth
  let authResult: { user: string | null; error: string | null } = {
    user: null,
    error: null,
  };
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // no-op for debug
          },
        },
      }
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    authResult = {
      user: user?.id ?? null,
      error: error?.message ?? null,
    };
  } catch (e) {
    authResult.error = String(e);
  }

  // 5. Summarize sb- cookies from raw header
  const sbCookiesRaw = Object.entries(manualParsed)
    .filter(([name]) => name.startsWith("sb-"))
    .map(([name, value]) => ({
      name,
      valueLength: value.length,
      valueStart: value.substring(0, 40),
    }));

  return NextResponse.json({
    rawCookieHeaderLength: rawCookieHeader.length,
    sbCookiesFromRawHeader: sbCookiesRaw,
    nextjsParsedCookies: nextjsParsed,
    auth: authResult,
    env: {
      supabaseUrlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKeySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });
}
