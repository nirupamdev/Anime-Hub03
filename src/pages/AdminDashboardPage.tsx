import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { io, Socket } from "socket.io-client";
import { 
  LayoutDashboard, Users, Heart, Activity, LogOut, ShieldCheck, Database, 
  FileText, Tag, MessageSquare, BarChart3, Settings, Plus, Edit2, Trash2, 
  Eye, EyeOff, Search, ChevronRight, Globe, TrendingUp, SearchIcon, Copy, Filter,
  Hash, Image as ImageIcon, Type, Save, File, X, Sparkles, CheckSquare, Square,
  Loader2, Upload, Menu, ListOrdered, Play
} from "lucide-react";
import { 
  isAdminAuthenticated, logoutAdmin, adminGetAnimes, adminDeleteAnime, 
  adminCreateAnime, adminUpdateAnime, adminGetComments, adminDeleteComment, 
  adminUpdateComment, adminGetTaxonomies, adminCreateTaxonomy, adminDeleteTaxonomy, 
  adminGetAnalytics, adminGetPages, adminCreatePage, adminUpdatePage, adminDeletePage,
  adminGetActivities, adminBulkDeleteAnimes, adminBulkStatusAnimes, adminBulkDeletePages
} from "../services/adminService";
import { getSEOSuggestions, SEOSuggestion } from "../services/geminiService";
import { Anime, Comment, TaxonomyEntry, Page, ActivityLog } from "../types";

