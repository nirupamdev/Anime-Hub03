import { Search, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchHero({ onSearch, isLoading }: SearchHeroProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="relative pt-32 pb-16 px-8 min-h-[500px] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl relative h-[420px] bg-gradient-to-br from-[#1A1A24] to-[#08080A] rounded-[32px] border border-border-subtle overflow-hidden flex items-center p-12 md:p-24 text-left shadow-2xl"
      >
        {/* Background Accent Animation */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-gradient-to-l from-brand-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-primary/10 blur-[100px] rounded-full" />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/20 backdrop-blur-xl border border-brand-primary/30 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.1)]"
          >
            <Sparkles size={11} className="text-brand-primary fill-brand-primary" />
            <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-white whitespace-nowrap">
              Vanguard Season 2 Premieres Tomorrow
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 leading-none text-white uppercase italic">
            KAIZEN<span className="text-brand-primary">.</span>NET
          </h1>
          <h2 className="text-xl md:text-3xl font-bold text-white/50 mb-8 tracking-tight">AI-POWERED ANIME CORE</h2>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-6"
          >
            <div className="relative flex flex-col md:flex-row items-stretch md:items-center bg-[#1C1C24] border border-border-subtle rounded-2xl p-1.5 focus-within:border-brand-primary shadow-2xl transition-all gap-2">
              <div className="flex items-center flex-1">
                <div className="pl-4 text-text-dim">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search database..."
                  aria-label="Search anime titles or categories"
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-white placeholder-text-dim/40 font-bold text-sm"
                />
              </div>
              <button
                disabled={isLoading}
                aria-label="Search"
                className="bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 transition-all text-white font-black px-8 py-3.5 md:py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 cursor-pointer"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : "SEARCH"}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
               <div className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                 <TrendingUp size={12} /> TRENDING:
               </div>
               <div className="flex flex-wrap gap-x-4 gap-y-2">
                 {['Solo Leveling', 'Blue Lock', 'Overlord'].map(t => (
                   <button 
                    key={t}
                    type="button"
                    onClick={() => onSearch(t)}
                    className="text-[10px] font-bold text-text-dim hover:text-white transition-colors uppercase tracking-widest"
                   >
                     {t}
                   </button>
                 ))}
               </div>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
