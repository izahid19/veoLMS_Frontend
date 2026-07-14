import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronDown, ChevronUp, Plus, X, Trash2 } from 'lucide-react';
import { adminUpdateSection, adminDeleteSection, adminCreateLesson } from '../../../crud/course.crud';
import { toast } from '../../../Utils/toast';
import { Modal } from '../../../components/ui/modal';
import LessonItem from './LessonItem';
import type { ISection } from '../../../types/course.types';

const SectionItem = ({ section, courseId }: { section: ISection; courseId: string }) => {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ISection>) => adminUpdateSection(section._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setIsEditingTitle(false);
    },
    onError: () => toast.error('Failed to update section'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteSection(section._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Section deleted');
    },
    onError: () => toast.error('Failed to delete section'),
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: { title: string; courseId: string }) => adminCreateLesson(section._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setIsAddingLesson(false);
      setNewLessonTitle('');
    },
    onError: () => toast.error('Failed to create lesson'),
  });

  const handleTitleSave = () => {
    if (title.trim() && title !== section.title) {
      updateMutation.mutate({ title });
    } else {
      setIsEditingTitle(false);
      setTitle(section.title);
    }
  };

  const handleAddLesson = () => {
    if (newLessonTitle.trim()) {
      createLessonMutation.mutate({ title: newLessonTitle, courseId });
    }
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div 
        className="flex items-center justify-between py-2 group/section"
      >
        <div className="flex items-center gap-3 flex-1">
          <GripVertical className="w-5 h-5 text-on-surface-variant/30 cursor-grab opacity-0 group-hover/section:opacity-100 transition-opacity" />
          {isEditingTitle ? (
            <input
              autoFocus
              className="flex-1 max-w-md bg-transparent border-b border-primary-container px-1 py-1 text-lg font-bold focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            />
          ) : (
            <h3
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="text-lg font-bold text-on-surface cursor-text hover:text-primary-container transition-colors flex-1 flex items-center gap-2"
            >
              {section.title}
              <span className="text-xs font-normal text-on-surface-variant/50 opacity-0 group-hover/section:opacity-100 transition-opacity ml-2">Click to edit</span>
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 text-on-surface-variant hover:bg-surface-dim rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-8 pr-2 py-3 space-y-2">
              {section.lessons.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-2">No lessons in this section yet.</p>
              ) : (
                section.lessons.map((lesson) => (
                  <LessonItem 
                    key={lesson._id} 
                    lesson={lesson} 
                    courseId={courseId} 
                    isExpanded={expandedLessonId === lesson._id}
                    onToggle={() => setExpandedLessonId(expandedLessonId === lesson._id ? null : lesson._id)}
                  />
                ))
              )}

              {/* Add Lesson Form */}
              {isAddingLesson ? (
                <div className="flex items-center gap-2 mt-2 ml-7">
                  <input
                    autoFocus
                    placeholder="Lesson title..."
                    className="flex-1 max-w-sm bg-surface border border-surface-border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 transition-all"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddLesson();
                      if (e.key === 'Escape') setIsAddingLesson(false);
                    }}
                  />
                  <button
                    onClick={handleAddLesson}
                    disabled={createLessonMutation.isPending || !newLessonTitle.trim()}
                    className="px-4 py-2 bg-on-surface text-background rounded-lg text-sm font-semibold hover:bg-on-surface/90 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsAddingLesson(false)}
                    className="p-2 text-on-surface-variant hover:bg-surface-dim rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingLesson(true)}
                  className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary-container transition-colors mt-3 ml-7"
                >
                  <Plus className="w-4 h-4" /> Add Lesson
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Section"
        description="Are you sure you want to delete this section and all its lessons? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-surface-border">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-dim transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsDeleteModalOpen(false);
              deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SectionItem;
