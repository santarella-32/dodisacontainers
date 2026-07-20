import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, Search, Filter, Copy, Trash2, Check, X, Image, FolderOpen,
  Grid3X3, LayoutGrid, Square, AlertCircle, Loader2, RefreshCw, Download,
  ExternalLink, Tag, ChevronLeft, ChevronRight, ZoomIn, Plus
} from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";

const CATEGORIES = ["Geral", "Containers", "Projetos", "Depoimentos", "Fachada", "Pátio", "Logística", "Equipe"];
const PAGE_SIZE = 48;

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
  const [lightbox, setLightbox] = useState<GalleryFile | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Geral");
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // ── Load images ──────────────────────────────────────────────
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
        // Fallback: use mediaLibrary from context
        setFiles(
          mediaLibrary
            .filter((m) => m.type === "image")
            .map((m) => ({
              id: m.id,
              name: m.name,
              url: m.url,
              category: m.category || "Geral",
            }))
        );
      }
    } catch {
      // Use context fallback on error
      setFiles(
        mediaLibrary
          .filter((m) => m.type === "image")
          .map((m) => ({ id: m.id, name: m.name, url: m.url, category: m.category || "Geral" }))
      );
    } finally {
      setLoading(false);
    }
  }, [supabase, mediaLibrary]);

  useEffect(() => {
    loadImages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload ────────────────────────────────────────────────────
  const processFiles = useCallback(
    async (selectedFiles: File[]) => {
      const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      const jobs: UploadJob[] = imageFiles.map((f) => ({
        id: `job-${Date.now()}-${Math.random()}`,
        file: f,
        status: "pending",
        progress: 0,
      }));

      setUploadJobs(jobs);
      setShowUpload(true);

      const results: GalleryFile[] = [];

      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];
        setUploadJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: "uploading", progress: 10 } : j)));

        try {
          const ext = job.file.name.split(".").pop() || "jpg";
          const safeName = job.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const uniqueName = `${Date.now()}_${safeName}`;
          const path = `gallery/${uploadCategory}/${uniqueName}`;

          if (supabase) {
            const { error } = await supabase.storage
              .from("site-assets")
              .upload(path, job.file, { cacheControl: "3600", upsert: false });

            setUploadJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, progress: 70 } : j)));

            if (error) throw error;

            const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(path);
            const url = pub?.publicUrl || "";

            results.push({
              id: `sb-${uploadCategory}-${uniqueName}`,
              name: uniqueName,
              url,
              category: uploadCategory,
              size: job.file.size,
              uploadedAt: new Date().toISOString(),
              path,
            });

            setUploadJobs((prev) =>
              prev.map((j) => (j.id === job.id ? { ...j, status: "done", progress: 100, url } : j))
            );
          } else {
            // Fallback: read as data URL and add to mediaLibrary
            const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(job.file);
            });
            addMediaItem({ url: dataUrl, name: job.file.name, type: "image", category: uploadCategory });
            results.push({
              id: `local-${Date.now()}`,
              name: job.file.name,
              url: dataUrl,
              category: uploadCategory,
              size: job.file.size,
            });
            setUploadJobs((prev) =>
              prev.map((j) => (j.id === job.id ? { ...j, status: "done", progress: 100, url: dataUrl } : j))
            );
          }
        } catch (err: any) {
          setUploadJobs((prev) =>
            prev.map((j) => (j.id === job.id ? { ...j, status: "error", error: err.message } : j))
          );
        }
      }

      if (results.length > 0) {
        setFiles((prev) => [...results, ...prev]);
        triggerNotification(`${results.length} imagem(ns) enviada(s) com sucesso!`);
      }
    },
    [supabase, uploadCategory, addMediaItem, triggerNotification]
  );

  // ── Drag & Drop ───────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      processFiles(dropped);
    },
    [processFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (file: GalleryFile) => {
    if (!confirm(`Excluir "${file.name}"?`)) return;
    try {
      if (supabase && file.path) {
        await supabase.storage.from("site-assets").remove([file.path]);
      } else {
        deleteMediaItem(file.id);
      }
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      triggerNotification("Imagem excluída.");
    } catch {
      triggerNotification("Erro ao excluir imagem.");
    }
  };

  // ── Copy URL ──────────────────────────────────────────────────
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

  // Reset page when filter changes
  useEffect(() => setPage(1), [search, categoryFilter]);

  const gridCols = {
    sm: "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10",
    md: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6",
    lg: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
  }[gridSize];

  const thumbHeight = { sm: "h-20", md: "h-36", lg: "h-52" }[gridSize];

  const doneCount = uploadJobs.filter((j) => j.status === "done").length;
  const errorCount = uploadJobs.filter((j) => j.status === "error").length;
  const totalJobs = uploadJobs.length;
  const allDone = uploadJobs.length > 0 && uploadJobs.every((j) => j.status === "done" || j.status === "error");

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-lg font-black uppercase tracking-tight">Galeria de Imagens</h2>
          <p className="text-stone-400 text-xs mt-0.5">
            {files.length} imagem(ns) · {supabase ? "Supabase Storage" : "Armazenamento Local"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadImages}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white border border-white/5 cursor-pointer"
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD400] hover:bg-[#FF9A00] text-[#07090D] font-black text-xs uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Enviar Imagens
          </button>
        </div>
      </div>

      {/* ── Upload Panel ── */}
      {showUpload && (
        <div className="bg-[#171A21] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-black uppercase tracking-widest">Upload de Imagens</span>
            <button onClick={() => { setShowUpload(false); setUploadJobs([]); }} className="text-stone-500 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category selector */}
          <div>
            <label className="text-stone-400 text-xs font-bold uppercase block mb-2">Categoria das imagens</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setUploadCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-colors ${
                    uploadCategory === cat
                      ? "bg-[#FFD400] border-[#FFD400] text-[#07090D]"
                      : "bg-white/5 border-white/5 text-stone-400 hover:text-white"
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
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[#FFD400] bg-[#FFD400]/5"
                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            }`}
          >
            <Upload className="w-8 h-8 text-stone-500 mx-auto mb-3" />
            <p className="text-white text-sm font-bold">Arraste as imagens aqui ou clique para selecionar</p>
            <p className="text-stone-500 text-xs mt-1">JPG, PNG, WEBP — múltiplos arquivos ao mesmo tempo</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => processFiles(Array.from(e.target.files || []))}
            />
          </div>

          {/* Upload Progress */}
          {uploadJobs.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-bold">
                  {allDone ? `Concluído: ${doneCount}/${totalJobs}` : `Enviando: ${doneCount}/${totalJobs}`}
                  {errorCount > 0 && <span className="text-red-400 ml-2">· {errorCount} erro(s)</span>}
                </span>
                {allDone && (
                  <button onClick={() => setUploadJobs([])} className="text-stone-500 hover:text-white cursor-pointer">
                    Limpar
                  </button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {uploadJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 bg-[#0F1115] rounded-lg p-2.5 text-xs">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      {job.status === "done" && job.url ? (
                        <img src={job.url} alt="" className="w-full h-full object-cover" />
                      ) : job.status === "error" ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-stone-500 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-300 truncate font-medium">{job.file.name}</p>
                      <div className="w-full bg-stone-800 rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            job.status === "error" ? "bg-red-400" : "bg-[#FFD400]"
                          }`}
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase flex-shrink-0 ${
                      job.status === "done" ? "text-green-400" :
                      job.status === "error" ? "text-red-400" :
                      "text-stone-500"
                    }`}>
                      {job.status === "done" ? <Check className="w-3.5 h-3.5" /> :
                       job.status === "error" ? "Erro" :
                       job.status === "uploading" ? `${job.progress}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filters & Search ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#171A21] border border-white/5 rounded-lg text-white text-xs placeholder-stone-600 outline-none focus:border-[#FFD400]/30"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid Size */}
        <div className="flex gap-1 bg-[#171A21] border border-white/5 rounded-lg p-1 flex-shrink-0">
          {(["sm", "md", "lg"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setGridSize(size)}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                gridSize === size ? "bg-[#FFD400] text-[#07090D]" : "text-stone-500 hover:text-white"
              }`}
              title={size === "sm" ? "Mini" : size === "md" ? "Médio" : "Grande"}
            >
              {size === "sm" ? <Grid3X3 className="w-3.5 h-3.5" /> :
               size === "md" ? <LayoutGrid className="w-3.5 h-3.5" /> :
               <Square className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {["Todas", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-colors ${
              categoryFilter === cat
                ? "bg-[#FFD400]/10 border-[#FFD400]/30 text-[#FFD400]"
                : "bg-white/3 border-white/5 text-stone-500 hover:text-stone-300"
            }`}
          >
            {cat}
            {cat !== "Todas" && (
              <span className="ml-1 opacity-60">
                {files.filter((f) => f.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          {filtered.length} imagem(ns)
          {search && ` para "${search}"`}
          {categoryFilter !== "Todas" && ` em ${categoryFilter}`}
        </span>
        {totalPages > 1 && (
          <span>Página {safePage} de {totalPages}</span>
        )}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <span className="text-xs">Carregando galeria...</span>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-500 border border-white/5 rounded-2xl">
          <Image className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-bold">Nenhuma imagem encontrada</p>
          <p className="text-xs mt-1">
            {search || categoryFilter !== "Todas" ? "Tente ajustar os filtros" : "Envie imagens usando o botão acima"}
          </p>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-3`}>
          {paginated.map((file) => (
            <div
              key={file.id}
              className="group relative bg-[#0F1115] border border-white/5 hover:border-[#FFD400]/20 rounded-xl overflow-hidden transition-all"
            >
              {/* Thumbnail */}
              <div
                className={`relative ${thumbHeight} bg-stone-900 overflow-hidden cursor-pointer`}
                onClick={() => setLightbox(file)}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Zoom hint */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
                {/* Category badge */}
                {gridSize !== "sm" && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 rounded text-[8px] font-bold text-[#FFD400] uppercase">
                    {file.category}
                  </div>
                )}
              </div>

              {/* Footer */}
              {gridSize !== "sm" && (
                <div className="p-2.5">
                  <p className="text-stone-300 text-[10px] font-bold truncate leading-none mb-2" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(file)}
                      className="flex-1 py-1.5 bg-[#FFD400]/10 hover:bg-[#FFD400] text-[#FFD400] hover:text-[#07090D] text-[9px] font-black uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all border border-[#FFD400]/20"
                    >
                      {copiedId === file.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === file.id ? "Copiado" : "URL"}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="py-1.5 px-2 bg-white/5 hover:bg-red-500/10 text-stone-500 hover:text-red-400 rounded-lg cursor-pointer transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mini mode: actions on hover */}
              {gridSize === "sm" && (
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(file); }}
                    className="w-full py-1 bg-[#FFD400] text-[#07090D] text-[8px] font-black uppercase rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedId === file.id ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    {copiedId === file.id ? "OK" : "URL"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                    className="w-full py-1 bg-red-500/20 text-red-400 text-[8px] font-black uppercase rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-stone-400 font-mono px-4">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-stone-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-[#0F1115] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{lightbox.name}</p>
                <p className="text-stone-500 text-[10px]">{lightbox.category}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCopy(lightbox)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD400] text-[#07090D] text-[10px] font-black uppercase rounded-lg cursor-pointer"
                >
                  {copiedId === lightbox.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedId === lightbox.id ? "Copiado!" : "Copiar URL"}
                </button>
                <a
                  href={lightbox.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg cursor-pointer flex items-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setLightbox(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center bg-[#07090D] max-h-[75vh] overflow-hidden">
              <img
                src={lightbox.url}
                alt={lightbox.name}
                className="max-w-full max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
