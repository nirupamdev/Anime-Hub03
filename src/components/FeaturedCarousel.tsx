import React from "react";
import { MoveRight, Play, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Anime } from "../types";

interface FeaturedCarouselProps {
  animes: Anime[];
  onSelect: (anime: Anime) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ animes, onSelect }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (animes.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % animes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [animes]);

  if (animes.length === 0) return null;

  const current = animes[index];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-8 mb-16 h-[500px] group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 mx-8 bg-bg-card rounded-[40px] overflow-hidden border border-border-subtle shadow-2xl"
        >
          {/* Background Image with Blur */}
          <div className="absolute inset-0">
            <img 
              src={current.imageUrl} 
              className="w-full h-full object-cover scale-110 blur-xl opacity-30 transform transition-transform duration-[10s] group-hover:scale-100" 
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/40 to-transparent" />
          </div>

          <div className="relative z-10 h-full flex items-center p-12 md:p-20">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="px-3 py-1 bg-brand-primary rounded-full text-[10px] font-bold tracking-widest text-white">
                  FEATURED
                </div>
                <div className="flex gap-2">
                  {current.genres.slice(0, 2).map(g => (
                    <span key={g} className="text-text-dim text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      {g}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight"
              >
                {current.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-text-dim text-lg mb-10 line-clamp-3 leading-relaxed opacity-80"
              >
                {current.synopsis}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <button 
                  onClick={() => onSelect(current)}
                  className="bg-white text-bg-dark px-8 h-14 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-brand-primary hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                  <Play size={18} fill="currentColor" /> WATCH NOW
                </button>
                <button 
                   onClick={() => onSelect(current)}
                  className="bg-white/5 border border-border-subtle text-white px-8 h-14 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                >
                  <Info size={18} /> DETAILS
                </button>
              </motion.div>
            </div>

            {/* Poster Cutout for Desktop */}
            <div className="hidden lg:block ml-auto w-1/3 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-border-subtle rotate-3 group-hover:rotate-0 transition-transform duration-700">
               <img src={current.imageUrl} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Indicators */}
      <div className="absolute bottom-10 left-20 z-20 flex gap-2">
        {animes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-brand-primary' : 'w-2 bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
