import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, Search, Copy, Trash2, Check, X, Image,
  Grid3X3, LayoutGrid, Square, AlertCircle, Loader2, RefreshCw,
  ExternalLink, ChevronLeft, ChevronRight, ZoomIn
} from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";

const CATEGORIES = ["Geral", "Containers", "Projetos", "Depoimentos", "Fachada", "Pátio", "Logística", "Equipe"];
const PAGE_SIZE = 40;

interface GalleryFile {
  id: string;
  name: string;
  url: string;
  category: string;
  size?: number;
  uploadedAt?: string;
  path?: string;
}

interface UploadJob {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  url?: string;
  error?: string;
}

interface Props {
  triggerNotification: (msg: string) => void;
}

export default function GaleriaImagens({ triggerNotification }: Props) {
  const supabase = getSupabase();
  const { mediaLibrary, addMediaItem, deleteMediaItem } = useAppContext();

  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [gridSize, setGridSize] = useState<"sm" | "md" | "lg">("md");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Geral");
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  // ── Load ─────────────────────────────────────────────────────
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      if (supabase) {
        const allFiles: GalleryFile[] = [];
        for (const cat of CATEGORIES) {
          const { data, error } = await supabase.storage
            .from("site-assets")
            .list(`gallery/${cat}`, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
          if (!error && data) {
            for (const f of data) {
              if (f.name === ".emptyFolderPlaceholder") continue;
              const path = `gallery/${cat}/${f.name}`;
              const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
              allFiles.push({
                id: `sb-${cat}-${f.name}`,
                name: f.name,
                url: pub?.publicUrl || "",
                category: cat,
                size: f.metadata?.size,
                uploadedAt: f.created_at,
                path,
              });
            }
          }
        }
        setFiles(allFiles);
      } else {
        setFiles(
          mediaLibrary
            .filter((m) => m.type === "image")
            .map((m) => ({ id: m.id, name: m.name, url: m.url, category: m.category || "Geral" }))
        );
      }
    } catch {
      setFiles(
        mediaLibrary
          .filter((m) => m.type === "image")
          .map((m) => ({ id: m.id, name: m.name, url: m.url, category: m.category || "Geral" }))
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, mediaLibrary]);

  useEffect(() => { loadImages(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload ────────────────────────────────────────────────────
  const processFiles = useCallback(async (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    // Sem Supabase: limite 10 arquivos e 2MB cada para não explodir localStorage
    if (!supabase) {
      const tooBig = imageFiles.filter((f) => f.size > 2 * 1024 * 1024);
      if (tooBig.length > 0) {
        triggerNotification(`${tooBig.length} arquivo(s) ignorado(s) — sem Supabase o limite é 2MB por imagem.`);
      }
      const safe = imageFiles.filter((f) => f.size <= 2 * 1024 * 1024).slice(0, 10);
      if (!safe.length) return;
      if (imageFiles.length > 10) triggerNotification("Modo local: máximo 10 imagens por vez. Conecte o Supabase para envios em lote.");
      imageFiles.splice(0, imageFiles.length, ...safe);
    }

    // Avisa sobre batches muito grandes com Supabase
    const BATCH_LIMIT = 100;
    const batch = imageFiles.slice(0, BATCH_LIMIT);
    if (imageFiles.length > BATCH_LIMIT) {
      triggerNotification(`Enviando primeiras ${BATCH_LIMIT} de ${imageFiles.length} imagens. Repita para o restante.`);
    }

    const jobs: UploadJob[] = batch.map((f) => ({
      id: `job-${Date.now()}-${Math.random()}`,
      file: f, status: "pending", progress: 0,
    }));

    if (!isMountedRef.current) return;
    setUploadJobs(jobs);
    setShowUpload(true);
    const results: GalleryFile[] = [];

    for (const job of jobs) {
      if (!isMountedRef.current) break;
      setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "uploading", progress: 20 } : j));
      try {
        const safeName = job.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueName = `${Date.now()}_${safeName}`;
        const path = `gallery/${uploadCategory}/${uniqueName}`;

        if (supabase) {
          const { error } = await supabase.storage.from("site-assets").upload(path, job.file, { cacheControl: "3600", upsert: false });
          if (!isMountedRef.current) break;
          if (error) throw error;
          setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, progress: 80 } : j));
          const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
          const url = pub?.publicUrl || "";
          results.push({ id: `sb-${uploadCategory}-${uniqueName}`, name: uniqueName, url, category: uploadCategory, size: job.file.size, path });
          if (isMountedRef.current)
            setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "done", progress: 100, url } : j));
        } else {
          const dataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = () => rej(new Error("Falha ao ler arquivo"));
            r.readAsDataURL(job.file);
          });
          try {
            addMediaItem({ url: dataUrl, name: job.file.name, type: "image", category: uploadCategory });
          } catch {
            throw new Error("Armazenamento local cheio — conecte o Supabase para continuar.");
          }
          results.push({ id: `local-${Date.now()}`, name: job.file.name, url: dataUrl, category: uploadCategory, size: job.file.size });
          if (isMountedRef.current)
            setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "done", progress: 100, url: dataUrl } : j));
        }
      } catch (err: any) {
        if (isMountedRef.current)
          setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "error", error: err?.message || "Erro desconhecido" } : j));
      }
    }

    if (!isMountedRef.current) return;
    if (results.length > 0) {
      setFiles((prev) => [...results, ...prev]);
      triggerNotification(`${results.length} imagem(ns) enviada(s) com sucesso!`);
    }
  }, [supabase, uploadCategory, addMediaItem, triggerNotification]);

  // ── Drag ─────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (file: GalleryFile) => {
    if (!confirm(`Excluir "${file.name}"?`)) return;
    try {
      if (supabase && file.path) await supabase.storage.from("site-assets").remove([file.path]);
      else deleteMediaItem(file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      triggerNotification("Imagem excluída.");
    } catch { triggerNotification("Erro ao excluir."); }
  };

  // ── Copy ─────────────────────────────────────────────────────
  const handleCopy = (file: GalleryFile) => {
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    triggerNotification("URL copiada!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Filter & Pagination ───────────────────────────────────────
  const filtered = files.filter((f) => {
    const matchCat = categoryFilter === "Todas" || f.category === categoryFilter;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  useEffect(() => setPage(1), [search, categoryFilter]);

  // ── Lightbox navigation ───────────────────────────────────────
  const lightboxFile = lightboxIdx !== null ? paginated[lightboxIdx] : null;
  const lightboxPrev = () => setLightboxIdx((i) => i !== null && i > 0 ? i - 1 : i);
  const lightboxNext = () => setLightboxIdx((i) => i !== null && i < paginated.length - 1 ? i + 1 : i);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, paginated.length]);

  // ── Grid config ───────────────────────────────────────────────
  const gridConfig = {
    sm: { cols: "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6", thumb: "h-28 sm:h-32" },
    md: { cols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4", thumb: "h-44 sm:h-48" },
    lg: { cols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3", thumb: "h-56 sm:h-64" },
  }[gridSize];

  const doneCount = uploadJobs.filter((j) => j.status === "done").length;
  const errorCount = uploadJobs.filter((j) => j.status === "error").length;
  const allDone = uploadJobs.length > 0 && uploadJobs.every((j) => j.status === "done" || j.status === "error");

  const fmtSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-white text-lg font-black uppercase tracking-tight">Galeria de Imagens</h2>
          <p className="text-stone-500 text-xs mt-0.5 whitespace-nowrap">
            {files.length} arquivo(s) · {supabase ? "Supabase Storage" : "Local"}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={loadImages}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border border-white/5 cursor-pointer transition-colors"
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#FFD400] hover:bg-[#FF9A00] text-[#07090D] font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-colors shadow-lg shadow-[#FFD400]/10"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar Imagens</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* ── Upload Panel ── */}
      {showUpload && (
        <div className="bg-[#171A21] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-black uppercase tracking-widest">Enviar Imagens</span>
            <button onClick={() => { setShowUpload(false); setUploadJobs([]); }} className="text-stone-500 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category */}
          <div>
            <label className="text-stone-400 text-[10px] font-bold uppercase block mb-2">Salvar na categoria</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setUploadCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase cursor-pointer border transition-colors ${
                    uploadCategory === cat ? "bg-[#FFD400] border-[#FFD400] text-[#07090D]" : "bg-white/5 border-white/5 text-stone-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl py-12 px-6 text-center cursor-pointer transition-all ${
              isDragging ? "border-[#FFD400] bg-[#FFD400]/5" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            }`}
          >
            <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? "text-[#FFD400]" : "text-stone-600"}`} />
            <p className="text-white text-sm font-bold mb-1">Arraste aqui ou clique para selecionar</p>
            <p className="text-stone-500 text-xs">JPG · PNG · WEBP · GIF — múltiplos arquivos</p>
            <input
              ref={fileInputRef} type="file" accept="image/*" multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => processFiles(Array.from(e.target.files || []))}
            />
          </div>

          {/* Progress */}
          {uploadJobs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>
                  {allDone ? "Concluído" : "Enviando"}: {doneCount}/{uploadJobs.length}
                  {errorCount > 0 && <span className="text-red-400 ml-2">· {errorCount} erro(s)</span>}
                </span>
                {allDone && <button onClick={() => setUploadJobs([])} className="text-stone-500 hover:text-white cursor-pointer">Limpar</button>}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {uploadJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 bg-[#0F1115] rounded-lg p-2.5">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      {job.status === "done" && job.url
                        ? <img src={job.url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            {job.status === "error" ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Loader2 className="w-4 h-4 text-stone-500 animate-spin" />}
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-300 truncate text-xs font-medium">{job.file.name}</p>
                      <div className="w-full bg-stone-800 rounded-full h-1 mt-1.5">
                        <div className={`h-1 rounded-full transition-all duration-500 ${job.status === "error" ? "bg-red-400" : "bg-[#FFD400]"}`}
                          style={{ width: `${job.progress}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold flex-shrink-0">
                      {job.status === "done" ? <Check className="w-4 h-4 text-green-400" /> :
                       job.status === "error" ? <span className="text-red-400">Erro</span> :
                       <span className="text-stone-500">{job.progress}%</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Search + Grid toggle ── */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome de arquivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-[#171A21] border border-white/5 rounded-xl text-white text-xs placeholder-stone-600 outline-none focus:border-[#FFD400]/40 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-[#171A21] border border-white/5 rounded-xl p-1 flex-shrink-0">
          {(["sm", "md", "lg"] as const).map((size) => (
            <button key={size} onClick={() => setGridSize(size)}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${gridSize === size ? "bg-[#FFD400] text-[#07090D]" : "text-stone-500 hover:text-white"}`}
              title={size === "sm" ? "Compacto" : size === "md" ? "Médio" : "Grande"}
            >
              {size === "sm" ? <Grid3X3 className="w-4 h-4" /> : size === "md" ? <LayoutGrid className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category tabs — horizontal scroll ── */}
      <div className="relative">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {["Todas", ...CATEGORIES].map((cat) => {
            const count = cat === "Todas" ? files.length : files.filter((f) => f.category === cat).length;
            return (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                  categoryFilter === cat
                    ? "bg-[#FFD400]/10 border-[#FFD400]/40 text-[#FFD400]"
                    : "bg-[#171A21] border-white/5 text-stone-500 hover:text-stone-300 hover:border-white/10"
                }`}
              >
                {cat}
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                  categoryFilter === cat ? "bg-[#FFD400]/20 text-[#FFD400]" : "bg-white/5 text-stone-600"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
        <span>{filtered.length} imagem(ns){search ? ` para "${search}"` : ""}{categoryFilter !== "Todas" ? ` em ${categoryFilter}` : ""}</span>
        {totalPages > 1 && <span>Pág. {safePage}/{totalPages}</span>}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#FFD400]" />
          <span className="text-xs">Carregando galeria...</span>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-stone-500 border-2 border-dashed border-white/5 rounded-2xl">
          <Image className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-bold text-stone-400">Nenhuma imagem encontrada</p>
          <p className="text-xs mt-1">{search || categoryFilter !== "Todas" ? "Ajuste os filtros" : "Clique em 'Enviar Imagens' para começar"}</p>
        </div>
      ) : (
        <div className={`grid ${gridConfig.cols} gap-3`}>
          {paginated.map((file, idx) => (
            <div key={file.id}
              className="group relative bg-[#0F1115] border border-white/5 hover:border-[#FFD400]/25 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/30"
            >
              {/* Thumbnail */}
              <div
                className={`relative ${gridConfig.thumb} bg-stone-900 overflow-hidden cursor-zoom-in`}
                onClick={() => setLightboxIdx(idx)}
              >
                <img
                  src={file.url} alt={file.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
                {/* Category badge */}
                <div className={`absolute top-2 left-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-sm rounded-md text-[8px] font-bold text-[#FFD400] uppercase tracking-wider transition-opacity ${gridSize === "sm" ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
                  {file.category}
                </div>
                {/* Size */}
                {file.size && gridSize === "lg" && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[9px] text-stone-400 font-mono">
                    {fmtSize(file.size)}
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className={`${gridSize === "sm" ? "p-1.5" : "p-3"}`}>
                {gridSize !== "sm" && (
                  <p className="text-stone-400 text-[10px] truncate leading-none mb-2.5 font-mono" title={file.name}>
                    {file.name}
                  </p>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleCopy(file)}
                    className={`flex-1 flex items-center justify-center gap-1 font-black uppercase rounded-lg cursor-pointer transition-all border ${
                      copiedId === file.id
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-[#FFD400]/8 hover:bg-[#FFD400] border-[#FFD400]/20 text-[#FFD400] hover:text-[#07090D]"
                    } ${gridSize === "sm" ? "py-1 text-[8px]" : "py-1.5 text-[9px]"}`}
                  >
                    {copiedId === file.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {gridSize !== "sm" && (copiedId === file.id ? "Copiado" : "URL")}
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className={`flex items-center justify-center bg-white/5 hover:bg-red-500/15 text-stone-600 hover:text-red-400 rounded-lg cursor-pointer transition-all ${
                      gridSize === "sm" ? "py-1 px-1.5" : "py-1.5 px-2"
                    }`}
                    title="Excluir"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Anterior
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = safePage <= 3 ? i + 1 : safePage - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    p === safePage ? "bg-[#FFD400] text-[#07090D]" : "bg-white/5 text-stone-400 hover:text-white"
                  }`}
                >{p}</button>
              );
            })}
          </div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold transition-colors"
          >
            Próxima <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxFile && (
        <div
          className="fixed inset-0 z-[9999] bg-black/97 backdrop-blur-md flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Prev */}
          {lightboxIdx! > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              className="absolute left-3 sm:left-6 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image container */}
          <div
            className="relative w-full max-w-5xl mx-4 sm:mx-8 bg-[#0B0F14] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
            style={{ maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-bold truncate font-mono">{lightboxFile.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[#FFD400] text-[10px] font-bold uppercase">{lightboxFile.category}</span>
                  {lightboxFile.size && <span className="text-stone-500 text-[10px]">· {fmtSize(lightboxFile.size)}</span>}
                  <span className="text-stone-600 text-[10px]">· {lightboxIdx! + 1}/{paginated.length}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-3">
                <button
                  onClick={() => handleCopy(lightboxFile)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                    copiedId === lightboxFile.id ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-[#FFD400] text-[#07090D]"
                  }`}
                >
                  {copiedId === lightboxFile.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedId === lightboxFile.id ? "Copiado!" : "Copiar URL"}</span>
                </button>
                <a href={lightboxFile.url} target="_blank" rel="noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg flex items-center cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => setLightboxIdx(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center bg-[#07090D] overflow-hidden flex-1" style={{ minHeight: 0 }}>
              <img
                src={lightboxFile.url}
                alt={lightboxFile.name}
                className="max-w-full object-contain"
                style={{ maxHeight: "calc(92vh - 64px)" }}
              />
            </div>
          </div>

          {/* Next */}
          {lightboxIdx! < paginated.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              className="absolute right-3 sm:right-6 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white cursor-pointer transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Keyboard hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-stone-600 text-[10px] font-mono">
            <span>← → navegar</span>
            <span>ESC fechar</span>
          </div>
        </div>
      )}

    </div>
  );
}
