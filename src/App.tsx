import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import MyListPage from "./pages/MyListPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import DMCAPage from "./pages/DMCAPage";
import { ArrowUp } from "lucide-react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen scanline relative flex flex-col">
      {!isAdminPage && <Navbar />}
      
      <main className="flex-grow pt-20 pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/list" element={<MyListPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          <Route path="/admin/nirupam" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
      {!isAdminPage && <BottomNav />}

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-10 right-10 z-40 w-14 h-14 bg-brand-primary text-white rounded-2xl shadow-2xl shadow-brand-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent pointer-events-none" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
