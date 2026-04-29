import React from "react";
import { X, Play, Download, Star, Calendar, Info, Share2, Clapperboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Anime } from "../types";

interface AnimeDetailModalProps {
  anime: Anime | null;
  onClose: () => void;
}

export default function AnimeDetailModal({ anime, onClose }: AnimeDetailModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (anime) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [anime, onClose]);

  if (!anime) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-bg-card rounded-[32px] overflow-hidden shadow-2xl border border-border-subtle flex flex-col md:flex-row min-h-[600px]"
          role="dialog"
          aria-modal="true"
          aria-label={`${anime.title} Details`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close details"
            className="absolute top-6 right-6 z-10 p-2.5 bg-black/40 hover:bg-black/60 rounded-xl border border-border-subtle transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>

          {/* Left: Image / Cover */}
          <div className="w-full md:w-2/5 relative h-64 md:h-auto overflow-hidden">
            <img
              src={anime.imageUrl}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bg-card/90 via-transparent to-transparent" />
          </div>

          {/* Right: Content */}
          <div className="flex-1 p-10 md:p-14 overflow-y-auto">
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.genres.map((genre) => (
                <span key={genre} className="px-3.5 py-1.5 bg-white/5 border border-border-subtle rounded-xl text-[10px] font-bold text-white uppercase tracking-widest">
                  {genre}
                </span>
              ))}
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 text-white leading-tight">
              {anime.title}
            </h2>

            <div className="flex items-center gap-6 mb-10 text-xs font-bold uppercase tracking-[0.15em] text-text-dim">
              <span className="flex items-center gap-2 pr-6 border-r border-border-subtle">
                <Star size={14} className="text-brand-primary fill-brand-primary" />
                {anime.rating}
              </span>
              <span className="flex items-center gap-2 pr-6 border-r border-border-subtle">
                EP {anime.episodes}
              </span>
              <span className="flex items-center gap-2">
                {anime.year}
              </span>
            </div>

            <div className="mb-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-4">
                Synopsis
              </h4>
              <p className="text-text-dim leading-relaxed text-base font-medium opacity-80">
                {anime.synopsis}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <button className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-white text-bg-dark hover:bg-white/90 transition-all font-extrabold h-14 rounded-2xl shadow-xl shadow-white/5">
                <Play className="fill-bg-dark" size={18} /> WATCH NOW
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl border border-border-subtle group">
                <Share2 size={20} className="text-text-dim group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Download Section */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary mb-6">
                Downloads
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {anime.downloadLinks.map((link, idx) => (
                  <a 
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 border border-border-subtle rounded-2xl hover:bg-white/10 hover:border-brand-primary/30 transition-all group"
                  >
                    <div>
                      <div className="text-[13px] font-bold text-white group-hover:text-brand-primary transition-colors">
                        {link.quality}
                      </div>
                      <div className="text-[10px] font-bold text-text-dim uppercase tracking-wider mt-0.5">
                        {link.provider} • {link.size}
                      </div>
                    </div>
                    <Download size={16} className="text-text-dim group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
