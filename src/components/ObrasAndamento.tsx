import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, X, Image as ImageIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { OngoingProject } from "../context/AppContext";

export default function ObrasAndamento() {
  const { ongoingProjects } = useAppContext();
  const [openProject, setOpenProject] = useState<OngoingProject | null>(null);

  const visibleProjects = ongoingProjects.filter((p) => p.visible && p.photos.length > 0);
  if (visibleProjects.length === 0) return null;

  return (
    <section id="obras-andamento" className="relative bg-[#07090D] py-14 sm:py-24 border-b border-zinc-800/60 scroll-mt-20 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-900 border border-stone-800 text-xs font-black text-brand-yellow uppercase tracking-widest mb-4">
            Acompanhe de Perto
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-white leading-none">
            Obras <span className="text-brand-yellow">em Andamento</span>
          </h2>
          <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Transparência de verdade: veja o progresso real dos nossos projetos, direto do canteiro.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project, idx) => {
            const cover = project.photos[project.photos.length - 1];
            return (
              <motion.button
                key={project.id}
                type="button"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => setOpenProject(project)}
                className="group relative text-left rounded-xl overflow-hidden border border-zinc-800 hover:border-brand-yellow/40 bg-zinc-900 shadow-xl transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={cover.url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-brand-yellow text-zinc-950 text-[9px] font-black uppercase tracking-widest">
                    {project.status}
                  </span>
                  <span className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-950/90 text-[9px] font-mono font-bold text-stone-300 border border-zinc-800">
                    <ImageIcon className="w-3 h-3" /> {project.photos.length}
                  </span>
                  <div className="absolute bottom-3 left-3 right-16">
                    <h3 className="text-white text-sm font-black uppercase tracking-tight truncate">{project.title}</h3>
                    {project.location && (
                      <span className="flex items-center gap-1 text-[10px] text-stone-400 font-sans mt-0.5">
                        <MapPin className="w-3 h-3" /> {project.location}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Timeline lightbox */}
      <AnimatePresence>
        {openProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpenProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-zinc-800 shrink-0">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-brand-yellow/10 text-brand-yellow text-[9px] font-black uppercase tracking-widest border border-brand-yellow/20 mb-2">
                    {openProject.status}
                  </span>
                  <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-tight">{openProject.title}</h3>
                  {openProject.location && (
                    <span className="flex items-center gap-1.5 text-xs text-stone-400 font-sans mt-1">
                      <MapPin className="w-3.5 h-3.5" /> {openProject.location}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpenProject(null)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
                {openProject.photos.map((photo, i) => (
                  <div key={photo.id} className="relative flex gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="w-6 h-6 rounded-full bg-brand-yellow text-zinc-950 text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      {i < openProject.photos.length - 1 && <div className="w-px flex-1 bg-zinc-800 mt-1.5" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="rounded-xl overflow-hidden border border-zinc-800 mb-2">
                        <img src={photo.url} alt={photo.caption} className="w-full h-auto max-h-72 object-cover" loading="lazy" />
                      </div>
                      {photo.date && (
                        <span className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono uppercase tracking-wider mb-1">
                          <Clock className="w-3 h-3" /> {photo.date}
                        </span>
                      )}
                      {photo.caption && <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">{photo.caption}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
