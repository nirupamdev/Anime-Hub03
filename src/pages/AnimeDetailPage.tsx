import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Play, Download, Star, Calendar, Clock, Eye, Share2, Plus, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Anime, Episode } from "../types";
import { getAnimeById } from "../services/geminiService";
import { fetchAnimeById } from "../services/animeService";
import { addToFavorites, removeFromFavorites, isFavorite } from "../services/dbService";
import AnimeCard from "../components/AnimeCard";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAnime(id);
      checkIfFavorite(id);
    }
  }, [id]);

  const checkIfFavorite = async (animeId: string) => {
    try {
      const fav = await isFavorite(animeId);
      setIsSaved(fav);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

   const fetchAnime = async (animeId: string) => {
     setIsLoading(true);
     try {
       // Try fetching from real DB first
       const dbAnime = await fetchAnimeById(animeId);
       setAnime(dbAnime);
     } catch (error) {
       console.error("Failed to fetch anime from DB, falling back to AI:", error);
       // Fallback to AI
       const data = await getAnimeById(animeId);
       setAnime(data);
     }
     setIsLoading(false);
   };

  const handleToggleFavorite = async () => {
    if (!anime) return;
    try {
      if (isSaved) {
        await removeFromFavorites(anime.id);
        setIsSaved(false);
      } else {
        await addToFavorites(anime);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
        <h2 className="text-3xl font-black text-white mb-4">ANIME NOT FOUND</h2>
        <button onClick={() => navigate('/')} className="text-brand-primary font-bold hover:underline">
          Return to HQ
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="pb-24 md:pb-32"
    >
      {/* Hero Banner Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={anime.imageUrl} 
            className="w-full h-full object-cover scale-105 blur-[2px] md:blur-sm opacity-40" 
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        </div>
        
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-8 md:pb-20">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-end w-full">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-48 md:w-72 aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 hidden sm:block"
            >
              <img src={anime.imageUrl} className="w-full h-full object-cover" alt={anime.title} />
            </motion.div>
            
            <div className="flex-1 text-center md:text-left">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 mb-6"
              >
                <button 
                  onClick={() => navigate(-1)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-primary transition-colors mb-2 md:mb-0"
                >
                  <ArrowLeft size={20} />
                </button>
                <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-brand-primary/30">
                  {anime.status}
                </span>
                <div className="flex gap-2">
                  {anime.genres.slice(0, 3).map(g => (
                    <span key={g} className="text-text-dim text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {g}
                    </span>
                  ))}
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none"
              >
                {anime.title}
              </motion.h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-text-dim font-bold text-[10px] md:text-xs uppercase tracking-widest">
                  <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {anime.rating}</div>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {anime.year}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> {anime.duration || '24 min'}</div>
                  <div className="flex items-center gap-2"><Eye size={14} /> {anime.views || '1.2M'} VIEWS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16">
          {/* Left Column: Synopsis & Episodes */}
          <div className="lg:col-span-2">
            <section className="mb-12 md:mb-20">
              <h3 className="text-brand-primary font-black text-xs uppercase tracking-[0.3em] mb-4 md:mb-6">SYNOPSIS</h3>
              <p className="text-text-dim leading-relaxed text-base md:text-lg opacity-80 mb-8 md:mb-10 line-clamp-6 hover:line-clamp-none transition-all cursor-default">
                {anime.synopsis}
              </p>

            {/* Information Card */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-brand-primary/5 border-b border-border-subtle p-5">
                <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">INFORMATION</h4>
              </div>
              <div className="p-2">
                 <table className="w-full text-left">
                   <tbody className="divide-y divide-white/10">
                     {[
                       { label: 'Genre', value: anime.genres.join(' | ') },
                       { label: 'Org. Run', value: `TV Series (${anime.year}–Present)` },
                       { label: 'Running Time', value: anime.duration || '24min' },
                       { label: 'Language', value: 'Japanese 2.0 – English 2.0' },
                       { label: ' ', value: '[BD] – Hindi 2.0', isSecondary: true },
                       { label: 'Episodes', value: anime.episodes },
                       { label: 'Subtitle', value: 'English, Signs & Songs' },
                       { label: 'Quality', value: '1080p FHD' },
                       { label: 'Encoder', value: 'Admin' },
                       { label: 'Up Credit', value: 'Admin' }
                     ].map((item, idx) => (
                       <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                         <td className="py-4 px-4 md:px-6 text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] w-[130px] md:w-[180px] align-top">{item.label}</td>
                         <td className={`py-4 px-4 md:px-6 text-xs md:text-[13px] font-bold text-text-dim group-hover:text-white transition-colors ${item.isSecondary ? 'pt-0' : ''}`}>
                           {item.value}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-brand-primary font-black text-xs uppercase tracking-[0.3em]">EPISODE LIST</h3>
              <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {anime.episodesList.length} EPISODES
              </div>
            </div>

            <div className="space-y-4">
              {anime.episodesList.map((ep) => (
                <div 
                  key={ep.number}
                  className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden transition-all hover:border-brand-primary/30"
                >
                  <button 
                    onClick={() => setExpandedEpisode(expandedEpisode === ep.number ? null : ep.number)}
                    className="w-full p-6 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-6 text-left">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center font-black text-white border border-white/5 group-hover:bg-brand-primary group-hover:border-brand-primary transition-all">
                        {ep.number}
                      </div>
                      <div>
                        <h4 className="text-white font-bold group-hover:text-brand-primary transition-colors">{ep.title}</h4>
                        <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{ep.duration || '24:00'}</span>
                      </div>
                    </div>
                    {expandedEpisode === ep.number ? <ChevronUp size={20} className="text-text-dim" /> : <ChevronDown size={20} className="text-text-dim" />}
                  </button>

                  <AnimatePresence>
                    {expandedEpisode === ep.number && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5">
                          {ep.downloadLinks.map((link, idx) => (
                            <a 
                              key={idx}
                              href={link.url}
                              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-brand-primary/20 hover:border-brand-primary/40 transition-all group/btn"
                            >
                              <div className="flex flex-col">
                                <span className="text-white font-bold text-sm tracking-tight">{link.quality}</span>
                                <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{link.size} • {link.provider}</span>
                              </div>
                              <Download size={18} className="text-text-dim group-hover/btn:text-white transition-colors" />
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 md:top-32 h-fit">
            <div className="flex flex-col gap-3 md:gap-4 p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-[32px] md:rounded-[40px] shadow-2xl">
              <h4 className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] mb-2">Anime Actions</h4>
              <button className="w-full bg-accent-gradient text-white h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 cursor-pointer">
                <Play size={18} fill="currentColor" /> STREAM IN 4K
              </button>
              <button 
                onClick={handleToggleFavorite}
                className={`w-full h-12 md:h-14 border rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-sm transition-all cursor-pointer ${isSaved ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white/5 border-border-subtle text-white hover:bg-white/10'}`}
              >
                <Plus size={18} className={`mr-2 transition-transform duration-300 ${isSaved ? 'rotate-45' : ''}`} /> 
                {isSaved ? 'IN YOUR COLLECTION' : 'ADD TO MY LIST'}
              </button>
              <button className="w-full h-12 md:h-14 bg-white/5 border border-border-subtle rounded-xl md:rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer font-black text-[10px] md:text-xs uppercase tracking-widest">
                <Share2 size={18} className="mr-2" /> Share Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-20 md:mt-32">
        <div className="flex items-center justify-between mb-8 overflow-hidden">
          <h3 className="text-brand-primary font-black text-[10px] md:text-xs uppercase tracking-[0.3em] whitespace-nowrap">RECOMMENDED ANIMES</h3>
          <div className="hidden md:block w-[60%] h-px bg-white/5 ml-8" />
        </div>
        
        <div className="relative group">
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x select-none">
            {(anime.relatedAnimes || []).map((rel) => (
              <div key={rel.id} className="snap-start">
                <AnimeCard 
                  anime={rel} 
                  onClick={(a) => navigate(`/anime/${a.id}`)}
                  variant="compact"
                />
              </div>
            ))}
          </div>
          
          {/* Subtle gradient fades for scroll indication */}
          <div className="absolute top-0 left-0 bottom-8 w-12 bg-gradient-to-r from-bg-dark to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-bg-dark to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </section>
    </motion.div>
  );
}
