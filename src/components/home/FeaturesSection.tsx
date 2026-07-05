import React from 'react';
import { GraduationCap, Clock, Award } from 'lucide-react';
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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

export const FeaturesSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32">
      {/* Background radial highlight */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-bold tracking-tight mb-4">Why Choose VeoLMS</h2>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10"
      >
        <motion.div variants={itemVariants} className="group flex flex-col items-center text-center gap-4 glass-panel p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,0,0.1)] transition-all duration-500 bg-surface-dim/80 backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center border border-primary/20 text-primary mb-4 shadow-[0_0_20px_rgba(255,107,0,0.2)] group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h3 className="font-title-md text-xl text-on-surface">Expert Instructors</h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed">Learn directly from industry veterans who have built software at top tech companies.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="group flex flex-col items-center text-center gap-4 glass-panel p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(147,51,234,0.1)] transition-all duration-500 bg-surface-dim/80 backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-500 mb-4 shadow-[0_0_20px_rgba(147,51,234,0.2)] group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="font-title-md text-xl text-on-surface">Learn at Your Pace</h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed">Flexible scheduling and lifetime access mean you can learn whenever it suits you.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="group flex flex-col items-center text-center gap-4 glass-panel p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,0,0.1)] transition-all duration-500 bg-surface-dim/80 backdrop-blur-md">
          <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center border border-primary/20 text-primary mb-4 shadow-[0_0_20px_rgba(255,107,0,0.2)] group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="font-title-md text-xl text-on-surface">Industry Certification</h3>
          <p className="font-body-md text-on-surface-variant leading-relaxed">Earn recognized credentials that carry weight with engineering managers.</p>
        </motion.div>
      </motion.div>
      </div>
    </section>
  );
};
