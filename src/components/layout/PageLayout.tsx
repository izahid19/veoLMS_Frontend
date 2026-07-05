import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PageLayout = ({ 
  children, 
  hideNavbar = false, 
  hideFooter = false 
}: { 
  children: React.ReactNode;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}) => {
  return (
    <div className="antialiased min-h-screen relative overflow-x-hidden font-body-md text-body-md" style={{ backgroundColor: 'rgb(14, 14, 14)' }}>
      <div className="noise-overlay opacity-50"></div>
      <div className="absolute inset-0 bg-grid-pattern bg-grid pointer-events-none z-0 opacity-30"></div>
      
      <main className={`relative z-10 ${!hideNavbar ? 'pt-32' : 'pt-0'} pb-section-padding min-h-screen flex flex-col`}>
        {children}
      </main>
    </div>
  );
};
