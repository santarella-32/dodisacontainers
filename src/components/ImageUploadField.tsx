import React, { useRef } from "react";
import { Upload, Link, X } from "lucide-react";
import { getSupabase } from "../lib/supabase";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  accept?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = "uploads",
  placeholder = "https://",
  accept = "image/*",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo: 5MB.");
      return;
    }

    setUploading(true);

    // Immediate local preview via base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);

    // If Supabase is configured, upload to storage for a permanent URL
    const supabase = getSupabase();
    if (supabase) {
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${folder}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(fileName, file, { cacheControl: "31536000", upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("site-assets")
            .getPublicUrl(fileName);
          onChange(publicUrl);
        }
      } catch {
        // fallback to base64 already set above
      }
    }

    setUploading(false);
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-stone-400 text-[11px] uppercase font-bold tracking-wider">
        {label}
      </label>

      {/* Preview */}
      {value && (value.startsWith("data:") || value.startsWith("http")) && (
        <div className="relative w-full h-28 rounded-lg overflow-hidden border border-white/10 bg-stone-900">
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      )}

      {/* URL Input + Upload Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
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
          <Upload size={12} />
          {uploading ? "Enviando..." : "Upload"}
        </button>
      </div>

      {error && <p className="text-red-400 text-[11px]">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
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
