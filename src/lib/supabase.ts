import { createClient } from "@supabase/supabase-js";

let supabaseInstance: any = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !anonKey) {
    // Graceful fallback to local persistence
    return null;
  }

  try {
    supabaseInstance = createClient(url, anonKey);
    return supabaseInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}
