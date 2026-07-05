import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../Utils/toast';

import useAuthStore from '../../store/authStore';
import { logout } from '../../crud/auth.crud';
import { cn } from '../../Utils/helpers';
import { Modal } from '../ui/modal';

export const Navbar = () => {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      setIsAvatarDropdownOpen(false);
      setIsMobileMenuOpen(false);
      setShowLogoutModal(false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const navLinks = [
    { name: 'Pathways', path: '/courses' },
    { name: 'Curriculum', path: '/courses' },
  ];

  return (
    <>
      <nav 
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-500 border-b',
          isScrolled 
            ? 'bg-surface/60 backdrop-blur-2xl border-surface-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.8)]' 
            : 'bg-transparent border-transparent py-2'
        )}
      >
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center h-16">
          
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="VeoLMS Logo" 
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
            </Link>
            
            <div className="hidden md:flex gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="group relative bg-primary-container font-label-md text-label-md px-6 py-2 rounded-lg shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 text-white overflow-hidden inline-flex items-center"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-transparent hover:border-primary transition-colors overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-on-primary-container">
                      {getInitials()}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isAvatarDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsAvatarDropdownOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-surface border border-surface-border shadow-lg py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-surface-border">
                          <p className="text-sm font-label-md text-on-surface truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {user?.emailId}
                          </p>
                        </div>
                        
                        <div className="py-1">
                          {user?.role === 'admin' ? (
                            <Link
                              to="/admin"
                              onClick={() => setIsAvatarDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" /> Admin Panel
                            </Link>
                          ) : (
                            <Link
                              to="/dashboard"
                              onClick={() => setIsAvatarDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                          )}
                          <Link
                            to="/dashboard/profile"
                            onClick={() => setIsAvatarDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors"
                          >
                            <User className="w-4 h-4" /> Profile
                          </Link>
                        </div>
                        
                        <div className="border-t border-surface-border py-1">
                          <button
                            onClick={() => {
                              setIsAvatarDropdownOpen(false);
                              setShowLogoutModal(true);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error-container/50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Log out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu (Slide-in) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-surface shadow-2xl z-[70] flex flex-col md:hidden border-l border-surface-border"
            >
              <div className="flex items-center justify-between p-6 border-b border-surface-border">
                <img 
                  src="/logo.png" 
                  alt="VeoLMS Logo" 
                  className="h-8 w-auto object-contain" 
                />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-8 py-3 text-lg font-medium text-on-surface-variant hover:text-primary hover:bg-surface-dim transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}

                {isAuthenticated && (
                  <div className="px-6 py-6 mt-4 border-t border-surface-border">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 px-2">Account</p>
                    {user?.role === 'admin' ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-2 py-3 text-base font-medium text-on-surface-variant hover:text-primary hover:bg-surface-dim rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5" /> Admin Panel
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-2 py-3 text-base font-medium text-on-surface-variant hover:text-primary hover:bg-surface-dim rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-2 py-3 text-base font-medium text-on-surface-variant hover:text-primary hover:bg-surface-dim rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" /> Profile Settings
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-surface-border">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-3 rounded text-center font-medium text-on-surface-variant hover:text-primary hover:bg-surface-dim transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group relative w-full py-3 rounded-lg bg-primary-container text-center font-label-md text-label-md text-white shadow-[0_4px_12px_rgba(255,107,0,0.4)] hover:shadow-[0_0_24px_rgba(255,107,0,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-on-primary-container">{getInitials()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-label-md text-on-surface truncate max-w-[120px]">{user?.firstName}</p>
                        <p className="text-xs text-on-surface-variant truncate max-w-[120px]">{user?.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="p-2 text-error hover:bg-error-container/50 rounded-full transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Are you sure you want to log out?"
        description="You will need to sign in again to access your account."
      >
        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="px-6 py-2.5 rounded-xl font-label-md text-on-surface-variant hover:text-white hover:bg-surface-dim transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="group/btn relative flex items-center justify-center px-6 py-2.5 rounded-xl bg-red-600 font-label-md text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)] hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Log Out
            </span>
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.2),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </Modal>
    </>
  );
};
