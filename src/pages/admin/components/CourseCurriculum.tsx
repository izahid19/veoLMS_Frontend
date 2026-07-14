import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, BookOpen } from 'lucide-react';
import { adminCreateSection } from '../../../crud/course.crud';
import { toast } from '../../../Utils/toast';
import SectionItem from './SectionItem';
import type { ICourseDetail } from '../../../types/course.types';

const CurriculumTab = ({ course, courseId }: { course: ICourseDetail; courseId: string }) => {
  const queryClient = useQueryClient();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const createSectionMutation = useMutation({
    mutationFn: (data: { title: string }) => adminCreateSection(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setIsAddingSection(false);
      setNewSectionTitle('');
      toast.success('Section added');
    },
    onError: () => toast.error('Failed to create section'),
  });

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      createSectionMutation.mutate({ title: newSectionTitle });
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {!course.sections || course.sections.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-surface-border rounded-2xl shadow-sm">
          <BookOpen className="w-12 h-12 text-primary-container/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-on-surface">Curriculum is empty</h3>
          <p className="text-on-surface-variant text-sm mt-2 mb-6">
            Start by adding a section to organize your lessons.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {course.sections.map((section) => (
            <SectionItem key={section._id} section={section} courseId={courseId} />
          ))}
        </div>
      )}

      {isAddingSection ? (
        <div className="flex items-center gap-3">
          <input
            autoFocus
            placeholder="e.g. Introduction to the Course"
            className="flex-1 bg-surface border border-surface-border px-4 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 transition-all"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection();
              if (e.key === 'Escape') setIsAddingSection(false);
            }}
          />
          <button
            onClick={handleAddSection}
            disabled={createSectionMutation.isPending || !newSectionTitle.trim()}
            className="px-5 py-2.5 bg-on-surface text-background rounded-lg font-semibold text-sm hover:bg-on-surface/90 disabled:opacity-50 transition-colors"
          >
            Add Section
          </button>
          <button
            onClick={() => setIsAddingSection(false)}
            className="p-2.5 text-on-surface-variant hover:bg-surface-dim hover:text-on-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingSection(true)}
          className="flex items-center gap-2 text-sm font-semibold text-primary-container hover:text-primary-hover transition-colors px-2 py-1"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      )}
    </div>
  );
};

export default CurriculumTab;
