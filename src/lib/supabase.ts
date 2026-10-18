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

// Translates Supabase write errors into something the admin can act on. Since
// supabase/security_hardening_2026_09.sql, writes need a live session for a user
// listed in cms_admins; otherwise Supabase only says "new row violates row-level
// security policy", which doesn't tell anyone what to do about it.
export function describeSupabaseError(err: any): string {
  const msg = String(err?.message ?? err ?? "");
  if (/jwt|refresh token/i.test(msg)) {
    return "Sua sessão expirou. Saia e entre de novo no painel.";
  }
  if (
    /row-level security|permission denied|unauthorized/i.test(msg) ||
    err?.code === "42501" ||
    String(err?.statusCode ?? err?.status) === "403"
  ) {
    return "Sem permissão para salvar. Saia e entre de novo no painel; se continuar, este usuário não está cadastrado como admin (tabela cms_admins no Supabase).";
  }
  return msg || "erro desconhecido";
}
