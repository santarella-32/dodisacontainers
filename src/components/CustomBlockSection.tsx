import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface Props {
  id: string;
}

export default function CustomBlockSection({ id }: Props) {
  const { customBlocks } = useAppContext();
  const block = customBlocks.find((b) => b.id === id);
  if (!block) return null;

  return (
    <section className="relative py-14 sm:py-24 bg-[#0B0F14] overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={`relative rounded-2xl bg-[#111827]/40 backdrop-blur-md border border-white/5 shadow-2xl overflow-hidden ${
            block.image ? "grid sm:grid-cols-2 items-stretch" : "p-6 sm:p-16 text-center flex flex-col items-center"
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-yellow to-brand-orange" />

          {block.image && (
            <div className="min-h-[220px] sm:min-h-full">
              <img src={block.image} alt={block.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}

          <div className={`p-6 sm:p-12 flex flex-col ${block.image ? "justify-center items-start text-left" : "items-center"}`}>
            {block.title && (
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white uppercase tracking-tight leading-tight">
                {block.title}
              </h2>
            )}
            {block.text && (
              <p className="mt-4 text-stone-400 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {block.text}
              </p>
            )}
            {block.ctaText && (
              <a
                href={block.ctaUrl || "#"}
                target={block.ctaUrl?.startsWith("http") ? "_blank" : undefined}
                rel={block.ctaUrl?.startsWith("http") ? "noreferrer" : undefined}
                className="mt-8 group relative py-3.5 px-8 bg-brand-yellow hover:bg-[#ffe17d] text-brand-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer font-display"
              >
                {block.ctaText}
                <ArrowRight className="w-4 h-4 text-brand-black group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
