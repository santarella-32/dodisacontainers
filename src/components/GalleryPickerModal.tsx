import React, { useState, useEffect, useCallback } from "react";
import { X, Search, Loader2, ImageOff, Check } from "lucide-react";
import { getSupabase } from "../lib/supabase";

const DEFAULT_FOLDERS = ["Geral", "Containers", "Projetos", "Depoimentos", "Fachada", "Pátio", "Logística", "Equipe"];
const FOLDERS_KEY = "dodisa_gallery_folders";

interface GalleryFile {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function GalleryPickerModal({ onSelect, onClose }: Props) {
  const supabase = getSupabase();
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");

  const folders = (() => {
    try {
      const s = localStorage.getItem(FOLDERS_KEY);
      return s ? (JSON.parse(s) as string[]) : DEFAULT_FOLDERS;
    } catch {
      return DEFAULT_FOLDERS;
    }
  })();

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const allFiles: GalleryFile[] = [];
    for (const cat of folders) {
      const { data, error } = await supabase.storage
        .from("site-assets")
        .list(`gallery/${cat}`, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
      if (!error && data) {
        for (const f of data) {
          if (f.name === ".emptyFolderPlaceholder") continue;
          const path = `gallery/${cat}/${f.name}`;
          const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
          if (pub?.publicUrl) {
            allFiles.push({ id: `${cat}-${f.name}`, name: f.name, url: pub.publicUrl, category: cat });
          }
        }
      }
    }
    setFiles(allFiles);
    setLoading(false);
    // folders/localStorage read once on open, no need to re-run on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const visible = files.filter((f) => {
    if (categoryFilter !== "Todas" && f.category !== categoryFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#0B0F14] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0 gap-4">
          <h2 className="text-white font-black text-sm uppercase tracking-widest whitespace-nowrap">Escolher da Galeria</h2>
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full bg-[#0F1115] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white text-xs outline-none focus:border-[#FFD400]/50"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0F1115] border border-white/10 rounded-lg px-2.5 py-2 text-white text-xs outline-none focus:border-[#FFD400]/50"
          >
            <option value="Todas">Todas as pastas</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-500">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-mono">Carregando galeria...</span>
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-600">
              <ImageOff size={28} />
              <span className="text-xs font-mono">
                {files.length === 0 ? "Nenhuma imagem na galeria ainda." : "Nada encontrado com esse filtro."}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visible.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { onSelect(f.url); onClose(); }}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#FFD400] transition-colors cursor-pointer bg-stone-900"
                >
                  <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <Check size={22} className="text-[#FFD400] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-[9px] text-white/80 truncate font-mono">{f.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
