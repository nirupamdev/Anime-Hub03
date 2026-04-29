import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search as SearchIcon, Filter, X, Sparkles, LayoutGrid, List, 
  ChevronDown, ArrowUpDown, Loader2, History, TrendingUp,
  SlidersHorizontal, Star, ChevronLeft, ChevronRight
} from "lucide-react";
import { searchAnime, getAutocompleteSuggestions } from "../services/geminiService";
import { Anime } from "../types";
import AnimeCard from "../components/AnimeCard";
import AnimeDetailModal from "../components/AnimeDetailModal";
import SkeletonCard from "../components/SkeletonCard";

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Sports"];
const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "Earlier"];
const QUALITIES = ["4K UHD", "1080p Web-DL", "720p HD", "480p SD"];
const RATINGS = ["9.0+", "8.0+", "7.0+", "6.0+"];
const STATUSES = ["Airing", "Completed", "Hiatus"];
const TYPES = ["TV", "OVA", "ONA", "Movie"];
const SORT_OPTIONS = ["Popularity", "Rating", "Newest", "A-Z"];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get("q") || "";
  const genreParam = searchParams.get("genre") || "";
  const categoryParam = searchParams.get("category") || "";
  const sortParam = searchParams.get("sort") || "";
  const pageParam = parseInt(searchParams.get("page") || "1");

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [searchInput, setSearchInput] = useState(queryParam);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(JSON.parse(localStorage.getItem('recentSearches') || '[]'));
  
  const [filters, setFilters] = useState({
    genre: genreParam,
    year: "",
    rating: "",
    quality: "",
    status: "",
    type: "",
    category: categoryParam
  });
  const [sortBy, setSortBy] = useState(sortParam || "Popularity");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters(f => ({ ...f, genre: genreParam, category: categoryParam }));
    setSortBy(sortParam || "Popularity");
    setSearchInput(queryParam);
    setCurrentPage(pageParam);
  }, [queryParam, genreParam, categoryParam, sortParam, pageParam]);

  useEffect(() => {
    fetchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [queryParam, genreParam, categoryParam, sortParam, filters, sortBy, currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchResults = async () => {
    setIsLoading(true);
    const combinedFilters = { ...filters, sort: sortBy };
    const results = await searchAnime(queryParam || genreParam || categoryParam, currentPage, combinedFilters);
    setAnimes(results);
    setIsLoading(false);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    const updatedRecent = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    setSearchParams({ q, page: "1" });
    setSearchInput(q);
    setShowSuggestions(false);
  };

  const updateSuggestions = useCallback(async (val: string) => {
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    const data = await getAutocompleteSuggestions(val);
    setSuggestions(data);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    updateSuggestions(val);
    setShowSuggestions(true);
  };

  const FilterGroup = ({ title, options, field }: { title: string, options: string[], field: keyof typeof filters }) => (
    <div className="mb-8">
      <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              const newValue = filters[field] === opt ? "" : opt;
              setFilters({ ...filters, [field]: newValue });
              handlePageChange(1);
            }}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
              filters[field] === opt 
              ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" 
              : "bg-white/5 border-border-subtle text-text-dim hover:text-white hover:bg-white/10"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-8 pb-20 relative">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-32">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-white font-black text-xl tracking-tighter flex items-center gap-2">
                <SlidersHorizontal size={20} className="text-brand-primary" /> FILTERS
              </h3>
              {(filters.genre || filters.year || filters.rating || filters.quality || filters.status || filters.type) && (
                <button 
                  onClick={() => {
                    setFilters({ genre: "", year: "", rating: "", quality: "", status: "", type: "", category: "" });
                    handlePageChange(1);
                  }}
                  className="text-[10px] font-bold text-text-dim hover:text-white uppercase tracking-widest"
                >
                  Reset
                </button>
              )}
            </div>

            <FilterGroup title="Genre" options={GENRES} field="genre" />
            <FilterGroup title="Status" options={STATUSES} field="status" />
            <FilterGroup title="Type" options={TYPES} field="type" />
            <FilterGroup title="Release Year" options={YEARS} field="year" />
            <FilterGroup title="Min. Rating" options={RATINGS} field="rating" />
            <FilterGroup title="Quality" options={QUALITIES} field="quality" />
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Search Header */}
          <div className="mb-12 relative" ref={containerRef}>
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-text-dim group-focus-within:text-brand-primary transition-colors">
                <SearchIcon size={24} />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={onInputChange}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                placeholder="Search for animes, series, or quality..."
                className="w-full bg-white/5 border border-border-subtle h-20 pl-20 pr-32 rounded-[24px] text-white font-bold text-xl placeholder:text-text-dim focus:bg-white/10 focus:border-brand-primary outline-none transition-all shadow-2xl"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchInput && (
                  <button onClick={() => setSearchInput("")} className="p-2 text-text-dim hover:text-white">
                    <X size={20} />
                  </button>
                )}
                <button 
                  onClick={() => handleSearch(searchInput)}
                  className="bg-brand-primary text-white h-12 px-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && (searchInput.length > 0 || recentSearches.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 w-full mt-4 bg-bg-card border border-border-subtle rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                >
                  {suggestions.length > 0 && (
                    <div className="p-6">
                      <h5 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <TrendingUp size={12} /> Sugggestions
                      </h5>
                      <div className="space-y-1">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(s)}
                            className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-white font-bold transition-colors flex items-center gap-3"
                          >
                            <SearchIcon size={14} className="text-text-dim" /> {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {recentSearches.length > 0 && (
                    <div className="p-6 bg-white/[0.02]">
                       <h5 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <History size={12} /> Recent Searches
                      </h5>
                       <div className="flex flex-wrap gap-2">
                          {recentSearches.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSearch(s)}
                              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-text-dim hover:text-white hover:border-brand-primary/30 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 bg-white/5 p-4 rounded-3xl border border-border-subtle">
             <div className="flex items-center gap-4">
                <div className="text-xs font-bold text-text-dim uppercase tracking-widest pl-4">
                  {animes.length} Results found
                </div>
                <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary/20 text-brand-primary font-bold text-xs uppercase tracking-widest"
                >
                  <Filter size={16} /> Filters
                </button>
             </div>

             <div className="flex items-center gap-4">
                <div className="relative group">
                  <button className="flex items-center gap-3 px-5 h-12 bg-white/5 border border-border-subtle rounded-2xl text-white font-bold text-xs uppercase tracking-widest hover:border-brand-primary/40 transition-all">
                    <ArrowUpDown size={16} className="text-brand-primary" /> Sort: {sortBy} <ChevronDown size={14} />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-bg-card border border-border-subtle rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                    {SORT_OPTIONS.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          handlePageChange(1);
                        }}
                        className="w-full text-left p-4 hover:bg-white/5 text-xs font-bold text-text-dim hover:text-white transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                   <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-bg-dark shadow-lg' : 'text-text-dim hover:text-white'}`}
                   >
                     <LayoutGrid size={18} />
                   </button>
                   <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-bg-dark shadow-lg' : 'text-text-dim hover:text-white'}`}
                   >
                     <List size={18} />
                   </button>
                </div>
             </div>
          </div>

          {/* Results Grid/List */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
              {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : animes.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8" : "space-y-6"}>
              {animes.map((anime) => (
                viewMode === 'grid' ? (
                  <AnimeCard key={anime.id} anime={anime} onClick={(a) => setSelectedAnime(a)} />
                ) : (
                  <motion.div 
                    key={anime.id} 
                    layout
                    onClick={() => setSelectedAnime(anime)}
                    className="flex gap-8 p-6 bg-bg-card border border-border-subtle rounded-[32px] group hover:border-brand-primary/40 transition-all cursor-pointer"
                  >
                    <div className="w-32 h-44 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
                      <img src={anime.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                    <div className="flex-1 py-2">
                       <div className="flex items-center gap-3 mb-4">
                        <span className="px-2 py-0.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md">{anime.status}</span>
                        <span className="px-2 py-0.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-md">{anime.type}</span>
                        <div className="flex gap-2">
                          {anime.genres.slice(0, 3).map(g => (
                            <span key={g} className="text-text-dim text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                       </div>
                       <h3 className="text-2xl font-black text-white mb-3 group-hover:text-brand-primary transition-colors tracking-tighter leading-tight">{anime.title}</h3>
                       <p className="text-text-dim text-sm line-clamp-2 leading-relaxed opacity-60 mb-6">{anime.synopsis}</p>
                       <div className="flex items-center gap-6 text-[11px] font-bold text-text-dim uppercase tracking-[0.2em]">
                         <span className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {anime.rating}</span>
                         <span>{anime.year}</span>
                         <span>{anime.episodes} EPISODES</span>
                       </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            <div className="py-40 text-center bg-bg-card/30 rounded-[40px] border border-dashed border-border-subtle">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
                 <SearchIcon size={32} className="text-text-dim opacity-30" />
               </div>
               <h3 className="text-2xl font-black text-white mb-2">No transmissions detected</h3>
               <p className="text-text-dim font-medium max-w-sm mx-auto opacity-60">
                 Adjust your frequencies (filters) or try searching for another dimension.
               </p>
            </div>
          )}

          {animes.length > 0 && !isLoading && (
            <div className="mt-20 flex justify-center items-center gap-4">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => {
                  // Show 5 pages around the current page
                  let pageNum;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xs font-black transition-all ${
                        currentPage === pageNum 
                        ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                        : 'bg-white/5 border-border-subtle text-text-dim hover:text-white hover:border-brand-primary/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-12 h-12 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center text-white hover:bg-white/10 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-[85%] bg-bg-dark border-l border-border-subtle p-8 z-[101] lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                 <h3 className="text-white font-black text-2xl tracking-tighter">FILTER TITLES</h3>
                 <button onClick={() => setShowMobileFilters(false)} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white">
                   <X size={24} />
                 </button>
              </div>
              <FilterGroup title="Genre" options={GENRES} field="genre" />
              <FilterGroup title="Status" options={STATUSES} field="status" />
              <FilterGroup title="Type" options={TYPES} field="type" />
              <FilterGroup title="Release Year" options={YEARS} field="year" />
              <FilterGroup title="Min. Rating" options={RATINGS} field="rating" />
              <FilterGroup title="Quality" options={QUALITIES} field="quality" />
              
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-full h-16 bg-brand-primary text-white font-black text-lg uppercase tracking-widest rounded-2xl mt-12"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimeDetailModal anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
    </div>
  );
}
