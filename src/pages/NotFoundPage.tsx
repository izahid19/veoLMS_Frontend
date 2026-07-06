import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505] p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center relative max-w-2xl"
      >
        {/* Subtle large background 404 */}
        <div 
          className="absolute inset-0 flex items-center justify-center -z-10 select-none opacity-50"
        >
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-[120px] md:text-[200px] text-[#262626]">
            404
          </span>
        </div>

        {/* Foreground Content */}
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-white text-[32px] md:text-[40px] mb-4">
          Page not found
        </h1>
        
        <p className="font-['Inter'] text-[#a3a3a3] text-[16px] md:text-[18px] max-w-md mx-auto mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-['Plus_Jakarta_Sans'] font-semibold rounded-[8px] transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/courses"
            className="w-full sm:w-auto px-8 py-3 bg-transparent hover:bg-white/5 border border-white text-white font-['Plus_Jakarta_Sans'] font-semibold rounded-[8px] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
