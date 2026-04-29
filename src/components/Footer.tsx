import React from "react";
import { Twitter, Instagram, Youtube, Github, Zap, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-40 border-t border-border-subtle bg-[#0A0A0C] py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-24">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <Zap className="text-white fill-white" size={20} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white leading-none">
                KAIZEN<span className="text-brand-primary">.</span>NET
              </span>
            </div>
            <p className="text-text-dim text-sm leading-relaxed mb-10 max-w-xs font-medium opacity-60">
              The ultimate high-performance anime core. Powered by AI to bring you precision discovery and lightning-fast archives.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Twitter, label: 'Twitter' },
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Youtube, label: 'YouTube' },
                { Icon: Github, label: 'GitHub' }
              ].map(({ Icon, label }, idx) => (
                <a key={idx} href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center text-text-dim hover:text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/30 transition-all shadow-lg" aria-label={`Follow us on ${label}`}>
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10 text-brand-primary">DATABASE</h4>
            <nav className="flex flex-col gap-5 text-[13px] font-bold text-text-dim" aria-label="Database links">
              {[
                { label: 'Home', path: '/' },
                { label: 'Latest', path: '/search?sort=Newest' },
                { label: 'Series', path: '/search?category=Series' },
                { label: 'Movies', path: '/search?category=Movies' },
                { label: 'A-Z List', path: '/search?sort=A-Z' }
              ].map(item => (
                <Link key={item.label} to={item.path} className="hover:text-white transition-colors uppercase tracking-widest">{item.label}</Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10 text-brand-primary">SUPPORT</h4>
            <nav className="flex flex-col gap-5 text-[13px] font-bold text-text-dim" aria-label="Support links">
              {[
                { label: 'Direct Message', path: '#' },
                { label: 'DMCA Policy', path: '/dmca' },
                { label: 'Terms', path: '#' },
                { label: 'Privacy', path: '#' }
              ].map(item => (
                <Link key={item.label} to={item.path} className="hover:text-white transition-colors uppercase tracking-widest">{item.label}</Link>
              ))}
            </nav>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10 text-brand-primary">COMMUNITY</h4>
            <div className="bg-white/5 border border-border-subtle p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-primary/10 blur-3xl rounded-full group-hover:bg-brand-primary/20 transition-all" />
              <h5 className="text-white font-black text-lg mb-2 uppercase italic tracking-tight">Stay Connected</h5>
              <p className="text-text-dim text-[11px] font-bold mb-6 uppercase tracking-widest leading-loose">Get the latest status reports and site updates directly.</p>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="EMAIL_ADDRESS"
                  aria-label="Subscribe to newsletter"
                  className="w-full bg-[#16161C] border border-border-subtle rounded-2xl py-4 px-6 text-xs font-black text-white placeholder-text-dim/40 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all outline-none uppercase tracking-widest"
                />
                <button className="absolute right-2 w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white hover:bg-brand-primary/80 transition-colors shadow-lg" aria-label="Send">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-border-subtle pt-12 gap-8">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] opacity-40">
              © 2026 KAIZEN NETWORK <span className="mx-2">|</span> ALL RIGHTS RESERVED
            </p>
          </div>
          <div className="flex gap-12 text-[10px] font-black text-text-dim uppercase tracking-[0.3em] opacity-40">
            <a href="#" className="hover:text-brand-primary transition-colors">Cookie Settings</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
