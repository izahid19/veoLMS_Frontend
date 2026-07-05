import React, { useState, createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "../../Utils/helpers";

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const Sidebar = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const SidebarBody = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <DesktopSidebar className={className}>{children}</DesktopSidebar>
      <MobileSidebar className={className}>{children}</MobileSidebar>
    </>
  );
};

const DesktopSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "hidden md:flex h-screen flex-col flex-shrink-0 bg-surface-dim/50 backdrop-blur-3xl border-r border-surface-border/50 transition-all duration-300 z-40 sticky top-0 relative overflow-hidden",
        className
      )}
      animate={{
        width: animate ? (open ? "256px" : "80px") : "256px",
      }}
    >
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-50" />
      <div className="flex flex-col h-full p-4 overflow-hidden gap-4 relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

const MobileSidebar = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const { open, setOpen } = useSidebar();

  return (
    <div className="md:hidden flex flex-row items-center justify-between p-4 w-full bg-surface/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-40">
      <div className="flex items-center z-50 gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="text-on-surface-variant hover:text-on-surface hover:bg-surface-dim rounded-full p-2 -ml-2 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 group">
           <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white font-bold shadow-success-glow">
            V
          </div>
          <img src="/logo.png" alt="VeoLMS" className="h-8 w-auto object-contain" />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 left-0 w-64 z-[60] bg-surface flex flex-col p-4 border-r border-surface-border h-screen",
              "fixed inset-y-0 left-0 w-64 z-[60] bg-surface/80 backdrop-blur-xl flex flex-col p-4 border-r border-white/10 h-screen",
              className
            )}
          >
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-dim rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  isActive,
  ...props
}: {
  link: {
    label: string;
    href?: string;
    icon: React.JSX.Element | React.ReactNode;
  };
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  const { open, animate } = useSidebar();
  
  return (
    <Link
      to={link.href || "#"}
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-4 group/sidebar py-3 px-3 rounded-xl transition-all duration-300 relative overflow-hidden",
        isActive 
          ? "text-primary" 
          : "text-on-surface-variant hover:text-primary",
        className
      )}
      {...props}
    >
      {/* Active State Background & Border */}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-primary/10 rounded-xl" />
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
        </>
      )}
      
      {/* Hover State Background */}
      {!isActive && (
        <div className="absolute inset-0 bg-surface-dim opacity-0 group-hover/sidebar:opacity-100 transition-opacity rounded-xl" />
      )}

      <div className={cn(
        "relative z-10 transition-transform duration-300 flex flex-shrink-0 items-center justify-center w-5 h-5",
        isActive ? "scale-110" : "group-hover/sidebar:scale-110"
      )}>
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="relative z-10 font-label-md whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
