import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Info, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tags: string[];
  link: string;
}

const MOCK_BANNERS: Banner[] = [
  {
    id: "1",
    title: "Solo Leveling",
    subtitle: "In a world of hunters, the weakest must rise to become the strongest monarch.",
    imageUrl: "https://images.unsplash.com/photo-1540224871915-bc8ffb782bdf?q=80&w=2000&auto=format&fit=crop",
    tags: ["Action", "Fantasy", "Featured"],
    link: "/anime/1"
  },
  {
    id: "2",
    title: "Jujutsu Kaisen",
    subtitle: "A boy swallows a cursed finger and enters a world of sorcerers and spirits.",
    imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2000&auto=format&fit=crop",
    tags: ["Action", "Drama", "Supernatural"],
    link: "/anime/2"
  },
  {
    id: "3",
    title: "Blue Lock",
    subtitle: "Japan's search for the ultimate egoist striker begins in the Blue Lock facility.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
    tags: ["Sports", "Bento", "Popular"],
    link: "/anime/3"
  },
  {
    id: "4",
    title: "Vanguard: Final Front",
    subtitle: "The last surviving squadron prepares for the ultimate siege against the Void King.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop",
    tags: ["Sci-Fi", "Action", "Latest"],
    link: "/anime/4"
  },
  {
    id: "5",
    title: "Cyberpunk: Edgerunners",
    subtitle: "A street kid trying to survive in a technology and body modification-obsessed city of the future.",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2000&auto=format&fit=crop",
    tags: ["Sci-Fi", "Thriller", "Action"],
    link: "/anime/5"
  },
  {
    id: "6",
    title: "Spy x Family",
    subtitle: "A spy, an assassin, and a telepath form a fake family for their own hidden agendas.",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop",
    tags: ["Comedy", "Action", "Slice of Life"],
    link: "/anime/6"
  },
  {
    id: "7",
    title: "Chainsaw Man",
    subtitle: "An impoverished young man who works as a Devil Hunter with his pet devil.",
    imageUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2000&auto=format&fit=crop",
    tags: ["Gore", "Action", "Supernatural"],
    link: "/anime/7"
  },
  {
    id: "8",
    title: "Kaguya-sama: Love is War",
    subtitle: "Two geniuses at the top of their school battle to make the other confess their love first.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop",
    tags: ["Romance", "Comedy", "School"],
    link: "/anime/8"
  },
  {
    id: "9",
    title: "Demon Slayer",
    subtitle: "Tanjiro Kamado sets out to become a demon slayer after his family is slaughtered.",
    imageUrl: "https://images.unsplash.com/photo-1524169358666-79f22534bc6e?q=80&w=2000&auto=format&fit=crop",
    tags: ["Action", "Fantasy", "Swordplay"],
    link: "/anime/9"
  },
  {
    id: "10",
    title: "Attack on Titan",
    subtitle: "Humanity fights for survival against giant humanoid creatures known as Titans.",
    imageUrl: "https://images.unsplash.com/photo-1578632738988-6888af4a1eb0?q=80&w=2000&auto=format&fit=crop",
    tags: ["Action", "Dark Fantasy", "Legendary"],
    link: "/anime/10"
  }
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % MOCK_BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + MOCK_BANNERS.length) % MOCK_BANNERS.length);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 3000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const currentBanner = MOCK_BANNERS[index];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-0 pt-4 md:pt-0" role="region" aria-roledescription="carousel" aria-label="Featured content carousel">
      <div 
        className="relative aspect-[4/5] sm:aspect-square md:aspect-[2/1] max-h-[520px] w-full rounded-[30px] md:rounded-[40px] overflow-hidden border border-border-subtle bg-[#08080A] shadow-2xl group flex items-center justify-center text-center md:text-left"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.4 }
              }}
              className="absolute inset-0 w-full h-full"
            >
               <img 
                src={currentBanner.imageUrl} 
                className="absolute inset-0 w-full h-full object-cover select-none opacity-60 brightness-75 scale-105 group-hover:scale-100 transition-transform duration-700"
                alt={currentBanner.title}
                loading="lazy"
               />
               
               {/* Fixed Overlay Gradients for Readability */}
               <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

               {/* Content */}
               <div className="relative z-20 w-full h-full flex flex-col justify-end md:justify-center px-6 pb-16 md:pb-0 md:px-24">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start"
                  >
                    <div className="px-3 py-1 bg-accent-gradient rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                      <Sparkles size={10} className="text-white fill-white" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white">Featured Now</span>
                    </div>
                    {currentBanner.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white/60">
                        {tag}
                      </span>
                    ))}
                  </motion.div>

                   <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-2 md:mb-4 uppercase tracking-tighter leading-none"
                  >
                    {currentBanner.title}
                  </motion.h1>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/70 text-[12px] md:text-base max-w-lg mb-6 md:mb-10 font-medium leading-relaxed line-clamp-3 mx-auto md:mx-0"
                  >
                    {currentBanner.subtitle}
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center md:justify-start gap-3 md:gap-4"
                  >
                    <button 
                      onClick={() => navigate(currentBanner.link)}
                      className="bg-accent-gradient text-white h-10 md:h-12 px-6 md:px-10 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] cursor-pointer"
                    >
                      <Play size={16} fill="currentColor" /> Watch Now
                    </button>
                    <button 
                      onClick={() => navigate(currentBanner.link)}
                      className="bg-white/10 backdrop-blur-xl border border-white/10 text-white h-10 md:h-12 px-6 md:px-10 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <Info size={16} /> Details
                    </button>
                  </motion.div>
               </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Improved Navigation Arrows */}
        <div className="absolute inset-y-0 left-8 flex items-center z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-brand-primary transition-all shadow-xl cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-8 flex items-center z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={nextSlide}
            className="w-12 h-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-brand-primary transition-all shadow-xl cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Centered Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30" role="tablist" aria-label="Slides">
          {MOCK_BANNERS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                i === index ? "w-12 h-1.5 bg-brand-primary shadow-[0_0_15px_rgba(124,58,237,0.6)]" : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Subtle Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5 z-40">
           {!isPaused && (
             <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
              className="h-full bg-brand-primary/50 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
             />
           )}
        </div>
      </div>
    </div>
  );
}
