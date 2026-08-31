import React, { useRef } from "react";
import { Upload, Link, X, Video as VideoIcon } from "lucide-react";
import { getSupabase } from "../lib/supabase";

interface VideoUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB — matches the Supabase Storage bucket's own limit

function isDirectVideoUrl(url: string) {
  const lower = url.toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.startsWith("data:video") || lower.startsWith("blob:");
}

export default function VideoUploadField({
  label,
  value,
  onChange,
  folder = "videos",
  placeholder = "https://www.youtube.com/embed/... ou link MP4 direto",
}: VideoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError("Arquivo muito grande. Máximo: 50MB.");
      return;
    }

    setUploading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase não configurado — não é possível enviar o arquivo.");
      setUploading(false);
      return;
    }

    try {
      const ext = file.name.split(".").pop() || "mp4";
      const fileName = `${folder}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, { cacheControl: "31536000", upsert: true });

      if (uploadError) {
        setError("Falha no upload: " + uploadError.message);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("site-assets")
          .getPublicUrl(fileName);
        onChange(publicUrl);
      }
    } catch (e: any) {
      setError("Falha no upload: " + (e?.message || "erro desconhecido"));
    }

    setUploading(false);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-stone-400 text-[11px] uppercase font-bold tracking-wider">
        {label}
      </label>

      {/* Preview for direct video files (YouTube links just show as text) */}
      {value && isDirectVideoUrl(value) && (
        <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-stone-900">
          <video src={value} controls muted className="w-full max-h-40 object-contain bg-black" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <Link size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#0F1115] border border-white/5 rounded-lg pl-7 pr-3 py-2.5 text-white text-xs font-mono outline-none focus:border-[#FFD400]/50 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#FFD400]/10 hover:bg-[#FFD400]/20 border border-[#FFD400]/20 text-[#FFD400] rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          {uploading ? <VideoIcon size={12} className="animate-pulse" /> : <Upload size={12} />}
          {uploading ? "Enviando..." : "Upload"}
        </button>
      </div>

      <p className="text-stone-600 text-[10px]">Link do YouTube, ou envie um arquivo MP4/WebM direto (máx. 50MB).</p>

      {error && <p className="text-red-400 text-[11px]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
