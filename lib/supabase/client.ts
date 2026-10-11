"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key-here";

  return createBrowserClient(url, key);
}
