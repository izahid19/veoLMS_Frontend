import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, Compass, User, CreditCard, LogOut, ChevronLeft, ChevronRight, LifeBuoy } from 'lucide-react';
import { toast } from '../../Utils/toast';

import useAuthStore from '../../store/authStore';
import { logout } from '../../crud/auth.crud';
import { cn } from '../../Utils/helpers';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import { Modal } from '../ui/modal';

export const DashboardLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
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
    { name: 'Dashboard',        path: '/dashboard',           icon: LayoutDashboard },
    { name: 'My Courses',       path: '/dashboard/my-courses', icon: BookOpen },
    { name: 'All Courses',      path: '/dashboard/courses',    icon: Compass },
    { name: 'Purchase History', path: '/dashboard/purchases',  icon: CreditCard },
    { name: 'Profile Settings', path: '/dashboard/profile',    icon: User },
  ];

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-on-surface font-sans antialiased overflow-hidden relative">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="flex items-center mb-8 px-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold shadow-success-glow group-hover:scale-105 transition-transform shrink-0">
                  V
                </div>
                <motion.div 
                  animate={{ display: open ? "flex" : "none", opacity: open ? 1 : 0 }} 
                  className="items-center"
                >
                  <img src="/logo.png" alt="VeoLMS" className="h-8 w-auto object-contain" />
                </motion.div>
              </Link>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <SidebarLink 
                  key={link.name} 
                  link={{ label: link.name, href: link.path, icon: <link.icon className="w-5 h-5" /> }} 
                  isActive={location.pathname === link.path}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setOpen(false);
                    }
                  }}
                />
              ))}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-surface-border flex flex-col gap-2">
            <SidebarLink 
              link={{ label: 'Help & Support', href: '/support', icon: <LifeBuoy className="w-5 h-5" /> }} 
              isActive={location.pathname === '/support'}
            />
            <SidebarLink 
              link={{ label: 'Log out', icon: <LogOut className="w-5 h-5" /> }} 
              onClick={() => {
                setShowLogoutModal(true);
              }} 
              className="text-error hover:bg-error-container/50 hover:text-error !text-error"
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        <button 
          onClick={() => setOpen(!open)}
          className="hidden md:flex absolute top-6 -left-4 z-50 bg-surface-dim/80 backdrop-blur-md border border-surface-border rounded-full p-1.5 text-on-surface-variant hover:text-white hover:bg-surface-dim shadow-md transition-transform hover:scale-110"
        >
          {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Page Content */}
        <div className="flex-1 w-full h-full p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Are you sure you want to log out?"
        description="You will be required to enter your credentials again to access your dashboard."
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
