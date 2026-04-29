import React from "react";
import { Hash } from "lucide-react";

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
  "Sports", "Supernatural", "Thriller", "Psychological"
];

interface GenreCategoriesProps {
  onSelect: (genre: string) => void;
  selectedGenre?: string;
}

export default function GenreCategories({ onSelect, selectedGenre }: GenreCategoriesProps) {
  return (
    <div className="max-w-7xl mx-auto px-8 mb-16 overflow-x-auto no-scrollbar scroll-smooth">
       <div className="flex items-center gap-4 py-2 min-w-max">
         <div className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] mr-4 flex items-center gap-2">
           <Hash size={14} /> FILTER BY GENRE
         </div>
         {GENRES.map((genre) => (
           <button
             key={genre}
             onClick={() => onSelect(genre)}
             className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all active:scale-95 ${
               selectedGenre === genre 
               ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" 
               : "bg-white/5 border-border-subtle text-text-dim hover:text-white hover:bg-glass"
             }`}
           >
             {genre}
           </button>
         ))}
       </div>
    </div>
  );
}
