import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

type CookiesToSet = { name: string; value: string; options: CookieOptions }[];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function getCookieClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: CookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies; a refreshed token is
          // persisted by the browser client instead.
        }
      },
    },
  });
}

/**
 * Supabase client for the OAuth callback route: reads the incoming request's
 * cookies (including the PKCE code verifier) and writes the resulting session
 * cookies onto `response`, which must be the response the route returns.
 */
export function createCallbackClient(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: CookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

/**
 * Verifies the caller's Supabase session (Authorization: Bearer header or
 * auth cookies) against the Supabase Auth server and returns the user.
 * Returns null for anonymous/invalid callers. API routes must derive the
 * user id from this — never from query params, body, or custom headers.
 */
export async function getAuthUser(request: Request): Promise<User | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const bearer = getBearerToken(request);
  if (bearer) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(bearer);
    return error ? null : data.user;
  }

  const client = await getCookieClient();
  if (!client) {
    return null;
  }
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}

/**
 * Returns the verified user together with a Supabase client bound to their
 * JWT, so PostgREST queries run under the caller's identity and RLS policies
 * apply. Returns null when the caller has no valid session.
 */
export async function getUserScopedClient(
  request: Request,
): Promise<{ user: User; supabase: SupabaseClient } | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const bearer = getBearerToken(request);
  if (bearer) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${bearer}` } },
    });
    const { data, error } = await client.auth.getUser(bearer);
    if (error || !data.user) {
      return null;
    }
    return { user: data.user, supabase: client };
  }

  const client = await getCookieClient();
  if (!client) {
    return null;
  }
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return { user: data.user, supabase: client };
}

/** Standard 401 payload for unauthenticated API calls. */
export const UNAUTHORIZED = {
  error: "Authentication required",
} as const;
