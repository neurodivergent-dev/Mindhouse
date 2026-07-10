import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createCallbackClient } from "@/lib/supabase/server";

// Force this route to be dynamic
export const dynamic = "force-dynamic";

/**
 * `next` arrives from the query string, so it must not be able to send the
 * user to another origin. Only same-origin absolute paths are accepted.
 */
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "";
  }
  return next === "/" ? "" : next;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  const failureRedirect = (reason: string) =>
    NextResponse.redirect(`${origin}/${locale}/login?error=${reason}`);

  // The provider can bounce back with an error instead of a code.
  if (searchParams.get("error")) {
    return failureRedirect("oauth_denied");
  }

  if (!code) {
    return failureRedirect("missing_code");
  }

  // The session cookies are written onto this exact response, so it has to be
  // the object we hand back to the browser.
  const response = NextResponse.redirect(`${origin}/${locale}${next}`);

  const supabase = createCallbackClient(request, response);
  if (!supabase) {
    return failureRedirect("config");
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return failureRedirect("exchange_failed");
  }

  return response;
}
