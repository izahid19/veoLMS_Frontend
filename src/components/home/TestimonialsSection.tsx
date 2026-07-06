import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 60, damping: 15 } }
};

export const TestimonialsSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32">
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-50">
        <div className="w-[600px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full translate-y-24" />
      </div>

      <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight mb-4">Wall of Love</h2>
        <p className="font-body-lg text-on-surface-variant text-lg">See what our alumni have to say.</p>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-2xl relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,0,0.1)] transition-all duration-500 bg-surface-dim/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[50px] -mr-24 -mt-24 transition-all duration-700 group-hover:bg-primary/30 group-hover:scale-125" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <img alt="Avatar" className="w-14 h-14 rounded-full border-2 border-surface-border/50 shadow-lg" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            <div>
              <h4 className="font-title-md text-on-surface text-lg font-bold">Sarah Chen</h4>
              <p className="font-label-sm text-primary uppercase tracking-widest mt-1">Frontend Engineer</p>
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant relative z-10 leading-relaxed text-lg">"The Full-Stack pathway completely transformed my understanding of React. I was able to land a mid-level role within 3 months of completing the curriculum."</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-2xl relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(147,51,234,0.1)] transition-all duration-500 bg-surface-dim/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[50px] -mr-24 -mt-24 transition-all duration-700 group-hover:bg-purple-500/30 group-hover:scale-125" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <img alt="Avatar" className="w-14 h-14 rounded-full border-2 border-surface-border/50 shadow-lg" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            <div>
              <h4 className="font-title-md text-on-surface text-lg font-bold">Marcus Johnson</h4>
              <p className="font-label-sm text-purple-500 uppercase tracking-widest mt-1">Product Designer</p>
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant relative z-10 leading-relaxed text-lg">"Incredible depth in the design courses. The focus on systems thinking and component-driven design is exactly what the industry needs right now."</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-2xl relative overflow-hidden group shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,0,0.1)] transition-all duration-500 bg-surface-dim/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[50px] -mr-24 -mt-24 transition-all duration-700 group-hover:bg-primary/30 group-hover:scale-125" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <img alt="Avatar" className="w-14 h-14 rounded-full border-2 border-surface-border/50 shadow-lg" src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg" />
            <div>
              <h4 className="font-title-md text-on-surface text-lg font-bold">Elena Rodriguez</h4>
              <p className="font-label-sm text-primary uppercase tracking-widest mt-1">Data Analyst</p>
            </div>
          </div>
          <p className="font-body-md text-on-surface-variant relative z-10 leading-relaxed text-lg">"VeoLMS provides the most practical data science curriculum I've seen. You don't just learn theory; you build actual models on real datasets."</p>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
};
