import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock, User, ShieldAlert, ArrowRight } from "lucide-react";
import { adminLogin } from "../services/adminService";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await adminLogin(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#050505] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
         <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-primary/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0A0A0C] border border-white/5 rounded-[40px] p-10 relative z-10 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-accent-gradient opacity-[0.02] pointer-events-none" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20 mb-6 shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">ADMIN ACCESS</h1>
          <p className="text-text-dim text-center mt-2 text-xs font-bold uppercase tracking-widest">Authorized Personnel Only</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
          >
            <ShieldAlert size={16} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-2">Email Address</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 text-white text-sm font-medium focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] ml-2">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 text-white text-sm font-medium focus:outline-none focus:border-brand-primary/40 focus:bg-white/[0.08] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-white text-bg-dark rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-white transition-all shadow-xl active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                AUTHENTICATE <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