type AdminTab = "dashboard" | "posts" | "pages" | "taxonomies" | "comments" | "analytics" | "seo" | "activity";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [taxonomies, setTaxonomies] = useState<TaxonomyEntry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityFilter, setActivityFilter] = useState({ action: "All", user: "All" });
  const [analytics, setAnalytics] = useState<any>(null);
  
  // SEO state
  const [globalSeoTitle, setGlobalSeoTitle] = useState("OmniStream - High Fidelity Anime Streaming");
  const [globalSeoDesc, setGlobalSeoDesc] = useState("Watch the latest anime entries in 4K resolution. Direct downloads and multiple encoding qualities available for premium members.");
  const [seoSuggestions, setSeoSuggestions] = useState<SEOSuggestion[]>([
    {
      title: "Keyword Optimization",
      description: "Increase keyword density for 'Streaming' in about-us page",
      impact: "High",
      effort: "Easy"
    },
    {
      title: "Alt Text Audit",
      description: "Add Alt text to 14 legacy anime thumbnails",
      impact: "Medium",
      effort: "Easy"
    },
    {
      title: "Speed Optimization",
      description: "Reduce homepage load time by optimizing hero assets",
      impact: "High",
      effort: "Moderate"
    },
    {
      title: "Schema Markup",
      description: "Implement Schema.org Movie markup for all anime pages",
      impact: "High",
      effort: "Complex"
    }
  ]);
  const [isAuditingSeo, setIsAuditingSeo] = useState(false);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingTax, setEditingTax] = useState<TaxonomyEntry | null>(null);
  const [modalType, setModalType] = useState<"anime" | "page">("anime");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Selection States
  const [selectedAnimes, setSelectedAnimes] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/nirupam");
      return;
    }
    fetchData();

    // Initialize Socket
    socketRef.current = io();

    const onAnimeCreated = (newAnime: any) => {
      setAnimes(prev => [newAnime, ...prev]);
      setAnalytics((prev: any) => prev ? { ...prev, totalAnimes: (prev.totalAnimes || 0) + 1 } : prev);
    };

    const onAnimeUpdated = ({ id, updates }: any) => {
      setAnimes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const onAnimeDeleted = (id: string) => {
      setAnimes(prev => prev.filter(a => a.id !== id));
      setAnalytics((prev: any) => prev ? { ...prev, totalAnimes: Math.max(0, (prev.totalAnimes || 0) - 1) } : prev);
    };

    const onPageCreated = (newPage: any) => {
      setPages(prev => [newPage, ...prev]);
    };

    const onPageUpdated = ({ id, updates }: any) => {
      setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const onPageDeleted = (id: string) => {
      setPages(prev => prev.filter(p => p.id !== id));
    };

    const onActivityLogged = (log: any) => {
      setActivities(prev => [log, ...prev].slice(0, 100));
    };

    const onCommentUpdated = ({ id, updates }: any) => {
      setComments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const onCommentDeleted = (id: string) => {
      setComments(prev => prev.filter(c => c.id !== id));
      setAnalytics((prev: any) => prev ? { ...prev, totalComments: Math.max(0, (prev.totalComments || 0) - 1) } : prev);
    };

    socketRef.current.on("animeCreated", onAnimeCreated);
    socketRef.current.on("animeUpdated", onAnimeUpdated);
    socketRef.current.on("animeDeleted", onAnimeDeleted);
    socketRef.current.on("pageCreated", onPageCreated);
    socketRef.current.on("pageUpdated", onPageUpdated);
    socketRef.current.on("pageDeleted", onPageDeleted);
    socketRef.current.on("activityLogged", onActivityLogged);
    socketRef.current.on("commentUpdated", onCommentUpdated);
    socketRef.current.on("commentDeleted", onCommentDeleted);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("animeCreated", onAnimeCreated);
        socketRef.current.off("animeUpdated", onAnimeUpdated);
        socketRef.current.off("animeDeleted", onAnimeDeleted);
        socketRef.current.off("pageCreated", onPageCreated);
        socketRef.current.off("pageUpdated", onPageUpdated);
        socketRef.current.off("pageDeleted", onPageDeleted);
        socketRef.current.off("activityLogged", onActivityLogged);
        socketRef.current.off("commentUpdated", onCommentUpdated);
        socketRef.current.off("commentDeleted", onCommentDeleted);
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate("/admin/nirupam");
      return;
    }
    fetchData();
  }, [navigate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const data = await adminGetAnalytics();
        setAnalytics(data);
      } else if (activeTab === "posts") {
        const data = await adminGetAnimes();
        setAnimes(data);
      } else if (activeTab === "pages") {
        const data = await adminGetPages();
        setPages(data);
      } else if (activeTab === "comments") {
        const data = await adminGetComments();
        setComments(data);
      } else if (activeTab === "taxonomies") {
        const data = await adminGetTaxonomies();
        setTaxonomies(data);
      } else if (activeTab === "analytics") {
        const data = await adminGetAnalytics();
        setAnalytics(data);
      } else if (activeTab === "activity") {
        const data = await adminGetActivities();
        setActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  const handleDeleteAnime = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await adminDeleteAnime(id);
      setAnimes(animes.filter(a => a.id !== id));
    }
  };

  const handleToggleHide = async (anime: Anime) => {
    const updated = { ...anime, isHidden: !anime.isHidden };
    await adminUpdateAnime(anime.id, { isHidden: !anime.isHidden });
    setAnimes(animes.map(a => a.id === anime.id ? updated : a));
  };

  const handleDeletePage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      await adminDeletePage(id);
      setPages(pages.filter(p => p.id !== id));
    }
  };

  const handleToggleHidePage = async (page: Page) => {
    const updated = { ...page, isHidden: !page.isHidden };
    await adminUpdatePage(page.id, { isHidden: !page.isHidden });
    setPages(pages.map(p => p.id === page.id ? updated : p));
  };

  const runSeoAudit = async () => {
    setIsAuditingSeo(true);
    try {
      const context = {
        settings: {
          title: globalSeoTitle,
          description: globalSeoDesc
        },
        stats: {
          totalAnimes: animes.length,
          genres: [...new Set(animes.flatMap(a => a.genres))].length,
          totalPages: pages.length,
          topAnimes: animes.slice(0, 5).map(a => a.title)
        }
      };
      const suggestions = await getSEOSuggestions(context);
      setSeoSuggestions(suggestions);
    } catch (error) {
      console.error("SEO Audit failed:", error);
    } finally {
      setIsAuditingSeo(false);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${activeTab === 'posts' ? selectedAnimes.length : selectedPages.length} selected items?`)) {
      if (activeTab === 'posts') {
        await adminBulkDeleteAnimes(selectedAnimes);
        setSelectedAnimes([]);
      } else {
        await adminBulkDeletePages(selectedPages);
        setSelectedPages([]);
      }
      fetchData();
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (activeTab === 'posts') {
      await adminBulkStatusAnimes(selectedAnimes, status);
      setSelectedAnimes([]);
      fetchData();
    }
  };

  const filteredActivities = activities.filter(log => {
    const actionMatch = activityFilter.action === "All" || log.action.toLowerCase().includes(activityFilter.action.toLowerCase());
    const userMatch = activityFilter.user === "All" || log.user.toLowerCase().includes(activityFilter.user.toLowerCase());
    return actionMatch && userMatch;
  });

  const uniqueUsers = ["All", ...new Set(activities.map(a => a.user))];
  const actionTypes = ["All", "Create", "Update", "Delete", "Login", "Taxonomy"];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-6 bg-[#0A0A0C] border-b border-white/5 sticky top-0 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
            <ShieldCheck size={18} />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-tighter">Nexus HQ</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-white/60 hover:text-white"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-72 bg-[#0A0A0C] border-r border-white/5 flex flex-col fixed md:sticky top-0 h-screen overflow-y-auto z-[120]"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                      <ShieldCheck size={24} />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase">Nexus <span className="text-brand-primary">HQ</span></span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-2">
                  <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<FileText size={20} />} label="Anime Posts" active={activeTab === "posts"} onClick={() => { setActiveTab("posts"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<File size={20} />} label="Pages" active={activeTab === "pages"} onClick={() => { setActiveTab("pages"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<Tag size={20} />} label="Taxonomies" active={activeTab === "taxonomies"} onClick={() => { setActiveTab("taxonomies"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<MessageSquare size={20} />} label="Comments" active={activeTab === "comments"} onClick={() => { setActiveTab("comments"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<Activity size={20} />} label="Activity Logs" active={activeTab === "activity"} onClick={() => { setActiveTab("activity"); setIsSidebarOpen(false); }} />
                  <NavItem icon={<Globe size={20} />} label="SEO Settings" active={activeTab === "seo"} onClick={() => { setActiveTab("seo"); setIsSidebarOpen(false); }} />
                </nav>
              </div>

              <div className="mt-auto p-8 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 bg-white/[0.03] hover:bg-red-500/10 px-6 py-4 rounded-2xl text-text-dim hover:text-red-500 font-bold text-xs transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={18} /> LOGOUT
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-12 overflow-x-hidden">
        <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-12 md:mb-16 gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase mb-2">
              {activeTab === "dashboard" && "Command Center"}
              {activeTab === "posts" && "Content Management"}
              {activeTab === "taxonomies" && "Classification"}
              {activeTab === "comments" && "User Feedback"}
              {activeTab === "analytics" && "Data Insights"}
              {activeTab === "activity" && "System Activity"}
              {activeTab === "seo" && "Search Optimization"}
            </h1>
            <div className="flex items-center gap-2 text-text-dim text-[10px] font-bold uppercase tracking-[0.3em]">
              <ShieldCheck size={12} className="text-brand-primary" /> System / Administrator / {activeTab}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
             {((activeTab === 'posts' && selectedAnimes.length > 0) || (activeTab === 'pages' && selectedPages.length > 0)) && (
                <div className="flex items-center gap-4 bg-brand-primary/10 border border-brand-primary/20 px-4 md:px-6 py-2 rounded-2xl animate-in fade-in slide-in-from-left-4 overflow-x-auto no-scrollbar">
                   <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest whitespace-nowrap">
                     {activeTab === 'posts' ? selectedAnimes.length : selectedPages.length} Selected
                   </span>
                   <div className="w-[1px] h-4 bg-brand-primary/20 flex-shrink-0" />
                   <button onClick={() => activeTab === 'posts' ? handleBulkStatus('Ongoing') : null} className="text-[10px] font-black text-white uppercase hover:text-brand-primary transition-colors whitespace-nowrap">Show</button>
                   <button onClick={() => activeTab === 'posts' ? handleBulkStatus('Hidden') : null} className="text-[10px] font-black text-white uppercase hover:text-brand-primary transition-colors whitespace-nowrap">Hide</button>
                   <button onClick={handleBulkDelete} className="text-[10px] font-black text-red-500 uppercase hover:text-red-400 transition-colors whitespace-nowrap">Delete</button>
                </div>
             )}
             <div className="relative group flex-grow xl:flex-grow-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Global Search..."
                  className="bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 h-12 text-sm font-medium focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all w-full xl:w-64"
                />
             </div>
             {(activeTab === "posts" || activeTab === "pages") && (
                <button 
                  onClick={() => { 
                    setEditingItem(null); 
                    setModalType(activeTab === "posts" ? "anime" : "page");
                    setIsModalOpen(true); 
                  }}
                  className="bg-brand-primary text-white h-12 px-6 rounded-2xl font-black text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex-shrink-0 ml-auto xl:ml-0"
                >
                  <Plus size={18} /> NEW {activeTab === "posts" ? "POST" : "PAGE"}
                </button>
             )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Prominent Action Bar */}
                <div className="bg-brand-primary/10 border border-brand-primary/20 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-brand-primary flex items-center justify-center text-white shadow-2xl shadow-brand-primary/40">
                      <Sparkles size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Ready to expand?</h2>
                      <p className="text-text-dim text-sm font-bold uppercase tracking-widest mt-1">Add new titles or pages to your stream library</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        setEditingItem(null);
                        setModalType("anime");
                        setIsModalOpen(true);
                      }}
                      className="flex-grow md:flex-initial bg-brand-primary text-white h-16 px-10 rounded-[24px] font-black text-sm flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/30 group"
                    >
                      <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> CREATE NEW POST
                    </button>
                    <button 
                      onClick={() => {
                        setEditingItem(null);
                        setModalType("page");
                        setIsModalOpen(true);
                      }}
                      className="bg-white/5 text-white h-16 px-8 rounded-[24px] font-black text-xs hover:bg-white/10 transition-all border border-white/5 uppercase tracking-widest"
                    >
                      New Page
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FileText size={24} />} label="Total Posts" value={analytics?.totalAnimes?.toString() || "0"} color="brand-primary" />
                <StatCard icon={<MessageSquare size={24} />} label="Comments" value={analytics?.totalComments?.toString() || "0"} color="blue-500" />
                <StatCard icon={<TrendingUp size={24} />} label="Daily Traffic" value="8.4K" color="green-500" />
                <StatCard icon={<Users size={24} />} label="Avg. Stay" value="4m 20s" color="pink-500" />
                <div className="lg:col-span-3 bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10">
                   <h2 className="text-xl font-black text-white mb-8 flex items-center gap-4"><BarChart3 className="text-brand-primary" /> TRAFFIC GROWTH</h2>
                   <div className="h-64 flex items-end justify-between gap-4">
                      {(analytics?.visits || [20, 50, 40, 80, 60, 90, 70]).map((v: number, i: number) => (
                         <div key={i} className="flex-grow bg-brand-primary/10 rounded-t-xl relative group">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${(v / 100) * 100}%` }}
                              className="w-full bg-brand-primary rounded-t-xl transition-all group-hover:bg-purple-400"
                            />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-bg-dark text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                               {v}K Visits
                            </div>
                         </div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-6 text-text-dim text-[10px] font-bold uppercase tracking-widest px-2">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </div>
                <div className="lg:col-span-1 bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10">
                   <h2 className="text-xl font-black text-white mb-8">SYSTEM HEALTH</h2>
                   <div className="space-y-8">
                      <HealthStatus label="Primary DB" status="Online" color="green-500" />
                      <HealthStatus label="Search Node" status="High Load" color="yellow-500" />
                      <HealthStatus label="Auth Engine" status="Offline" color="red-500" inverted />
                      <HealthStatus label="Storage CDN" status="Online" color="green-500" />
                   </div>
                </div>
              </div>
            </div>
          )}

            {activeTab === "posts" && (
              <div className="bg-[#0A0A0C] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <tr>
                        <th className="px-8 py-6 w-10">
                          <button 
                            onClick={() => {
                              if (selectedAnimes.length === animes.length) setSelectedAnimes([]);
                              else setSelectedAnimes(animes.map(a => a.id));
                            }}
                            className="text-white/20 hover:text-brand-primary transition-colors"
                          >
                            {selectedAnimes.length === animes.length ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Anime Title</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Genre</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {animes.map(anime => (
                        <tr key={anime.id} className={`hover:bg-white/[0.01] transition-colors group ${selectedAnimes.includes(anime.id) ? 'bg-brand-primary/[0.03]' : ''}`}>
                          <td className="px-8 py-6">
                             <button 
                               onClick={() => {
                                 if (selectedAnimes.includes(anime.id)) setSelectedAnimes(selectedAnimes.filter(id => id !== anime.id));
                                 else setSelectedAnimes([...selectedAnimes, anime.id]);
                               }}
                               className={`${selectedAnimes.includes(anime.id) ? 'text-brand-primary' : 'text-white/10'} hover:text-brand-primary transition-colors`}
                             >
                               {selectedAnimes.includes(anime.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                             </button>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
                                   <img src={anime.imageUrl} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">{anime.title}</p>
                                   <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{anime.id}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-wrap gap-2">
                                {anime.genres.slice(0, 2).map(g => (
                                   <span key={g} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-white/50">{g}</span>
                                ))}
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`flex items-center gap-2 ${anime.isHidden ? 'text-text-dim' : 'text-green-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${anime.isHidden ? 'bg-text-dim' : 'bg-green-500'} animate-pulse`} />
                                <span className="text-xs font-black uppercase tracking-widest">{anime.isHidden ? 'Hidden' : 'Visible'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center justify-end gap-2">
                                <ActionButton icon={anime.isHidden ? <Eye size={16} /> : <EyeOff size={16} />} onClick={() => handleToggleHide(anime)} />
                                <ActionButton icon={<Edit2 size={16} />} onClick={() => { setModalType("anime"); setEditingItem(anime); setIsModalOpen(true); }} />
                                <ActionButton icon={<Trash2 size={16} />} onClick={() => handleDeleteAnime(anime.id)} variant="danger" />
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "pages" && (
              <div className="bg-[#0A0A0C] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                      <tr>
                        <th className="px-8 py-6 w-10">
                          <button 
                            onClick={() => {
                              if (selectedPages.length === pages.length) setSelectedPages([]);
                              else setSelectedPages(pages.map(p => p.id));
                            }}
                            className="text-white/20 hover:text-brand-primary transition-colors"
                          >
                            {selectedPages.length === pages.length ? <CheckSquare size={18} /> : <Square size={18} />}
                          </button>
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Page Title</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Slug</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pages.map(page => (
                        <tr key={page.id} className={`hover:bg-white/[0.01] transition-colors group ${selectedPages.includes(page.id) ? 'bg-brand-primary/[0.03]' : ''}`}>
                          <td className="px-8 py-6">
                             <button 
                               onClick={() => {
                                 if (selectedPages.includes(page.id)) setSelectedPages(selectedPages.filter(id => id !== page.id));
                                 else setSelectedPages([...selectedPages, page.id]);
                               }}
                               className={`${selectedPages.includes(page.id) ? 'text-brand-primary' : 'text-white/10'} hover:text-brand-primary transition-colors`}
                             >
                               {selectedPages.includes(page.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                             </button>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-sm font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">{page.title}</p>
                             <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{page.id}</p>
                          </td>
                          <td className="px-8 py-6">
                             <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-white/50">{page.slug}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className={`flex items-center gap-2 ${page.isHidden ? 'text-text-dim' : 'text-green-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${page.isHidden ? 'bg-text-dim' : 'bg-green-500'} animate-pulse`} />
                                <span className="text-xs font-black uppercase tracking-widest">{page.isHidden ? 'Hidden' : 'Visible'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center justify-end gap-2">
                                <ActionButton icon={page.isHidden ? <Eye size={16} /> : <EyeOff size={16} />} onClick={() => handleToggleHidePage(page)} />
                                <ActionButton icon={<Edit2 size={16} />} onClick={() => { setModalType("page"); setEditingItem(page); setIsModalOpen(true); }} />
                                <ActionButton icon={<Trash2 size={16} />} onClick={() => handleDeletePage(page.id)} variant="danger" />
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "analytics" && analytics && (
               <div className="space-y-12">
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10">
                    <h2 className="text-xl font-black text-white mb-8 flex items-center gap-4 text-brand-primary"><BarChart3 /> TRAFFIC OVERVIEW (7 DAYS)</h2>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={(analytics.visits || [20, 50, 40, 80, 60, 90, 70]).map((v: number, i: number) => ({
                          name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
                          visits: v
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }} 
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ 
                              backgroundColor: '#0A0A0C', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '16px',
                              padding: '12px'
                            }}
                            itemStyle={{ color: '#7C3AED', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                            labelStyle={{ color: 'white', fontWeight: 900, marginBottom: '4px', fontSize: '12px' }}
                          />
                          <Bar 
                            dataKey="visits" 
                            radius={[8, 8, 0, 0]} 
                            barSize={40}
                          >
                            {(analytics.visits || [20, 50, 40, 80, 60, 90, 70]).map((_: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={index === 5 ? '#7C3AED' : 'rgba(124, 58, 237, 0.4)'} 
                                className="hover:fill-brand-primary transition-all duration-300"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                     <div className="bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10">
                        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-4 text-brand-primary"><TrendingUp /> TOP PERFORMING POSTS</h2>
                        <div className="space-y-6">
                      {(analytics?.topPosts || []).map((post: Anime, i: number) => (
                         <div key={post.id || i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-primary/20 transition-all">
                            <div className="flex items-center gap-4">
                               <span className="text-lg font-black text-white/20">#{i + 1}</span>
                               <p className="text-sm font-bold text-white">{post.title}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-brand-primary">{(10000 / (i + 1)).toLocaleString()} V</p>
                               <p className="text-[10px] text-text-dim font-bold uppercase">Estimated</p>
                            </div>
                         </div>
                      ))}
                        </div>
                     </div>
                     <div className="bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10">
                        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-4 text-purple-500"><BarChart3 /> IMPROVEMENT SUGGESTIONS</h2>
                        <div className="space-y-6">
                      {(analytics?.suggestions || []).map((s: string, i: number) => (
                         <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border-l-4 border-l-purple-500 flex gap-4">
                            <Settings className="text-purple-500 flex-shrink-0" size={20} />
                            <p className="text-sm font-medium text-white/80 leading-relaxed">{s}</p>
                         </div>
                      ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

             {activeTab === "seo" && (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-[40px] p-12">
                    <h2 className="text-2xl font-black text-white mb-10 tracking-tight flex items-center gap-4"><Globe className="text-brand-primary" /> SEO CONFIGURATOR</h2>
                    <div className="space-y-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-2">Default Meta Title</label>
                          <input 
                            type="text" 
                            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-sm font-medium focus:border-brand-primary/40 focus:bg-white/[0.08]" 
                            value={globalSeoTitle}
                            onChange={(e) => setGlobalSeoTitle(e.target.value)}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-2">Meta Description</label>
                          <textarea 
                            className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-6 text-white text-sm font-medium focus:border-brand-primary/40 focus:bg-white/[0.08] resize-none" 
                            value={globalSeoDesc}
                            onChange={(e) => setGlobalSeoDesc(e.target.value)}
                          />
                       </div>
                       <div className="p-8 rounded-[30px] bg-green-500/[0.03] border border-green-500/10 flex items-center gap-6">
                          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                             <SearchIcon size={24} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-white mb-1 uppercase tracking-widest">Google Ranking Status</h4>
                             <p className="text-xs text-text-dim leading-relaxed">Your current SEO score is 88/100. Indexed pages: 1.2K.</p>
                          </div>
                       </div>
                       <button className="bg-brand-primary text-white h-14 px-10 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all">SAVE GLOBAL SETTINGS</button>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10">
                       <div className="flex items-center justify-between mb-8">
                         <h2 className="text-xl font-black text-white flex items-center gap-4 text-purple-500"><TrendingUp /> SEO SUGGESTIONS</h2>
                         <button 
                           onClick={runSeoAudit}
                           disabled={isAuditingSeo}
                           className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] font-black text-purple-500 uppercase tracking-widest hover:bg-purple-500/20 disabled:opacity-50 transition-all"
                         >
                           {isAuditingSeo ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
                           {isAuditingSeo ? 'Analyzing...' : 'Run Audit'}
                         </button>
                       </div>
                       <div className="space-y-6">
                          {seoSuggestions.map((suggestion, i) => (
                             <div key={i} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col gap-6 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex gap-2">
                                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                    suggestion.impact === 'High' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                    suggestion.impact === 'Medium' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                    'bg-white/10 text-text-dim border border-white/5'
                                  }`}>Impact: {suggestion.impact}</span>
                                  <span className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black text-text-dim uppercase tracking-widest">Effort: {suggestion.effort}</span>
                                </div>
                                <div className="flex gap-6">
                                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0 text-lg font-black border border-purple-500/20 group-hover:scale-110 transition-transform">
                                    {i+1}
                                  </div>
                                  <div className="space-y-2 pr-24">
                                     <h4 className="text-sm font-black text-white uppercase tracking-wider">{suggestion.title}</h4>
                                     <p className="text-xs text-text-dim leading-relaxed font-medium">{suggestion.description}</p>
                                  </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
            )}
            
            {activeTab === "taxonomies" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-1 space-y-8">
                    <div className="bg-[#0A0A0C] border border-white/5 rounded-[30px] p-8">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Add New Entry</h3>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Type</label>
                             <select id="tax-type" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary appearance-none">
                                <option value="genre">Genre</option>
                                <option value="category">Category</option>
                                <option value="year">Year</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-1">Name</label>
                             <input id="tax-name" type="text" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" placeholder="e.g. Action" />
                          </div>
                          <button 
                            onClick={async () => {
                              const nameInput = document.getElementById('tax-name') as HTMLInputElement;
                              const typeSelect = document.getElementById('tax-type') as HTMLSelectElement;
                              if (nameInput.value) {
                                await adminCreateTaxonomy({ id: nameInput.value.toLowerCase().replace(/ /g, '-'), name: nameInput.value, type: typeSelect.value });
                                nameInput.value = "";
                                fetchData();
                              }
                            }}
                            className="w-full h-12 bg-white/5 border border-white/5 hover:border-brand-primary hover:bg-brand-primary/10 rounded-xl text-xs font-black text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                             <Plus size={16} /> Create Entry
                          </button>
                       </div>
                    </div>
                 </div>

                  <div className="lg:col-span-2">
                    <div className="bg-[#0A0A0C] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden">
                       <div className="overflow-x-auto no-scrollbar">
                         <table className="w-full text-left min-w-[600px]">
                          <thead className="bg-white/[0.02] border-b border-white/5">
                             <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Entry Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Type</th>
                                <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                             {taxonomies.map(tax => (
                                <tr key={tax.id} className="hover:bg-white/[0.01] transition-colors group">
                                   <td className="px-8 py-6">
                                      <p className="text-sm font-bold text-white mb-1">{tax.name}</p>
                                      <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{tax.id}</p>
                                   </td>
                                   <td className="px-8 py-6">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                         tax.type === 'genre' ? 'bg-blue-500/10 text-blue-500' :
                                         tax.type === 'year' ? 'bg-green-500/10 text-green-500' :
                                         'bg-purple-500/10 text-purple-500'
                                      }`}>
                                         {tax.type}
                                      </span>
                                   </td>
                                   <td className="px-8 py-6">
                                      <div className="flex items-center justify-end gap-2">
                                         <ActionButton 
                                           icon={<Edit2 size={16} />} 
                                           onClick={() => {
                                             setEditingTax(tax);
                                             setIsTaxModalOpen(true);
                                           }} 
                                         />
                                         <ActionButton 
                                           icon={<Trash2 size={16} />} 
                                           onClick={async () => {
                                             if (window.confirm("Delete this taxonomy?")) {
                                               await adminDeleteTaxonomy(tax.id);
                                               fetchData();
                                             }
                                           }} 
                                           variant="danger" 
                                         />
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>
           </div>
          )}

            {activeTab === "comments" && (
              <div className="bg-[#0A0A0C] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">User / Content</th>
                      <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Anime</th>
                      <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comments.map(comment => (
                      <tr key={comment.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6 max-w-md">
                           <p className="text-sm font-bold text-white mb-1">{comment.user}</p>
                           <p className="text-xs text-text-dim line-clamp-2">{comment.text}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs font-bold text-white uppercase tracking-wider">{comment.animeTitle}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              comment.isApproved ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                           }`}>
                              {comment.isApproved ? 'Approved' : 'Pending'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center justify-end gap-2">
                              {!comment.isApproved && (
                                <ActionButton 
                                  icon={<ShieldCheck size={16} />} 
                                  onClick={async () => {
                                    await adminUpdateComment(comment.id, { isApproved: true });
                                    fetchData();
                                  }} 
                                />
                              )}
                              <ActionButton 
                                icon={<Trash2 size={16} />} 
                                onClick={async () => {
                                  if (window.confirm("Delete this comment?")) {
                                    await adminDeleteComment(comment.id);
                                    fetchData();
                                  }
                                }} 
                                variant="danger" 
                              />
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 bg-[#0A0A0C] border border-white/5 p-6 rounded-[30px]">
                   <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <Filter size={14} className="text-brand-primary" />
                      <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Filters</span>
                   </div>
                   <select 
                     className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:border-brand-primary outline-none"
                     value={activityFilter.action}
                     onChange={(e) => setActivityFilter({ ...activityFilter, action: e.target.value })}
                   >
                     {actionTypes.map(type => <option key={type} value={type}>{type} Actions</option>)}
                   </select>
                   <select 
                     className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs font-bold text-white focus:border-brand-primary outline-none"
                     value={activityFilter.user}
                     onChange={(e) => setActivityFilter({ ...activityFilter, user: e.target.value })}
                   >
                     {uniqueUsers.map(user => <option key={user} value={user}>{user === "All" ? "All Users" : user}</option>)}
                   </select>
                </div>

                <div className="bg-[#0A0A0C] border border-white/5 rounded-[32px] md:rounded-[40px] overflow-hidden">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-white/[0.02] border-b border-white/5">
                        <tr>
                          <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Timestamp</th>
                          <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">User</th>
                          <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Action</th>
                          <th className="px-8 py-6 text-[10px] font-black text-text-dim uppercase tracking-widest">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredActivities.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center text-text-dim text-sm font-bold italic uppercase tracking-widest">
                              No matching activity found
                            </td>
                          </tr>
                        ) : (
                          filteredActivities.map((log, i) => (
                            <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                              <td className="px-8 py-6">
                                <p className="text-[10px] font-black text-white/40 uppercase tabular-nums">
                                  {new Date(log.timestamp).toLocaleString()}
                                </p>
                              </td>
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 text-[8px] font-black">
                                    {log.user.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-bold text-white">{log.user}</span>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                  log.action.toLowerCase().includes('delete') ? 'bg-red-500/10 text-red-500' : 
                                  log.action.toLowerCase().includes('create') ? 'bg-green-500/10 text-green-500' :
                                  'bg-brand-primary/10 text-brand-primary'
                                }`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <p className="text-xs text-text-dim font-medium">{log.details}</p>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-[#0A0A0C] border border-white/5 rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {editingItem ? 'Edit' : 'Create'} {modalType === 'anime' ? 'Anime Post' : 'Page'}
                    </h3>
                    <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">
                      {editingItem ? `Editing ${editingItem.id}` : 'Preparing new entry'}
                    </p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
               </div>

               <div className="flex-grow overflow-y-auto p-10">
                  {modalType === 'anime' ? (
                    <AnimeForm initialData={editingItem} onSubmit={async (data) => {
                      try {
                        if (editingItem) {
                          await adminUpdateAnime(editingItem.id, data);
                        } else {
                          await adminCreateAnime(data);
                        }
                        setIsModalOpen(false);
                        // Refresh data and switch tab if creating new post
                        if (!editingItem) {
                          setActiveTab("posts");
                        }
                        await fetchData();
                      } catch (err: any) {
                        console.error("Form submission failed:", err);
                        alert(`Failed to save: ${err.message || 'Unknown error'}`);
                      }
                    }} onPreview={(data) => {
                      // Open public view based on ID
                      window.open(`/anime/${data.id || 'preview'}`, '_blank');
                    }} />
                  ) : (
                    <PageForm initialData={editingItem} onSubmit={async (data) => {
                      try {
                        if (editingItem) {
                          await adminUpdatePage(editingItem.id, data);
                        } else {
                          await adminCreatePage(data);
                        }
                        setIsModalOpen(false);
                        if (!editingItem) {
                          setActiveTab("pages");
                        }
                        await fetchData();
                      } catch (err: any) {
                        console.error("Form submission failed:", err);
                        alert(`Failed to save: ${err.message || 'Unknown error'}`);
                      }
                    }} onPreview={(data) => {
                      window.open(`${data.slug || '/preview'}`, '_blank');
                    }} />
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Taxonomy Edit Modal */}
      <AnimatePresence>
        {isTaxModalOpen && editingTax && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTaxModalOpen(false)} className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-[#0A0A0C] border border-white/5 rounded-[30px] p-8 relative z-10">
               <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6">Edit Taxonomy</h3>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">Name</label>
                    <input type="text" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" value={editingTax.name} onChange={e => setEditingTax({...editingTax, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">Type</label>
                    <select className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary appearance-none" value={editingTax.type} onChange={e => setEditingTax({...editingTax, type: e.target.value as any})}>
                      <option value="genre">Genre</option>
                      <option value="category">Category</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => setIsTaxModalOpen(false)} className="flex-grow h-12 bg-white/5 text-text-dim rounded-xl font-bold text-xs uppercase">Cancel</button>
                    <button onClick={async () => {
                       await adminCreateTaxonomy(editingTax); // Re-using create as upsert logic or update if backend supports it
                       setIsTaxModalOpen(false);
                       fetchData();
                    }} className="flex-grow h-12 bg-brand-primary text-white rounded-xl font-black text-xs uppercase">Save Changes</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimeForm({ initialData, onSubmit, onPreview }: { initialData?: Anime | null, onSubmit: (data: any) => void, onPreview: (data: any) => void }) {
  const [formData, setFormData] = useState<any>(() => {
    const base = initialData || {
      id: "", title: "", synopsis: "", imageUrl: "", rating: "0.0", 
      episodes: 0, status: "Ongoing", type: "TV Series", genres: [], 
      year: new Date().getFullYear(), duration: "24m", views: "0",
      downloadLinks: [], episodesList: []
    };
    return {
      ...base,
      genres: Array.isArray(base.genres) ? base.genres : [],
      downloadLinks: Array.isArray(base.downloadLinks) ? base.downloadLinks : [],
      episodesList: Array.isArray(base.episodesList) ? base.episodesList : [],
      synopsis: base.synopsis || ""
    };
  });

  const [newGenre, setNewGenre] = useState("");
  const [newLink, setNewLink] = useState({ quality: "1080p", size: "", provider: "GDrive", url: "" });
  
  // Episode Management State
  const [showEpForm, setShowEpForm] = useState(false);
  const [newEp, setNewEp] = useState<any>({ number: 1, title: "", duration: "24m", downloadLinks: [] });
  const [newEpLink, setNewEpLink] = useState({ quality: "1080p", size: "", provider: "GDrive", url: "" });

  const addGenre = () => {
    if (newGenre && !formData.genres.includes(newGenre)) {
      setFormData({ ...formData, genres: [...formData.genres, newGenre] });
      setNewGenre("");
    }
  };

  const removeGenre = (genre: string) => {
    setFormData({ ...formData, genres: formData.genres.filter((g: string) => g !== genre) });
  };

  const addDownloadLink = () => {
    if (newLink.url && newLink.size && newLink.provider) {
      setFormData({ ...formData, downloadLinks: [...formData.downloadLinks, { ...newLink }] });
      setNewLink({ quality: "1080p", size: "", provider: "GDrive", url: "" });
    }
  };

  const removeDownloadLink = (index: number) => {
    setFormData({ 
      ...formData, 
      downloadLinks: formData.downloadLinks.filter((_: any, i: number) => i !== index) 
    });
  };

  const addEpisode = () => {
    if (newEp.title) {
       setFormData({ ...formData, episodesList: [...(formData.episodesList || []), { ...newEp }] });
       setNewEp({ number: (formData.episodesList?.length || 0) + 2, title: "", duration: "24m", downloadLinks: [] });
       setShowEpForm(false);
    }
  };

  const removeEpisode = (index: number) => {
    setFormData({ 
      ...formData, 
      episodesList: formData.episodesList.filter((_: any, i: number) => i !== index) 
    });
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Unique ID (Fixed on Edit)</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-12 text-sm text-white focus:border-brand-primary disabled:opacity-50" 
              placeholder="e.g. solo-leveling" 
              value={formData.id} 
              onChange={e => setFormData({...formData, id: e.target.value})} 
              disabled={!!initialData} 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Post Title</label>
          <div className="relative">
            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <input 
              type="text" 
              className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-12 text-sm text-white focus:border-brand-primary" 
              placeholder="Anime Name" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end ml-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest">Synopsis (Rich Text)</label>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            (formData.synopsis || '').replace(/<[^>]*>/g, '').length > 2000 ? 'text-red-500' : 'text-brand-primary'
          }`}>
            {(formData.synopsis || '').replace(/<[^>]*>/g, '').length} / 2000 chars
          </span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden min-h-[200px]">
          <ReactQuill 
            theme="snow" 
            value={formData.synopsis} 
            onChange={synopsis => setFormData({...formData, synopsis})}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'clean']
              ],
            }}
            placeholder="Detailed description..." 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Year</label>
          <input 
            type="number" 
            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" 
            value={formData.year || ''} 
            onChange={e => setFormData({...formData, year: e.target.value ? parseInt(e.target.value) : 0})} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Episodes</label>
          <input 
            type="number" 
            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" 
            value={formData.episodes || ''} 
            onChange={e => setFormData({...formData, episodes: e.target.value ? parseInt(e.target.value) : 0})} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Duration</label>
          <input 
            type="text" 
            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" 
            placeholder="e.g. 24m"
            value={formData.duration} 
            onChange={e => setFormData({...formData, duration: e.target.value})} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Estimated Views</label>
          <input 
            type="text" 
            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" 
            value={formData.views} 
            onChange={e => setFormData({...formData, views: e.target.value})} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Cover Image</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-12 text-sm text-white focus:border-brand-primary" 
                  placeholder="https://..." 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  id="image-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, imageUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex-grow h-12 bg-white/5 border border-white/5 hover:border-brand-primary/40 rounded-xl flex items-center justify-center gap-3 text-xs font-black text-text-dim hover:text-white transition-all uppercase tracking-widest"
                >
                  <Upload size={16} /> Upload Image
                </button>
                {formData.imageUrl && (
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, imageUrl: ""})}
                    className="h-12 w-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl flex items-center justify-center"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            {formData.imageUrl && (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-6 flex-col justify-end">
                   <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Image Preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Status</label>
              <select 
                className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary appearance-none" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                 <option>Ongoing</option>
                 <option>Finished</option>
                 <option>Upcoming</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Type</label>
              <select 
                className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary appearance-none" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                 <option>TV Series</option>
                 <option>Movie</option>
                 <option>OVA</option>
                 <option>ONA</option>
              </select>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Genres</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {(formData.genres || []).map((genre: string) => (
            <span key={genre} className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary flex items-center gap-2">
              {genre}
              <button onClick={() => removeGenre(genre)} type="button"><X size={10} /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-grow h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" 
            placeholder="Add Genre..." 
            value={newGenre}
            onChange={e => setNewGenre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addGenre())}
          />
          <button 
            type="button"
            onClick={addGenre}
            className="h-12 w-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-8 bg-[#0A0A0C] border border-white/5 p-8 rounded-[40px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Database size={20} />
             </div>
             <div>
               <label className="text-sm font-black text-white uppercase tracking-tight">Global Download Links</label>
               <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Manage links for the entire release</p>
             </div>
          </div>
          <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest">
            {formData.downloadLinks.length} Links
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-5 bg-white/[0.02] border border-white/5 p-8 rounded-[32px]">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Quality</label>
               <select 
                 className="w-full h-12 bg-bg-dark border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-primary appearance-none"
                 value={newLink.quality}
                 onChange={e => setNewLink({...newLink, quality: e.target.value})}
               >
                 <option value="4K">4K Ultra HD</option>
                 <option value="1080p">1080p Full HD</option>
                 <option value="720p">720p HD</option>
                 <option value="480p">480p SD</option>
                 <option value="360p">360p</option>
               </select>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Size</label>
                 <input 
                   type="text" 
                   placeholder="e.g. 1.2GB" 
                   className="w-full h-12 bg-bg-dark border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-primary"
                   value={newLink.size}
                   onChange={e => setNewLink({...newLink, size: e.target.value})}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Provider</label>
                 <input 
                   type="text" 
                   placeholder="e.g. GDrive" 
                   className="w-full h-12 bg-bg-dark border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-primary"
                   value={newLink.provider}
                   onChange={e => setNewLink({...newLink, provider: e.target.value})}
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Direct URL</label>
               <input 
                 type="text" 
                 placeholder="https://..." 
                 className="w-full h-12 bg-bg-dark border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-primary"
                 value={newLink.url}
                 onChange={e => setNewLink({...newLink, url: e.target.value})}
               />
             </div>

             <button 
               type="button"
               onClick={addDownloadLink}
               disabled={!newLink.url || !newLink.size || !newLink.provider}
               className="w-full h-14 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
             >
               <Plus size={18} /> Add Download Link
             </button>
          </div>

          <div className="xl:col-span-2 space-y-3">
            {(formData.downloadLinks || []).length === 0 ? (
              <div className="h-full min-h-[300px] rounded-[32px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-text-dim">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                   <Database size={24} className="opacity-20" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">No links added yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {(formData.downloadLinks || []).map((link: any, index: number) => (
                  <div key={index} className="group p-6 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-center justify-between hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-8">
                       <div className="flex flex-col gap-1">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            link.quality === '4K' ? 'text-yellow-500' :
                            link.quality === '1080p' ? 'text-green-500' :
                            'text-brand-primary'
                          }`}>{link.quality}</span>
                          <span className="text-xs font-bold text-white pr-4 border-r border-white/10">{link.provider}</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest flex items-center gap-2">
                             File Size: <span className="text-white">{link.size}</span>
                          </p>
                          <p className="text-[10px] text-brand-primary/60 font-medium truncate max-w-[300px]">{link.url}</p>
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeDownloadLink(index)} 
                      className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episode Management Section */}
      <div className="space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-[40px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                <ListOrdered size={20} />
             </div>
             <div>
               <label className="text-sm font-black text-white uppercase tracking-tight">Episode Management</label>
               <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Add or Edit specific episodes</p>
             </div>
          </div>
          <button 
            type="button" 
            onClick={() => setShowEpForm(!showEpForm)}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
          >
            {showEpForm ? <X size={14} /> : <Plus size={14} />} {showEpForm ? 'Cancel' : 'Add Episode'}
          </button>
        </div>

        {showEpForm && (
          <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[32px] animate-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Ep Num</label>
                   <input 
                    type="number" 
                    className="w-full h-12 bg-bg-dark border border-white/10 rounded-xl px-4 text-white text-sm" 
                    value={newEp.number} 
                    onChange={e => setNewEp({...newEp, number: parseInt(e.target.value)})} 
                   />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Episode Title</label>
                   <input 
                    type="text" 
                    className="w-full h-12 bg-bg-dark border border-white/10 rounded-xl px-4 text-white text-sm" 
                    placeholder="e.g. The Beginning of a New Journey"
                    value={newEp.title} 
                    onChange={e => setNewEp({...newEp, title: e.target.value})} 
                   />
                </div>
             </div>

             <div className="bg-bg-dark/40 border border-white/5 p-6 rounded-2xl mb-8">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Add Link to Episode</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   <select 
                     className="h-10 bg-bg-dark border border-white/10 rounded-lg px-3 text-xs text-white"
                     value={newEpLink.quality}
                     onChange={e => setNewEpLink({...newEpLink, quality: e.target.value})}
                   >
                     <option value="1080p">1080p</option>
                     <option value="720p">720p</option>
                     <option value="480p">480p</option>
                   </select>
                   <input 
                    type="text" 
                    placeholder="Size (e.g. 250MB)" 
                    className="h-10 bg-bg-dark border border-white/10 rounded-lg px-3 text-xs text-white" 
                    value={newEpLink.size}
                    onChange={e => setNewEpLink({...newEpLink, size: e.target.value})}
                   />
                   <input 
                    type="text" 
                    placeholder="URL" 
                    className="h-10 bg-bg-dark border border-white/10 rounded-lg px-3 text-xs text-white sm:col-span-2" 
                    value={newEpLink.url}
                    onChange={e => setNewEpLink({...newEpLink, url: e.target.value})}
                   />
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (newEpLink.url) {
                      setNewEp({...newEp, downloadLinks: [...newEp.downloadLinks, {...newEpLink}]});
                      setNewEpLink({ quality: "1080p", size: "", provider: "GDrive", url: "" });
                    }
                  }}
                  className="mt-4 text-[10px] font-black text-brand-primary uppercase hover:text-white transition-colors"
                >
                  + Add Link to this Episode
                </button>

                {newEp.downloadLinks.length > 0 && (
                   <div className="mt-4 flex flex-wrap gap-2">
                     {newEp.downloadLinks.map((link: any, i: number) => (
                       <div key={i} className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-white/60 flex items-center gap-2">
                         {link.quality} - {link.size}
                         <button onClick={() => setNewEp({...newEp, downloadLinks: newEp.downloadLinks.filter((_: any, idx: number) => idx !== i)})}><X size={10} /></button>
                       </div>
                     ))}
                   </div>
                )}
             </div>

             <button 
              type="button" 
              onClick={addEpisode}
              className="w-full h-12 bg-white/5 border border-white/5 hover:border-brand-primary/40 rounded-xl text-xs font-black text-white transition-all uppercase tracking-widest"
             >
                Confirm Episode {newEp.number}
             </button>
          </div>
        )}

        <div className="space-y-3">
           {((formData.episodesList || [])).length === 0 ? (
              <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-text-dim/40 italic text-xs uppercase tracking-widest">
                 No episodes added
              </div>
           ) : (
              (formData.episodesList || []).map((ep: any, i: number) => (
                 <div key={i} className="group p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 font-black text-xs">
                          {ep.number}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors">{ep.title}</p>
                          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">{(ep.downloadLinks || []).length} Links Available</p>
                       </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeEpisode(i)} 
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
              ))
           )}
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-white/5 gap-4">
        <button 
          type="button"
          onClick={() => onPreview(formData)}
          className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
        >
          <Eye size={18} /> Preview
        </button>
        <button 
          onClick={() => onSubmit(formData)} 
          className="bg-brand-primary text-white h-14 px-12 rounded-2xl font-black text-sm flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/40 group"
        >
          <Save size={20} className="group-hover:rotate-12 transition-transform" /> 
          {initialData ? 'FINALIZE UPDATES' : 'PUBLISH ANIME'}
        </button>
      </div>
    </div>
  );
}

function PageForm({ initialData, onSubmit, onPreview }: { initialData?: Page | null, onSubmit: (data: any) => void, onPreview: (data: any) => void }) {
  const [formData, setFormData] = useState<any>(() => {
    const base = initialData || { id: "", title: "", slug: "", content: "" };
    return {
      ...base,
      content: base.content || ""
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Page ID</label>
          <input type="text" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" placeholder="e.g. about-us" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} disabled={!!initialData} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Slug</label>
          <input type="text" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" placeholder="/about" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Page Title</label>
        <input type="text" className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white focus:border-brand-primary" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Content (Rich Text)</label>
        <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden min-h-[300px]">
          <ReactQuill 
            theme="snow" 
            value={formData.content} 
            onChange={content => setFormData({...formData, content})}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'code-block'],
                ['clean']
              ],
            }}
            placeholder="Write your page content here..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-6 gap-4">
        <button 
          type="button"
          onClick={() => onPreview(formData)}
          className="h-12 px-8 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
        >
          <Eye size={18} /> Preview
        </button>
        <button onClick={() => onSubmit(formData)} className="bg-brand-primary text-white h-12 px-10 rounded-xl font-black text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20">
          <Save size={18} /> SAVE PAGE
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all group ${active ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]' : 'text-text-dim hover:text-white hover:bg-white/[0.03] border border-transparent'}`}
    >
      <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:translate-x-1'}`}>{icon}</span>
      <span className="flex-grow text-left uppercase tracking-widest text-[10px] font-black">{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />}
    </button>
  );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="bg-[#0A0A0C] border border-white/5 p-8 rounded-[30px] shadow-xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-[60px] rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700`} />
      <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-${color} border border-white/5 mb-6 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all`}>
        {icon}
      </div>
      <p className="text-text-dim text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{value}</h3>
    </div>
  );
}

function HealthStatus({ label, status, color, inverted = false }: { label: string, status: string, color: string, inverted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">{label}</span>
       <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border ${inverted ? `bg-${color}/10 border-${color}/20 text-${color}` : `bg-white/5 border-white/5 text-white`}`}>
          <div className={`w-1.5 h-1.5 rounded-full bg-${color} ${status !== 'Offline' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-black uppercase">{status}</span>
       </div>
    </div>
  );
}

function ActionButton({ icon, onClick, variant = "default" }: { icon: any, onClick: () => void, variant?: "default" | "danger" }) {
  return (
    <button 
      onClick={onClick}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${variant === "danger" ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-white/5 border-white/5 text-text-dim hover:bg-brand-primary hover:text-white hover:border-brand-primary/20'}`}
    >
      {icon}
    </button>
  );
}
