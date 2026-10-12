// Keep-alive do Supabase, chamado 1x/dia pelo Vercel Cron (ver "crons" em vercel.json).
// No plano Free o Supabase pausa o projeto após ~7 dias sem atividade; quando isso
// acontece o domínio *.supabase.co some do DNS e o site perde conteúdo publicado,
// imagens e login do painel. Uma leitura simples na API REST conta como atividade.
// Só lê dados que já são públicos (published_content) com a anon key.

export async function GET() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return Response.json({ ok: false, error: "VITE_SUPABASE_URL/ANON_KEY ausentes" }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/published_content?select=section_key&limit=1`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    return Response.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 502 });
  }
}
