import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  ShieldCheck
} from 'lucide-react';
import { toast } from '../../Utils/toast';

import useAuthStore from '../../store/authStore';
import { logout } from '../../crud/auth.crud';
import { cn } from '../../Utils/helpers';
import { Modal } from '../ui/modal';

export const AdminLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      toast.success('Logged out successfully');
      setShowLogoutModal(false);
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navLinks = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Enrollments', path: '/admin/enrollments', icon: GraduationCap },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r border-surface-border">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 group mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold shadow-success-glow group-hover:scale-105 transition-transform">
            V
          </div>
          <span className="text-xl font-display-md font-bold text-on-surface">VeoLMS Admin</span>
        </Link>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => {
            // Precise active matching for sub-routes
            const isActive = link.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(link.path);
              
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-all duration-200',
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-on-surface-variant")} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-surface-border">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-label-md text-error hover:bg-error-container/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex text-on-surface font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-dim rounded-full transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display-md font-semibold">Admin Panel</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-label-md text-on-surface">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-primary font-semibold">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary/20 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-on-primary-container">{getInitials()}</span>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Are you sure you want to log out?"
        description="You will be required to enter your credentials again to access your admin dashboard."
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
    </div>
  );
};
