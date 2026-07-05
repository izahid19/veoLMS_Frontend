import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background w-full py-section-padding border-t border-surface-border/30 relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-6 gap-12 md:gap-8 relative z-10">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <img src="/logo.png" alt="VeoLMS Logo" className="h-10 w-auto object-contain object-left filter brightness-0 invert opacity-90" />
          <p className="font-body-md text-on-surface-variant text-sm max-w-sm leading-relaxed">
            Advanced engineering education built for the modern developer. Command your career trajectory with precise, high-fidelity curriculum.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-on-surface font-bold tracking-wider uppercase mb-2">Platform</h4>
          <Link to="/courses" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Curriculum</Link>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Pricing</Link>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Enterprise</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-on-surface font-bold tracking-wider uppercase mb-2">Resources</h4>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Documentation</Link>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Blog</Link>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Community</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-on-surface font-bold tracking-wider uppercase mb-2">Company</h4>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">About Us</Link>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Careers</Link>
          <Link to="#" className="font-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-sm">Contact</Link>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-16 pt-8 border-t border-surface-border/30 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
        <p className="font-body-md text-on-surface-variant/60 text-sm tracking-wide">© {new Date().getFullYear()} VeoLMS Engineering. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="#" className="font-body-md text-on-surface-variant/60 hover:text-on-surface transition-colors duration-300 text-sm">Privacy Policy</Link>
          <Link to="#" className="font-body-md text-on-surface-variant/60 hover:text-on-surface transition-colors duration-300 text-sm">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
