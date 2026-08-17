let supabaseInstance: any = null;

// Eagerly start loading in background — removes @supabase/supabase-js from the critical path
// while still making the client available within ~100ms after page load
;(async () => {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    supabaseInstance = createClient(url, anonKey);
  } catch {
    // ignore
  }
})();

export function getSupabase() {
  return supabaseInstance;
}
