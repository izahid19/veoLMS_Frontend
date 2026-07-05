import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-on-surface antialiased">
      <Navbar />
      <main className="flex-1 flex flex-col relative z-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
