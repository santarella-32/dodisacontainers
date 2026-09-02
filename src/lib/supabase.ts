let supabaseInstance: any = null;

// Eagerly start loading in background — removes @supabase/supabase-js from the critical path
// while still making the client available within ~100ms after page load
const clientReady = (async () => {
  const url = import.meta.env.VITE_SUPABASE_URL || "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    supabaseInstance = createClient(url, anonKey);
    return supabaseInstance;
  } catch {
    return null;
  }
})();

export function getSupabase() {
  return supabaseInstance;
}

// Awaits the same background init as getSupabase(), instead of racing it. Needed
// by anything that runs unconditionally on first mount (like AppContext's initial
// "load latest published content" fetch) — a plain getSupabase() call there can
// fire before the ~100ms async client creation above finishes, silently returning
// null and skipping the fetch for that page load with no retry, so fresh visitors
// intermittently see stale/default content instead of what was actually published.
export function getSupabaseAsync() {
  return clientReady;
}
