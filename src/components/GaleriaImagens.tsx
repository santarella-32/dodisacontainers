import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload, Search, Copy, Trash2, Check, X, Image,
  Grid3X3, LayoutGrid, Square, AlertCircle, Loader2, RefreshCw,
  ExternalLink, ChevronLeft, ChevronRight, ZoomIn,
  FolderPlus, Folder, CheckSquare, Move, MousePointer,
  Pencil, Download, Tag, ArrowUpDown, ArrowUp, ArrowDown
} from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { useAppContext } from "../context/AppContext";

const DEFAULT_FOLDERS = ["Geral", "Containers", "Projetos", "Depoimentos", "Fachada", "Pátio", "Logística", "Equipe", "Configurador"];
const CATEGORIES = DEFAULT_FOLDERS; // alias for upload compatibility
const FOLDERS_KEY = "dodisa_gallery_folders";
const PAGE_SIZE = 40;
const UPLOAD_CONCURRENCY = 8;

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
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadDoneCount, setUploadDoneCount] = useState(0);
  // Selection mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  // Folders
  const [folders, setFolders] = useState<string[]>(() => {
    try { const s = localStorage.getItem(FOLDERS_KEY); return s ? JSON.parse(s) : DEFAULT_FOLDERS; }
    catch { return DEFAULT_FOLDERS; }
  });
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  // Drag to move
  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  // Bulk move dropdown
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  // Sorting
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  // Rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Lightbox dimensions
  const [lightboxDims, setLightboxDims] = useState<{ w: number; h: number } | null>(null);
  // Tags
  const TAGS_KEY = "dodisa_gallery_tags";
  const [tags, setTags] = useState<Record<string, string[]>>(() => {
    try { const s = localStorage.getItem(TAGS_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  // WebP compression
  const [compressWebP, setCompressWebP] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  // Persist folders to localStorage
  useEffect(() => {
    try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)); } catch { /* ignore */ }
  }, [folders]);

  // ── Load ─────────────────────────────────────────────────────
  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      if (supabase) {
        // Discover folders that exist in Storage (created from any device) and merge them
        // into what's cached locally — collections live in the shared bucket, not just
        // this browser's localStorage, so a folder made on another device shows up here too.
        let activeFolders = folders;
        try {
          const { data: topLevel } = await supabase.storage.from("site-assets").list("gallery", { limit: 1000 });
          const remoteFolders = (topLevel || []).filter((entry) => entry.id === null).map((entry) => entry.name);
          const merged = Array.from(new Set([...DEFAULT_FOLDERS, ...folders, ...remoteFolders]));
          if (merged.length !== folders.length || merged.some((f) => !folders.includes(f))) {
            activeFolders = merged;
            setFolders(merged);
          }
        } catch {
          // Storage listing failed — fall back to whatever folders are cached locally
        }

        const allFiles: GalleryFile[] = [];
        for (const cat of activeFolders) {
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
  }, [supabase, mediaLibrary, folders]);

  useEffect(() => { loadImages(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload ────────────────────────────────────────────────────
  const processFiles = useCallback(async (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    // Modo local sem Supabase: limita tamanho e quantidade
    if (!supabase) {
      const tooBig = imageFiles.filter((f) => f.size > 2 * 1024 * 1024);
      if (tooBig.length > 0)
        triggerNotification(`${tooBig.length} arquivo(s) ignorado(s) — sem Supabase o limite é 2MB por imagem.`);
      const safe = imageFiles.filter((f) => f.size <= 2 * 1024 * 1024).slice(0, 10);
      if (!safe.length) return;
      if (imageFiles.length > 10) triggerNotification("Modo local: máximo 10 por vez. Supabase já está conectado para este projeto.");
      imageFiles.splice(0, imageFiles.length, ...safe);
    }

    // Compress to WebP if enabled
    const filesToUpload = compressWebP && supabase
      ? await Promise.all(imageFiles.map((f) => f.type === "image/webp" ? f : compressToWebP(f)))
      : imageFiles;

    const jobs: UploadJob[] = filesToUpload.map((f) => ({
      id: `job-${Date.now()}-${Math.random()}`,
      file: f, status: "pending" as const, progress: 0,
    }));

    if (!isMountedRef.current) return;
    setUploadJobs(jobs);
    setUploadTotal(jobs.length);
    setUploadDoneCount(0);
    setShowUpload(true);

    const results: GalleryFile[] = [];
    let doneCount = 0;

    // Worker que processa um job por vez (chamado em paralelo)
    const uploadOne = async (job: UploadJob) => {
      if (!isMountedRef.current) return;
      setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "uploading", progress: 20 } : j));
      try {
        const safeName = job.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueName = `${Date.now()}_${safeName}`;
        const path = `gallery/${uploadCategory}/${uniqueName}`;

        if (supabase) {
          const { error } = await supabase.storage.from("site-assets").upload(path, job.file, { cacheControl: "3600", upsert: false });
          if (!isMountedRef.current) return;
          if (error) throw error;
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
          try { addMediaItem({ url: dataUrl, name: job.file.name, type: "image", category: uploadCategory }); }
          catch { throw new Error("Armazenamento local cheio — reconecte o Supabase."); }
          results.push({ id: `local-${Date.now()}`, name: job.file.name, url: dataUrl, category: uploadCategory, size: job.file.size });
          if (isMountedRef.current)
            setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "done", progress: 100, url: dataUrl } : j));
        }
      } catch (err: any) {
        if (isMountedRef.current)
          setUploadJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: "error", error: err?.message || "Erro" } : j));
      } finally {
        doneCount++;
        if (isMountedRef.current) setUploadDoneCount(doneCount);
      }
    };

    // Fila com N workers em paralelo (pool pattern)
    let idx = 0;
    const worker = async () => {
      while (idx < jobs.length) {
        const job = jobs[idx++];
        await uploadOne(job);
      }
    };
    const concurrency = supabase ? UPLOAD_CONCURRENCY : 1;
    await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));

    if (!isMountedRef.current) return;
    if (results.length > 0) {
      setFiles((prev) => [...results, ...prev]);
      triggerNotification(`${results.length} de ${jobs.length} imagem(ns) enviada(s)!`);
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

  // ── Selection ────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(paginated.map((f) => f.id)));
  const deselectAll = () => { setSelectedIds(new Set()); };

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  // ── Bulk delete ───────────────────────────────────────────────
  const bulkDelete = async () => {
    if (!confirm(`Excluir ${selectedIds.size} imagem(ns) permanentemente?`)) return;
    setIsBulkProcessing(true);
    const toDelete = files.filter((f) => selectedIds.has(f.id));
    try {
      if (supabase) {
        const paths = toDelete.filter((f) => f.path).map((f) => f.path!);
        if (paths.length) await supabase.storage.from("site-assets").remove(paths);
      } else {
        toDelete.forEach((f) => deleteMediaItem(f.id));
      }
      setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
      triggerNotification(`${toDelete.length} imagem(ns) excluída(s).`);
      exitSelectMode();
    } catch { triggerNotification("Erro ao excluir."); }
    setIsBulkProcessing(false);
  };

  // ── Move single or bulk ───────────────────────────────────────
  const moveFile = async (file: GalleryFile, targetFolder: string) => {
    if (file.category === targetFolder) return;
    try {
      if (supabase && file.path) {
        const newPath = `gallery/${targetFolder}/${file.name}`;
        const { error } = await supabase.storage.from("site-assets").move(file.path, newPath);
        if (error) throw error;
        const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(newPath);
        setFiles((prev) => prev.map((f) => f.id === file.id
          ? { ...f, category: targetFolder, path: newPath, url: pub?.publicUrl || f.url }
          : f));
      } else {
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, category: targetFolder } : f));
      }
      triggerNotification(`Movido para "${targetFolder}".`);
    } catch { triggerNotification("Erro ao mover arquivo."); }
  };

  const bulkMove = async (targetFolder: string) => {
    setShowMoveMenu(false);
    setIsBulkProcessing(true);
    const toMove = files.filter((f) => selectedIds.has(f.id) && f.category !== targetFolder);
    for (const file of toMove) { await moveFile(file, targetFolder); }
    triggerNotification(`${toMove.length} imagem(ns) movida(s) para "${targetFolder}".`);
    exitSelectMode();
    setIsBulkProcessing(false);
  };

  // ── Folders ───────────────────────────────────────────────────
  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name || folders.includes(name)) { triggerNotification("Nome inválido ou já existe."); return; }
    setFolders((prev) => [...prev, name]);
    setNewFolderName("");
    setShowNewFolder(false);
    triggerNotification(`Pasta "${name}" criada!`);
    if (supabase) {
      try {
        // Empty placeholder so this folder is discoverable in Storage (and by other
        // devices) even before any image is uploaded into it.
        await supabase.storage.from("site-assets").upload(`gallery/${name}/.emptyFolderPlaceholder`, new Blob([""]), { upsert: true });
      } catch {
        // Non-fatal — folder still works locally; syncs elsewhere once a file lands in it
      }
    }
  };

  const deleteFolder = async (folder: string) => {
    const count = files.filter((f) => f.category === folder).length;
    if (count > 0 && !confirm(`A pasta "${folder}" tem ${count} imagem(ns). Excluir a pasta moverá tudo para "Geral". Continuar?`)) return;
    // Move all images to Geral first
    const toMove = files.filter((f) => f.category === folder);
    for (const file of toMove) await moveFile(file, "Geral");
    if (supabase) {
      try { await supabase.storage.from("site-assets").remove([`gallery/${folder}/.emptyFolderPlaceholder`]); } catch { /* ignore */ }
    }
    setFolders((prev) => prev.filter((f) => f !== folder));
    if (categoryFilter === folder) setCategoryFilter("Todas");
    setDeletingFolder(null);
    triggerNotification(`Pasta "${folder}" removida.`);
  };

  // ── WebP compression ─────────────────────────────────────────
  // Also caps the longest side at MAX_DIMENSION — phone photos routinely arrive at
  // 4000-8000px wide, far beyond what the grid thumbnails or lightbox (max 92vh) ever
  // display. Downscaling before upload cuts payload size (and visitor download time)
  // dramatically without any visible quality loss, on top of the WebP re-encode.
  const MAX_DIMENSION = 2200;
  const compressToWebP = (file: File, quality = 0.82): Promise<File> =>
    new Promise((resolve) => {
      const img = new window.Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const { naturalWidth: w, naturalHeight: h } = img;
        const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
        }, "image/webp", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(objUrl); resolve(file); };
      img.src = objUrl;
    });

  // ── Rename ───────────────────────────────────────────────────
  const renameFile = async (file: GalleryFile, newBaseName: string) => {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const newName = newBaseName.trim() + ext;
    if (!newName || newName === file.name) { setRenamingId(null); return; }
    try {
      if (supabase && file.path) {
        const newPath = `gallery/${file.category}/${newName}`;
        const { error } = await supabase.storage.from("site-assets").move(file.path, newPath);
        if (error) throw error;
        const { data: pub } = supabase.storage.from("site-assets").getPublicUrl(newPath);
        setFiles((prev) => prev.map((f) => f.id === file.id
          ? { ...f, name: newName, path: newPath, url: pub?.publicUrl || f.url }
          : f));
      } else {
        setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, name: newName } : f));
      }
      triggerNotification(`Renomeado para "${newName}".`);
    } catch { triggerNotification("Erro ao renomear."); }
    setRenamingId(null);
  };

  // ── Bulk copy URLs ────────────────────────────────────────────
  const bulkCopyUrls = () => {
    const urls = files.filter((f) => selectedIds.has(f.id)).map((f) => f.url).join("\n");
    navigator.clipboard.writeText(urls);
    triggerNotification(`${selectedIds.size} URL(s) copiada(s)!`);
  };

  // ── Bulk download ─────────────────────────────────────────────
  const bulkDownload = async () => {
    const toDownload = files.filter((f) => selectedIds.has(f.id));
    triggerNotification(`Baixando ${toDownload.length} imagem(ns)...`);
    for (const file of toDownload) {
      try {
        const resp = await fetch(file.url);
        const blob = await resp.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        await new Promise((r) => setTimeout(r, 300));
      } catch { /* skip failed */ }
    }
  };

  // ── Tags ─────────────────────────────────────────────────────
  const addTag = (fileId: string, tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t) return;
    setTags((prev) => {
      const next = { ...prev, [fileId]: [...(prev[fileId] || []).filter((x) => x !== t), t] };
      try { localStorage.setItem(TAGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const removeTag = (fileId: string, tag: string) => {
    setTags((prev) => {
      const next = { ...prev, [fileId]: (prev[fileId] || []).filter((x) => x !== tag) };
      try { localStorage.setItem(TAGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // ── Infinite scroll ───────────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((n) => n + PAGE_SIZE);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Filter + Sort + Infinite scroll ──────────────────────────
  const filtered = files
    .filter((f) => {
      const matchCat = categoryFilter === "Todas" || f.category === categoryFilter;
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
      const fileTags = tags[f.id] || [];
      const matchTag = !search || fileTags.some((t) => t.includes(search.toLowerCase()));
      return matchCat && (matchSearch || matchTag);
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "size") cmp = (a.size || 0) - (b.size || 0);
      else cmp = (a.uploadedAt || "").localeCompare(b.uploadedAt || "");
      return sortDir === "asc" ? cmp : -cmp;
    });

  const paginated = filtered.slice(0, visibleCount);
  useEffect(() => setVisibleCount(PAGE_SIZE), [search, categoryFilter, sortBy, sortDir]);

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

  const doneCount = uploadDoneCount;
  const errorCount = uploadJobs.filter((j) => j.status === "error").length;
  const allDone = uploadJobs.length > 0 && uploadDoneCount >= uploadJobs.length;
  const overallPct = uploadTotal > 0 ? Math.round((uploadDoneCount / uploadTotal) * 100) : 0;

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
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-colors border ${
              selectMode
                ? "bg-[#FFD400]/10 border-[#FFD400]/40 text-[#FFD400]"
                : "bg-white/5 border-white/5 text-stone-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {selectMode ? "Cancelar" : "Selecionar"}
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompressWebP((v) => !v)}
                className={`flex items-center gap-1.5 text-[10px] font-bold cursor-pointer transition-colors ${compressWebP ? "text-[#FFD400]" : "text-stone-500 hover:text-stone-300"}`}
                title="Converte para WebP automaticamente antes do upload (economiza ~70% de espaço)"
              >
                <div className={`w-7 h-4 rounded-full transition-colors relative ${compressWebP ? "bg-[#FFD400]" : "bg-stone-700"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${compressWebP ? "left-3.5" : "left-0.5"}`} />
                </div>
                WebP
              </button>
              <button onClick={() => { setShowUpload(false); setUploadJobs([]); }} className="text-stone-500 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
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
            <div className="space-y-3">
              {/* Overall progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-bold">
                    {allDone ? "✓ Concluído" : `Enviando ${UPLOAD_CONCURRENCY} em paralelo...`}
                    <span className="text-stone-500 font-normal ml-2">{doneCount}/{uploadTotal} imagens</span>
                    {errorCount > 0 && <span className="text-red-400 ml-2">· {errorCount} erro(s)</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#FFD400] font-black font-mono text-xs">{overallPct}%</span>
                    {allDone && (
                      <button onClick={() => { setUploadJobs([]); setUploadTotal(0); setUploadDoneCount(0); }}
                        className="text-stone-500 hover:text-white cursor-pointer text-xs">Limpar</button>
                    )}
                  </div>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${allDone ? "bg-green-500" : "bg-[#FFD400]"}`}
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
              </div>

              {/* Individual job list — scrollable, shows last 30 active */}
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {uploadJobs.slice(-60).map((job) => (
                  <div key={job.id} className="flex items-center gap-2.5 bg-[#0F1115] rounded-lg px-2.5 py-2">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-stone-800 flex-shrink-0">
                      {job.status === "done" && job.url
                        ? <img src={job.url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center">
                            {job.status === "error" ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : <Loader2 className="w-3.5 h-3.5 text-stone-500 animate-spin" />}
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-stone-400 truncate text-[10px] font-mono">{job.file.name}</p>
                      {job.status === "error" && job.error && (
                        <p className="text-red-400 truncate text-[9px] mt-0.5">{job.error}</p>
                      )}
                    </div>
                    <span className="flex-shrink-0">
                      {job.status === "done" ? <Check className="w-3.5 h-3.5 text-green-400" /> :
                       job.status === "error" ? <span className="text-[9px] text-red-400 font-bold">ERRO</span> :
                       job.status === "uploading" ? <Loader2 className="w-3.5 h-3.5 text-[#FFD400] animate-spin" /> :
                       <span className="text-[9px] text-stone-600">aguard.</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Search + Sort + Grid toggle ── */}
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
        {/* Sort controls */}
        <div className="flex gap-1 bg-[#171A21] border border-white/5 rounded-xl p-1 flex-shrink-0">
          {(["date", "name", "size"] as const).map((s) => (
            <button key={s} onClick={() => { if (sortBy === s) setSortDir((d) => d === "asc" ? "desc" : "asc"); else { setSortBy(s); setSortDir("desc"); } }}
              className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold ${sortBy === s ? "bg-[#FFD400] text-[#07090D]" : "text-stone-500 hover:text-white"}`}
              title={s === "date" ? "Ordenar por data" : s === "name" ? "Ordenar por nome" : "Ordenar por tamanho"}
            >
              {s === "date" ? "Data" : s === "name" ? "Nome" : "Tam."}
              {sortBy === s ? (sortDir === "desc" ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
            </button>
          ))}
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

      {/* ── Selection toolbar ── */}
      {selectMode && (
        <div className="flex flex-wrap items-center gap-2 bg-[#171A21] border border-[#FFD400]/20 rounded-xl px-3 py-2.5">
          <CheckSquare className="w-4 h-4 text-[#FFD400] flex-shrink-0" />
          <span className="text-[#FFD400] font-black text-xs uppercase">
            {selectedIds.size > 0 ? `${selectedIds.size} selecionada(s)` : "Clique nas imagens para selecionar"}
          </span>
          <div className="flex gap-2 text-[10px] text-stone-500">
            <button onClick={selectAll} className="hover:text-white cursor-pointer transition-colors">Todas da página</button>
            {selectedIds.size > 0 && <button onClick={deselectAll} className="hover:text-white cursor-pointer transition-colors">Nenhuma</button>}
          </div>
          <div className="flex-1" />
          {selectedIds.size > 0 && !isBulkProcessing && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowMoveMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors"
                >
                  <Move className="w-3 h-3" /> Mover para
                </button>
                {showMoveMenu && (
                  <div className="absolute top-full left-0 mt-1 z-50 bg-[#0F1115] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[140px]">
                    {folders.map((f) => (
                      <button
                        key={f}
                        onClick={() => bulkMove(f)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-stone-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors text-left"
                      >
                        <Folder className="w-3 h-3 flex-shrink-0" /> {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={bulkCopyUrls}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors"
              >
                <Copy className="w-3 h-3" /> URLs
              </button>
              <button
                onClick={bulkDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors"
              >
                <Download className="w-3 h-3" /> Baixar
              </button>
              <button
                onClick={bulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Excluir
              </button>
            </div>
          )}
          {isBulkProcessing && <Loader2 className="w-4 h-4 text-[#FFD400] animate-spin" />}
          <button onClick={exitSelectMode} className="p-1.5 text-stone-500 hover:text-white cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Category tabs / Pastas ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Folder className="w-3 h-3 text-stone-600" />
          <span className="text-stone-600 text-[10px] font-black uppercase tracking-widest">Pastas</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["Todas", ...folders].map((cat) => {
            const count = cat === "Todas" ? files.length : files.filter((f) => f.category === cat).length;
            const isDragTarget = dragOverFolder === cat && draggedFileId !== null && cat !== "Todas";
            const isDefault = DEFAULT_FOLDERS.includes(cat);
            return (
              <div key={cat} className="relative flex-shrink-0 group/tab">
                <button
                  onClick={() => setCategoryFilter(cat)}
                  onDragOver={(e) => { if (draggedFileId && cat !== "Todas") { e.preventDefault(); setDragOverFolder(cat); } }}
                  onDragLeave={() => setDragOverFolder(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverFolder(null);
                    if (e.dataTransfer.files.length > 0 && cat !== "Todas") {
                      setUploadCategory(cat);
                      setShowUpload(true);
                      processFiles(Array.from(e.dataTransfer.files));
                    } else if (draggedFileId && cat !== "Todas") {
                      const file = files.find((f) => f.id === draggedFileId);
                      if (file) moveFile(file, cat);
                      setDraggedFileId(null);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                    isDragTarget
                      ? "bg-[#FFD400]/25 border-[#FFD400]/70 text-[#FFD400] scale-105 shadow-lg shadow-[#FFD400]/10"
                      : categoryFilter === cat
                        ? "bg-[#FFD400]/10 border-[#FFD400]/40 text-[#FFD400]"
                        : "bg-[#171A21] border-white/5 text-stone-500 hover:text-stone-300 hover:border-white/10"
                  }`}
                >
                  {cat}
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${
                    categoryFilter === cat ? "bg-[#FFD400]/20 text-[#FFD400]" : "bg-white/5 text-stone-600"
                  }`}>{count}</span>
                </button>
                {/* Delete custom folder */}
                {cat !== "Todas" && !isDefault && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFolder(cat); }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 hover:bg-red-400 rounded-full text-white opacity-0 group-hover/tab:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                    title="Excluir pasta"
                  >
                    <X className="w-2 h-2 stroke-[3]" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New folder button / inline input */}
          {showNewFolder ? (
            <div className="flex items-center gap-1 flex-shrink-0">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createFolder();
                  if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
                }}
                placeholder="Nome da pasta..."
                className="w-32 px-2.5 py-1.5 bg-[#171A21] border border-[#FFD400]/40 rounded-xl text-white text-[10px] outline-none focus:border-[#FFD400]/70"
              />
              <button onClick={createFolder}
                className="p-1.5 bg-[#FFD400] text-[#07090D] rounded-lg cursor-pointer hover:bg-[#FF9A00] transition-colors">
                <Check className="w-3 h-3" />
              </button>
              <button onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                className="p-1.5 bg-white/5 text-stone-400 hover:text-white rounded-lg cursor-pointer transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-dashed border-white/15 text-stone-600 hover:text-stone-300 hover:border-white/30 text-[10px] font-bold cursor-pointer transition-colors"
            >
              <FolderPlus className="w-3 h-3" /> Nova pasta
            </button>
          )}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
        <span>{filtered.length} imagem(ns){search ? ` para "${search}"` : ""}{categoryFilter !== "Todas" ? ` em ${categoryFilter}` : ""}</span>
        {filtered.length > paginated.length && <span>{paginated.length}/{filtered.length} exibidas</span>}
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
          {paginated.map((file, fileIdx) => {
            const isSelected = selectedIds.has(file.id);
            const isDraggingThis = draggedFileId === file.id;
            return (
              <div key={file.id}
                draggable={!selectMode}
                onDragStart={() => setDraggedFileId(file.id)}
                onDragEnd={() => setDraggedFileId(null)}
                className={`group relative bg-[#0F1115] border rounded-xl overflow-hidden transition-all duration-200 ${
                  isDraggingThis ? "opacity-40 scale-95" :
                  isSelected ? "border-[#FFD400]/60 shadow-lg shadow-[#FFD400]/10" :
                  "border-white/5 hover:border-[#FFD400]/25 hover:shadow-lg hover:shadow-black/30"
                }`}
              >
                {/* Thumbnail */}
                <div
                  className={`relative ${gridConfig.thumb} bg-stone-900 overflow-hidden ${selectMode ? "cursor-pointer" : "cursor-zoom-in"}`}
                  onClick={() => selectMode ? toggleSelect(file.id) : setLightboxIdx(fileIdx)}
                >
                  <img
                    src={file.url} alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />

                  {/* Select mode overlay */}
                  {selectMode && (
                    <div className={`absolute inset-0 transition-all duration-150 ${isSelected ? "bg-[#FFD400]/20" : "bg-black/0 group-hover:bg-black/30"}`}>
                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected ? "bg-[#FFD400] border-[#FFD400]" : "bg-black/50 border-white/50 group-hover:border-white"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-[#07090D] stroke-[3]" />}
                      </div>
                    </div>
                  )}

                  {/* Normal hover overlay (hidden in select mode) */}
                  {!selectMode && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                          <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </>
                  )}

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
                <div className={`${gridSize === "sm" ? "p-1.5" : "p-3"} space-y-2`}>
                  {/* Filename / rename */}
                  {gridSize !== "sm" && (
                    renamingId === file.id ? (
                      <input
                        autoFocus
                        defaultValue={file.name.replace(/\.[^.]+$/, "")}
                        onBlur={(e) => renameFile(file, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") renameFile(file, e.currentTarget.value); if (e.key === "Escape") setRenamingId(null); }}
                        className="w-full px-2 py-1 bg-[#171A21] border border-[#FFD400]/40 rounded-lg text-white text-[10px] outline-none font-mono"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center gap-1 group/name">
                        <p className="text-stone-400 text-[10px] truncate leading-none font-mono flex-1" title={file.name}>{file.name}</p>
                        <button onClick={() => { setRenamingId(file.id); setRenameValue(file.name.replace(/\.[^.]+$/, "")); }}
                          className="opacity-0 group-hover/name:opacity-100 text-stone-600 hover:text-[#FFD400] cursor-pointer transition-all flex-shrink-0">
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  )}
                  {/* Tags */}
                  {gridSize !== "sm" && (
                    <div className="flex flex-wrap gap-1 items-center">
                      {(tags[file.id] || []).map((tag) => (
                        <span key={tag} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-stone-800 rounded text-[8px] text-stone-400 group/tag">
                          {tag}
                          <button onClick={() => removeTag(file.id, tag)} className="opacity-0 group-hover/tag:opacity-100 text-red-400 cursor-pointer ml-0.5"><X className="w-2 h-2" /></button>
                        </span>
                      ))}
                      {editingTagsId === file.id ? (
                        <input autoFocus value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { addTag(file.id, tagInput); setTagInput(""); } if (e.key === "Escape") setEditingTagsId(null); }}
                          onBlur={() => { if (tagInput) addTag(file.id, tagInput); setTagInput(""); setEditingTagsId(null); }}
                          placeholder="tag..." className="w-16 px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-[8px] text-white outline-none" />
                      ) : (
                        <button onClick={() => setEditingTagsId(file.id)}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 border border-dashed border-stone-700 rounded text-[8px] text-stone-600 hover:text-stone-400 cursor-pointer transition-colors">
                          <Tag className="w-2.5 h-2.5" /> tag
                        </button>
                      )}
                    </div>
                  )}
                  {/* Action buttons */}
                  {selectMode ? (
                    <button onClick={() => toggleSelect(file.id)}
                      className={`w-full flex items-center justify-center gap-1 font-black uppercase rounded-lg cursor-pointer transition-all border ${
                        isSelected ? "bg-[#FFD400]/15 border-[#FFD400]/40 text-[#FFD400]" : "bg-white/5 border-white/5 text-stone-500 hover:text-white"
                      } ${gridSize === "sm" ? "py-1 text-[8px]" : "py-1.5 text-[9px]"}`}>
                      <Check className="w-3 h-3" />
                      {gridSize !== "sm" && (isSelected ? "Selecionada" : "Selecionar")}
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => handleCopy(file)}
                        className={`flex-1 flex items-center justify-center gap-1 font-black uppercase rounded-lg cursor-pointer transition-all border ${
                          copiedId === file.id ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#FFD400]/8 hover:bg-[#FFD400] border-[#FFD400]/20 text-[#FFD400] hover:text-[#07090D]"
                        } ${gridSize === "sm" ? "py-1 text-[8px]" : "py-1.5 text-[9px]"}`}>
                        {copiedId === file.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {gridSize !== "sm" && (copiedId === file.id ? "Copiado" : "URL")}
                      </button>
                      <button onClick={() => handleDelete(file)}
                        className={`flex items-center justify-center bg-white/5 hover:bg-red-500/15 text-stone-600 hover:text-red-400 rounded-lg cursor-pointer transition-all ${gridSize === "sm" ? "py-1 px-1.5" : "py-1.5 px-2"}`}
                        title="Excluir">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Infinite scroll sentinel ── */}
      {visibleCount < filtered.length && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6 text-stone-600 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Carregando mais imagens... ({paginated.length}/{filtered.length})
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
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-[#FFD400] text-[10px] font-bold uppercase">{lightboxFile.category}</span>
                  {lightboxFile.size && <span className="text-stone-500 text-[10px]">· {fmtSize(lightboxFile.size)}</span>}
                  {lightboxDims && <span className="text-stone-500 text-[10px]">· {lightboxDims.w}×{lightboxDims.h}px</span>}
                  {lightboxFile.uploadedAt && <span className="text-stone-600 text-[10px]">· {new Date(lightboxFile.uploadedAt).toLocaleDateString("pt-BR")}</span>}
                  <span className="text-stone-600 text-[10px]">· {lightboxIdx! + 1}/{paginated.length}</span>
                  {(tags[lightboxFile.id] || []).map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 bg-stone-800 rounded text-[8px] text-stone-400">#{tag}</span>
                  ))}
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
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setLightboxDims({ w: img.naturalWidth, h: img.naturalHeight });
                }}
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
