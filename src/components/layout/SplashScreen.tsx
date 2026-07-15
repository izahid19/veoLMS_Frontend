import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const text = "VeoLMS";

export const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake progress counter for aesthetic purposes
    const duration = 1800; // 1.8 seconds
    const interval = 20;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.floor((currentStep / steps) * 100), 100);
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-surface p-8 md:p-12"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        y: "-5%",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
      }}
    >
      {/* Background Grid & Spotlight to exactly match HeroSection */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Top Header Placeholder */}
      <div className="w-full flex justify-start relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="font-label-md text-xs tracking-[0.2em] text-on-surface-variant uppercase"
        >
          Initializing
        </motion.div>
      </div>

      {/* Center Cinematic Reveal */}
      <div className="flex flex-col items-center mt-[-10vh] relative z-10">
        <div className="relative flex overflow-hidden pb-4">
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              className="font-display-lg text-6xl font-bold tracking-tighter text-on-surface md:text-8xl lg:text-[120px]"
              initial={{ y: "120%", rotate: 8 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{
                duration: 1,
                ease: [0.76, 0, 0.24, 1], // Cinematic smooth easing
                delay: index * 0.04,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        
        <motion.div
          className="mt-6 flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-[#ff6b00]" />
          <span className="font-label-md text-xs md:text-sm tracking-[0.2em] text-primary-container uppercase">
            The Premium Academy
          </span>
          <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-[#9333ea]" />
        </motion.div>
      </div>

      {/* Bottom Footer with Progress */}
      <div className="w-full flex items-end justify-between relative z-10">
        <motion.div 
          className="font-display-lg text-5xl md:text-7xl font-bold text-surface-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="text-on-surface">{progress}</span>%
        </motion.div>

        <motion.div
          className="flex flex-col items-end gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
        >
           <div className="font-label-md text-xs tracking-[0.2em] text-on-surface-variant uppercase text-right">
            System Ready
          </div>
          <div 
            className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#9333ea]" 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
