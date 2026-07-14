import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Film,
  Layout
} from 'lucide-react';
import { toast } from '../../Utils/toast';
import { cn } from '../../Utils/helpers';

import useAuthStore from '../../store/authStore';
import { logout } from '../../crud/auth.crud';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import { Modal } from '../ui/modal';

export const AdminLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const editCourseMatch = location.pathname.match(/^\/admin\/courses\/([^\/]+)\/edit$/);
  const editingCourseId = editCourseMatch ? editCourseMatch[1] : null;
  const currentTab = searchParams.get('tab') || 'details';

  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      toast.success('Logged out successfully');
      setShowLogoutModal(false);
      navigate('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navLinks = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Instructors', path: '/admin/instructors', icon: ShieldCheck },
    { name: 'Enrollments', path: '/admin/enrollments', icon: GraduationCap },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-on-surface font-sans antialiased overflow-hidden relative">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary-container/10 blur-[120px] rounded-full mix-blend-screen" />
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
                  <span className="text-lg font-display-md font-bold text-on-surface whitespace-nowrap">VeoLMS Admin</span>
                </motion.div>
              </Link>
            </div>
            
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = link.path === '/admin' 
                  ? location.pathname === '/admin' 
                  : location.pathname.startsWith(link.path);

                return (
                  <div key={link.name} className="flex flex-col gap-1">
                    <SidebarLink 
                      link={{ label: link.name, href: link.path, icon: <link.icon className="w-5 h-5" /> }} 
                      isActive={isActive}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setOpen(false);
                        }
                      }}
                    />
                    
                    {/* Sub-links when editing a course */}
                    {link.name === 'Courses' && editingCourseId && open && (
                      <div className="flex flex-col gap-1 ml-9 mt-1 relative before:absolute before:left-[-12px] before:top-2 before:bottom-4 before:w-[1.5px] before:bg-surface-border">
                        {[
                          { id: 'details', label: 'Course Details', icon: Layout },
                          { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
                          { id: 'trailer', label: 'Trailer', icon: Film },
                          { id: 'settings', label: 'Settings', icon: Settings }
                        ].map((subLink) => {
                          const isSubActive = currentTab === subLink.id;
                          const SubIcon = subLink.icon;
                          return (
                            <Link
                              key={subLink.id}
                              to={`/admin/courses/${editingCourseId}/edit?tab=${subLink.id}`}
                              className={cn(
                                "py-2 px-3 text-sm rounded-lg transition-colors relative flex items-center gap-3",
                                isSubActive ? "text-primary bg-primary/5 font-semibold" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-dim"
                              )}
                            >
                              {/* Sublink active indicator dot */}
                              {isSubActive && <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                              <SubIcon className="w-4 h-4" />
                              {subLink.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto pt-6 border-t border-surface-border flex flex-col gap-2">
            <div className="px-4 py-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-primary-container/20 shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-on-primary-container">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <motion.div 
                animate={{ display: open ? "block" : "none", opacity: open ? 1 : 0 }} 
                className="overflow-hidden"
              >
                <p className="text-sm font-label-md text-on-surface truncate max-w-[120px]">{user?.firstName}</p>
                <p className="text-xs text-primary-container font-semibold truncate max-w-[120px]">Administrator</p>
              </motion.div>
            </div>

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

        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden h-16 bg-surface/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <ShieldCheck className="w-5 h-5 text-primary-container" />
              <h2 className="text-lg font-display-md font-semibold">Admin Panel</h2>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-primary-container/20 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-on-primary-container">
                {user?.firstName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </header>

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
