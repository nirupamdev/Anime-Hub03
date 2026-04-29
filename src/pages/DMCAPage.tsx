import React from "react";
import { ShieldAlert, Mail } from "lucide-react";
import { motion } from "motion/react";

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 pt-12 pb-32 text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-12 md:p-20 rounded-[40px] border border-border-subtle"
      >
        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-10 border border-brand-primary/20">
          <ShieldAlert className="text-brand-primary" size={32} />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">
          DMCA <span className="text-brand-primary">Policy</span>
        </h1>

        <div className="space-y-6 text-text-dim leading-relaxed text-lg font-medium opacity-80">
          <p>
            KAIZEN.NET is an online service provider as defined in the Digital Millennium Copyright Act. 
            We provide legal copyright owners with the ability to self-publish on the internet by uploading, 
            storing and displaying various media utilizing our services.
          </p>
          <p>
            We do not monitor, screen or otherwise review the media which is uploaded to our servers by users of the service. 
            We take copyright violation very seriously and will vigorously protect the rights of legal copyright owners.
          </p>
          <p>
            If you are the copyright owner of content which appears on the KAIZEN.NET website and you did not authorize the use of the content, 
            you must notify us in writing in order for us to identify the allegedly infringing content and take action.
          </p>
        </div>

        <div className="mt-16 p-8 bg-white/5 rounded-3xl border border-border-subtle flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
             <Mail className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl mb-1 uppercase tracking-tight">Copyright Contact</h3>
            <p className="text-text-dim text-sm">Send your notice to: <a href="mailto:copyright@kaizen.net" className="text-brand-primary hover:underline font-bold">copyright@kaizen.net</a></p>
          </div>
        </div>

        <div className="mt-12 text-xs text-text-dim/50 font-bold uppercase tracking-[0.2em]">
          Last Updated: April 2026
        </div>
      </motion.div>
    </div>
  );
}
