import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCircle } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

interface PlayerHeaderProps {
  courseTitle: string;
}

export function PlayerHeader({ courseTitle }: PlayerHeaderProps) {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="h-[56px] flex-shrink-0 bg-[#0a0a0a] border-b border-[#262626] flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/logo.png" alt="VeoLMS" className="h-7 w-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>
        <div className="h-6 w-px bg-[#262626] mx-2 shrink-0 hidden sm:block" />
        <h1 className="font-['Plus_Jakarta_Sans'] font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-[400px] md:max-w-[600px] text-white tracking-wide">
          {courseTitle || 'Loading Course...'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4 shrink-0">
        {isAuthenticated ? (
          <>
            <Link 
              to="/dashboard/my-courses"
              className="text-[#a3a3a3] hover:text-white text-[13px] sm:text-[14px] font-medium transition-colors flex items-center gap-2 mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">My Courses</span>
            </Link>
            <div className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-5 h-5 text-[#737373]" />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-white text-sm font-semibold hover:text-[#ff6b00] transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-[#ff6b00] hover:bg-[#ff8533] text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors hidden sm:block"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
