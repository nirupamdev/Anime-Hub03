import React, { useState } from "react";
import { Zap, Search, User, Bell, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Search', path: '/search' },
    { label: 'Latest', path: '/search?sort=Newest' },
    { label: 'Series', path: '/search?category=Series' },
    { label: 'Movies', path: '/search?category=Movies' },
    { label: 'My List', path: '/list' },
    { label: 'Admin', path: '/admin' },
    { label: 'DMCA', path: '/dmca' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0F]/70 backdrop-blur-[12px] border-b border-border-subtle h-20 px-6 md:px-10 flex items-center justify-between" aria-label="Main navigation">
      <Link to="/" className="flex items-center gap-3 cursor-pointer group" aria-label="Kaizen Home">
        <div className="w-9 h-9 bg-accent-gradient rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <span className="text-2xl font-black text-white tracking-tighter hidden sm:block">
          KAIZEN<span className="text-brand-primary">.</span>NET
        </span>
      </Link>

      <ul className="hidden lg:flex items-center gap-10">
        {menuItems.map((item) => (
          <li key={item.label}>
            <Link
              to={item.path}
              className={`text-[12px] font-bold transition-colors uppercase tracking-[0.2em] relative py-2 ${
                pathname === item.path ? 'text-white' : 'text-text-dim hover:text-white'
              }`}
              aria-current={pathname === item.path ? "page" : undefined}
            >
              {item.label}
              {pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent-gradient rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 md:gap-8">
        <Link to="/search" className="p-2 text-text-dim hover:text-white transition-colors flex items-center justify-center" aria-label="Search database">
          <Search size={20} />
        </Link>
        <button className="p-2 text-text-dim hover:text-white transition-colors relative hidden sm:flex items-center justify-center" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border border-[#0B0B0F]" />
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden text-white p-2 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center"
          aria-label="Open mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-[85%] bg-gradient-to-b from-[#0F0F13] to-[#050510] border-l border-white/5 z-[101] lg:hidden flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] overflow-y-auto pointer-events-auto no-scrollbar"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile menu"
            >
              <div className="p-8 pb-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                    <Zap className="text-white fill-white" size={20} />
                  </div>
                  <span className="text-2xl font-black text-white tracking-tighter">KAIZEN<span className="text-brand-primary">.</span>NET</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/5"
                  aria-label="Close mobile menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-4 py-4 flex flex-col">
                <ul className="flex flex-col gap-1.5">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <li key={item.label} className="flex-shrink-0">
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`relative group px-5 py-3.5 rounded-[16px] transition-all duration-300 flex items-center ${
                            isActive 
                            ? 'bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]' 
                            : 'hover:bg-white/5 border border-transparent'
                          }`}
                          aria-current={isActive ? "page" : undefined}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="activeIndicator"
                              className="absolute left-0 w-1.5 h-6 bg-gradient-to-b from-brand-primary to-purple-400 rounded-r-full shadow-[0_0_15px_rgba(124,58,237,0.6)]"
                            />
                          )}
                          <span className={`text-lg font-semibold tracking-wide transition-colors ${
                            isActive 
                            ? 'bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent' 
                            : 'text-white/70 group-hover:text-white'
                          }`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto">
                              <div className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(124,58,237,1)]" />
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
