import React from 'react';
import { motion } from 'framer-motion';

export const CtaSection = () => {
  return (
    <section className="relative w-full py-24 md:py-32">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel rounded-3xl p-12 md:p-24 text-center relative overflow-hidden border-primary/30 shadow-[0_0_50px_rgba(255,107,0,0.1)] bg-surface-dim/90 backdrop-blur-2xl"
      >
        {/* Animated Sweep Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,107,0,0.15),transparent_50%)]" />
          <motion.div 
            animate={{ 
              x: ["-100%", "100%"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8, 
              ease: "linear" 
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary/10 to-transparent skew-x-12"
          />
        </div>

        <h2 className="font-display-lg text-headline-lg md:text-[56px] md:leading-[64px] text-on-surface font-bold tracking-tighter mb-6 relative z-10">
          Ready to start your journey?
        </h2>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10 relative z-10 text-xl">
          Join 50,000+ engineers who have already leveled up their careers with VeoLMS.
        </p>
        
        <button className="group relative bg-primary-container font-label-md text-label-md px-10 py-5 rounded-xl shadow-[0_8px_32px_rgba(255,107,0,0.4)] hover:shadow-[0_0_48px_rgba(255,107,0,0.6)] hover:-translate-y-1 transition-all duration-300 text-white overflow-hidden text-lg z-10">
          <span className="relative z-10 flex items-center gap-2">
            Get Started Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </motion.div>
      </div>
    </section>
  );
};
