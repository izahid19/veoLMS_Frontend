import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 60, damping: 15 } }
};

export const FeaturedPathways = () => {
  return (
    <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-padding">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight mb-4">Featured Pathways</h2>
        <p className="font-body-lg text-on-surface-variant text-lg">Accelerate your career with our top-rated curriculum.</p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Course 1 */}
        <motion.div variants={itemVariants} className="group relative glass-panel rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,0,0.15)] hover:border-primary/50 transition-all duration-500 flex flex-col bg-surface-dim/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="h-48 bg-surface-container-high relative">
            <img alt="Web Development" className="w-full h-full object-cover opacity-70" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur px-3 py-1 rounded-full border border-surface-border flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-label-md text-sm text-on-surface">4.9</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="font-title-md text-title-md text-on-surface mb-2">Full-Stack Engineering</h3>
            <p className="font-body-md text-on-surface-variant mb-6 flex-grow">Master modern web development from React to Node.js. Build production-ready applications.</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-border/50">
              <span className="font-headline-lg text-xl text-on-surface">$149</span>
              <button className="relative overflow-hidden bg-surface-container border border-surface-border text-white font-label-md px-6 py-2 rounded-lg shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all duration-300">
                <span className="relative z-10">Enroll Now</span>
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Course 2 */}
        <motion.div variants={itemVariants} className="group relative glass-panel rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(147,51,234,0.15)] hover:border-purple-500/50 transition-all duration-500 flex flex-col bg-surface-dim/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="h-48 bg-surface-container-high relative">
            <img alt="UI/UX Design" className="w-full h-full object-cover opacity-70" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur px-3 py-1 rounded-full border border-surface-border flex items-center gap-1">
              <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
              <span className="font-label-md text-sm text-on-surface">4.8</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="font-title-md text-title-md text-on-surface mb-2">Product Design Mastery</h3>
            <p className="font-body-md text-on-surface-variant mb-6 flex-grow">Learn advanced UI/UX principles, design systems, and user research methodologies.</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-border/50">
              <span className="font-headline-lg text-xl text-on-surface">$129</span>
              <button className="relative overflow-hidden bg-surface-container border border-surface-border text-white font-label-md px-6 py-2 rounded-lg shadow-sm group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300">
                <span className="relative z-10">Explore</span>
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Course 3 */}
        <motion.div variants={itemVariants} className="group relative glass-panel rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,0,0.15)] hover:border-primary/50 transition-all duration-500 flex flex-col bg-surface-dim/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="h-48 bg-surface-container-high relative">
            <img alt="Data Science" className="w-full h-full object-cover opacity-70" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur px-3 py-1 rounded-full border border-surface-border flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-label-md text-sm text-on-surface">4.9</span>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="font-title-md text-title-md text-on-surface mb-2">Applied Data Science</h3>
            <p className="font-body-md text-on-surface-variant mb-6 flex-grow">Dive into machine learning, Python data stack, and predictive analytics.</p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-border/50">
              <span className="font-headline-lg text-xl text-on-surface">$199</span>
              <button className="relative overflow-hidden bg-surface-container border border-surface-border text-white font-label-md px-6 py-2 rounded-lg shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all duration-300">
                <span className="relative z-10">Enroll Now</span>
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
