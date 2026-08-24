import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { EditableVideo } from "../context/AppContext";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function getThumbnail(card: EditableVideo): string {
  if (card.thumbnail) return card.thumbnail;
  const ytId = getYoutubeId(card.url || "");
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=650&q=80";
}

// ─── Lightbox modal ────────────────────────────────────────────────────────────

function VideoModal({ video, onClose }: { video: EditableVideo; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const ytId = getYoutubeId(video.url || "");
  const direct = isDirectVideo(video.url || "");
  const hasPlayer = !!(ytId || direct);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex items-center gap-1.5 text-zinc-400 hover:text-white text-[10px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          Fechar (Esc)
        </button>

        {/* Player */}
        <div className="relative aspect-video w-full bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
          {ytId && (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
              title={video.title}
            />
          )}
          {direct && !ytId && (
            <video
              src={video.url}
              autoPlay
              controls
              className="absolute inset-0 w-full h-full"
            />
          )}
          {!hasPlayer && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <span className="text-5xl">🎬</span>
              <span className="text-[10px] font-mono uppercase tracking-widest">Vídeo em breve</span>
              <span className="text-[9px] text-zinc-700 font-mono">Arquivo ainda não hospedado</span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className="mt-3 flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/20 text-[8px] font-black text-red-400 uppercase tracking-widest font-mono flex-shrink-0">
            {video.category}
          </span>
          <p className="text-sm font-black text-white uppercase tracking-tight truncate">{video.title}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section ───────────────────────────────────────────────────────────────────

export default function VideosReais() {
  const { videos } = useAppContext();
  const [modalVideo, setModalVideo] = useState<EditableVideo | null>(null);

  const visibleVideos = videos.filter((v) => v.visible);

  return (
    <section id="videos-demonstrativos" className="relative bg-zinc-950 py-12 sm:py-20 border-b border-stone-900 scroll-mt-20 overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.02),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-900 border border-stone-800 text-xs font-black text-red-500 uppercase tracking-widest mb-4">
            Operação em Campo
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-sans uppercase tracking-tight text-white leading-none">
            Vídeos das Nossas <span className="text-red-500">Operações</span>
          </h2>
          <p className="mt-4 text-stone-400 font-sans text-sm sm:text-base leading-relaxed">
            Veja de perto como entregamos e montamos seus containers.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleVideos.map((card, idx) => (
            <motion.div
              key={card.id || card.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group bg-stone-900 border border-stone-850 hover:border-red-500/30 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between flex-shrink-0 w-[320px] sm:w-[380px] snap-start"
            >
              {/* Thumbnail + Play */}
              <div
                className="relative aspect-[16/9] bg-stone-950 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => setModalVideo(card)}
              >
                <img
                  src={getThumbnail(card)}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-[1.03] transition-all duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/60" />

                {/* Play button */}
                <button
                  className="relative z-10 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all outline-none border border-red-400/40 cursor-pointer"
                  aria-label="Assistir vídeo"
                  tabIndex={-1}
                >
                  <Play className="w-7 h-7 text-white fill-current ml-1" />
                </button>

                {card.duration && (
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-stone-950/90 text-[10px] font-mono text-zinc-400">
                    {card.duration}
                  </div>
                )}

                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-stone-950/90 text-[9px] font-black uppercase text-red-500 tracking-widest border border-stone-800">
                  {card.category}
                </div>
              </div>

              {/* Meta */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-white text-base sm:text-lg font-black uppercase tracking-tight group-hover:text-red-500 transition-colors leading-tight mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-sans leading-relaxed mb-4">
                    Vídeo real de operação em campo — sem edição, sem atores.
                  </p>
                </div>

                <button
                  onClick={() => setModalVideo(card)}
                  className="w-full py-2.5 px-4 min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded border border-red-500 hover:border-red-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Assistir vídeo
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Lightbox */}
      {modalVideo && <VideoModal video={modalVideo} onClose={() => setModalVideo(null)} />}

    </section>
  );
}