import React from "react";
import { Play, Star, Calendar, Download } from "lucide-react";
import { motion } from "motion/react";
import { Anime } from "../types";

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
  variant?: "default" | "compact";
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick, variant = "default" }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  if (variant === "compact") {
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group relative w-[160px] md:w-[200px] flex-shrink-0 text-left bg-bg-card rounded-2xl overflow-hidden border border-border-subtle cursor-pointer hover:border-brand-primary/30 transition-all shadow-xl"
        onClick={() => onClick(anime)}
        aria-label={`Watch ${anime.title}`}
      >
        <div className="aspect-[3/4] relative overflow-hidden bg-[#202028]">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/90 text-[10px] font-black text-white rounded shadow-lg">
              <Star size={10} className="fill-white" />
              {anime.rating}
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-bold text-xs text-white line-clamp-1 mb-1 group-hover:text-brand-primary transition-colors">
            {anime.title}
          </h3>
          <div className="flex items-center gap-2 text-text-dim text-[9px] font-bold uppercase tracking-wider">
            <span>{anime.year}</span>
            <span className="opacity-30">•</span>
            <span>{anime.type}</span>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="group relative w-full text-left bg-bg-card rounded-2xl overflow-hidden border border-border-subtle cursor-pointer hover:border-brand-primary/30 transition-colors shadow-lg"
      onClick={() => onClick(anime)}
      aria-label={`Watch ${anime.title}`}
    >
      <div className="aspect-[16/10] relative overflow-hidden bg-[#202028]">
        <img
          src={anime.imageUrl}
          alt={anime.title}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Quality Tag */}
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-md text-[9px] font-bold rounded-md uppercase tracking-[0.1em] border border-border-subtle">
          1080p
        </div>

        {/* Hover Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/40">
            <Play className="text-white fill-white ml-0.5" size={16} />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm text-white line-clamp-1 mb-1.5 group-hover:text-brand-primary transition-colors">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 text-text-dim text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
            EP {anime.episodes}
          </span>
          <span className="opacity-30">•</span>
          <span className="flex items-center gap-1">
            Sub/Dub
          </span>
        </div>
      </div>
    </motion.button>
  );
};

export default AnimeCard;
