import React, { useEffect, useState } from "react";
import HeroCarousel from "../components/HeroCarousel";
import SearchHero from "../components/SearchHero";
import GenreCategories from "../components/GenreCategories";
import AnimeCard from "../components/AnimeCard";
import AnimeDetailModal from "../components/AnimeDetailModal";
import SkeletonCard from "../components/SkeletonCard";
import { Anime } from "../types";
import { getTrendingAnime, getCategoryAnime } from "../services/geminiService";
import { fetchAnimes } from "../services/animeService";
import { LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

type SectionType = 'Recent' | 'Series' | 'Movies' | 'Popular';

export default function HomePage() {
  const navigate = useNavigate();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('Recent');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

   const fetchInitialData = async () => {
     setIsLoading(true);
     try {
       // Try fetching from real DB first
       const dbAnimes = await fetchAnimes();
       if (dbAnimes && dbAnimes.length > 0) {
         setAnimes(dbAnimes);
       } else {
         // Fallback to AI if DB is empty
         const trending = await getTrendingAnime();
         setAnimes(trending);
       }
     } catch (error) {
       console.error("Failed to fetch initial data:", error);
       // Fallback to AI on error
       const trending = await getTrendingAnime();
       setAnimes(trending);
     }
     setIsLoading(false);
   };

  const handleSectionSwitch = async (section: SectionType) => {
    setActiveSection(section);
    setIsLoading(true);
    const category = section === 'Recent' ? 'Popular' : section;
    const data = await getCategoryAnime(category, 1);
    setAnimes(data);
    setIsLoading(false);
  };

  return (
    <div className="pb-20">
      <SearchHero onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)} isLoading={false} />
      
      <HeroCarousel />

      <GenreCategories onSelect={(genre) => navigate(`/search?genre=${encodeURIComponent(genre)}`)} />

      <div id="results" className="max-w-7xl mx-auto px-6 md:px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-border-subtle w-fit overflow-x-auto no-scrollbar">
            {(['Recent', 'Series', 'Movies', 'Popular'] as SectionType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleSectionSwitch(tab)}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeSection === tab 
                  ? "bg-white text-bg-dark shadow-xl" 
                  : "text-text-dim hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors hidden md:block">
            View All Archives
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {isLoading ? (
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : animes.length > 0 ? (
            animes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onClick={(a) => setSelectedAnime(a)} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-bg-card/30 rounded-3xl border border-dashed border-border-subtle">
              <LayoutGrid size={24} className="text-text-dim opacity-40 mx-auto mb-6" />
              <h3 className="text-lg font-bold mb-1 text-white">No matches found</h3>
            </div>
          )}
        </div>
      </div>

      <AnimeDetailModal anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
    </div>
  );
}
