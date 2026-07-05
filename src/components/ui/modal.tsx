import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../Utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "w-full max-w-md bg-surface border border-surface-border rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden pointer-events-auto relative flex flex-col",
                className
              )}
            >
              {/* Cinematic Background Glow inside Modal */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-primary/10 blur-[80px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-50%] right-[-20%] w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full mix-blend-screen" />
              </div>

              {/* Header */}
              {(title || description) && (
                <div className="px-6 pt-6 pb-4 relative z-10">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:text-white hover:bg-surface-dim transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {title && (
                    <h2 className="text-xl font-display-sm text-on-surface font-bold pr-8">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {description}
                    </p>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="px-6 pb-6 relative z-10 flex-1">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
