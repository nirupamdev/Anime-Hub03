import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, Trash2, ArrowRight } from "lucide-react";
import { Anime } from "../types";
import { getFavorites, removeFromFavorites } from "../services/dbService";
import AnimeCard from "../components/AnimeCard";

export default function MyListPage() {
  const [favorites, setFavorites] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeFromFavorites(id);
      setFavorites(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 pt-12 pb-32">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">MY COLLECTION</h1>
          <p className="text-text-dim font-bold uppercase tracking-widest text-xs">Saved in your local MongoDB database</p>
        </div>
        <div className="flex items-center gap-4 text-brand-primary font-black text-xs uppercase tracking-widest bg-brand-primary/10 px-6 py-3 rounded-2xl border border-brand-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]">
          <BookOpen size={18} /> {favorites.length} TITLES
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-bg-card border border-border-subtle rounded-[40px] p-20 text-center flex flex-col items-center justify-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700" />
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-white/20 mb-8 border border-white/5">
             <Trash2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-4 tracking-tight">YOUR LIST IS EMPTY</h2>
          <p className="text-text-dim font-bold uppercase tracking-widest text-xs mb-10 max-w-xs leading-relaxed">
            Exploration is key. Start adding titles from search or home to build your library.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center gap-3 bg-white text-bg-dark px-10 py-5 rounded-2xl font-black text-sm hover:bg-brand-primary hover:text-white transition-all shadow-2xl active:scale-95 group/btn"
          >
            DISCOVER ANIME <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {favorites.map((anime) => (
            <div key={anime.id} className="relative group">
              <AnimeCard anime={anime} onClick={() => navigate(`/anime/${anime.id}`)} />
              <button 
                onClick={(e) => handleRemove(anime.id, e)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-red-500 hover:border-red-500/50 transition-all opacity-0 group-hover:opacity-100 shadow-2xl z-20"
                title="Remove from list"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
