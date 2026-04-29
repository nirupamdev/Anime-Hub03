import React from "react";
import { Home, Search, Bookmark, User, Clock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";

export default function BottomNav() {
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Latest', path: '/search?sort=Newest', icon: Clock },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'My List', path: '/list', icon: Bookmark },
    { label: 'Profile', path: '/admin/nirupam', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-[#0B0B0F]/80 backdrop-blur-xl border-t border-white/5 px-4 h-20 flex items-center justify-around pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path.split('?')[0]));
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1.5 min-w-[64px] relative group"
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavActive"
                className="absolute -top-3 w-8 h-1 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(124,58,237,1)]"
              />
            )}
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${
              isActive 
              ? "text-brand-primary bg-brand-primary/10" 
              : "text-text-dim group-hover:text-white"
            }`}>
              <Icon size={22} className={isActive ? "fill-brand-primary/20" : ""} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
              isActive ? "text-white" : "text-text-dim group-hover:text-white"
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
