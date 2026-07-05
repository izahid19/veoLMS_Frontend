import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      className="relative w-full overflow-hidden pt-32 pb-24 md:pt-48 md:pb-32"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background Grid & Spotlight */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        
        {/* Ambient base glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Interactive Mouse Spotlight */}
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            background: isHovering 
              ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 0, 0.08), transparent 40%)`
              : `radial-gradient(600px circle at 50% -20%, rgba(255, 107, 0, 0.08), transparent 40%)`,
          }}
          transition={{ type: 'tween', ease: 'backOut', duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            background: isHovering 
              ? `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.05), transparent 40%)`
              : `radial-gradient(800px circle at 50% -20%, rgba(147, 51, 234, 0.05), transparent 40%)`,
          }}
          transition={{ type: 'tween', ease: 'backOut', duration: 0.8 }}
        />
      </div>

      <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col gap-8 items-center text-center mx-auto max-w-4xl">
          


          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="font-display-lg text-display-lg md:text-[88px] md:leading-[96px] text-on-surface font-bold tracking-tighter"
          >
            Master the<br />
            <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#ff6b00,45%,#fff,55%,#ff6b00)] bg-[length:200%_100%] animate-shimmer inline-block">
              Future of Code
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl text-lg md:text-xl leading-relaxed"
          >
            Advanced engineering education built for the modern developer. Command your career trajectory with precise, high-fidelity curriculum taught by industry veterans.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap gap-6 justify-center mt-4"
          >
            <button className="group relative bg-primary-container font-label-md text-label-md px-8 py-4 rounded-lg shadow-[0_4px_24px_rgba(255,107,0,0.4)] hover:shadow-[0_0_32px_rgba(255,107,0,0.6)] hover:-translate-y-1 transition-all duration-300 text-white overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Start Learning
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button className="bg-surface-dim border border-surface-border text-white font-label-md text-label-md px-8 py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:border-purple-500/50 hover:bg-purple-500/10 hover:shadow-[0_0_20px_rgba(147,51,234,0.15)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-md">
              Explore Curriculum
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Stats Section - Integrated tightly into hero */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-32"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-border/50 border border-surface-border/50 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          {[
            { label: 'Active Learners', value: '50K+' },
            { label: 'Premium Courses', value: '10K+' },
            { label: 'Expert Instructors', value: '1K+' },
            { label: 'Satisfaction Rate', value: '95%' }
          ].map((stat, i) => (
            <div key={i} className="bg-surface/80 p-8 flex flex-col justify-center items-center text-center hover:bg-surface-dim transition-colors duration-500 group cursor-default">
              <span className="font-label-md text-xs md:text-sm text-on-surface-variant uppercase tracking-[0.2em] mb-2 group-hover:text-primary transition-colors">{stat.label}</span>
              <span className="font-display-lg text-3xl md:text-5xl text-on-surface font-bold group-hover:scale-105 transition-transform duration-500">{stat.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Trusted By Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="relative z-10 mt-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop"
      >
        <p className="text-center font-label-md text-xs text-on-surface-variant uppercase tracking-[0.3em] mb-8 opacity-40">Trusted by engineering teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-30 grayscale text-on-surface">
          {['Google', 'Microsoft', 'Amazon', 'Netflix', 'Airbnb', 'Shopify'].map((company, i) => (
            <span key={i} className="font-display-lg text-xl md:text-2xl font-bold tracking-tighter hover:opacity-100 hover:grayscale-0 transition-all duration-300 cursor-default">
              {company}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
