import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// For Server Components and Route Handlers — uses Clerk JWT for RLS
export async function createClerkSupabaseClient() {
  const { getToken } = await auth();
  let supabaseAccessToken: string | null = null;
  try {
    supabaseAccessToken = await getToken({ template: "supabase" });
  } catch {
    // Template not yet available or session stale — proceed without auth token
  }

  const headers: Record<string, string> = {};
  if (supabaseAccessToken) {
    headers.Authorization = `Bearer ${supabaseAccessToken}`;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers },
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async () => {},
      },
    }
  );
}

// Service role client — bypasses RLS, admin/server-only use
export function createServiceClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
