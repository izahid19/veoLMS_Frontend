import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { adminDeleteCourse } from '../../../crud/course.crud';
import { toast } from '../../../Utils/toast';
import { Modal } from '../../../components/ui/modal';
import type { ICourseDetail } from '../../../types/course.types';

const CourseSettings = ({ course, courseId }: { course: ICourseDetail; courseId: string }) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteCourse(courseId),
    onSuccess: () => {
      toast.success('Course deleted permanently');
      navigate('/admin/courses');
    },
    onError: () => toast.error('Failed to delete course'),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="bg-red-600/5 border border-red-600/20 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" /> Danger Zone
        </h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Once you delete a course, there is no going back. Please be certain. All related data including sections, lessons, videos, and enrollments will be permanently wiped.
        </p>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="px-6 py-3 rounded-xl border border-red-600 text-red-600 font-semibold text-sm hover:bg-red-600 hover:text-white transition-colors"
        >
          Delete Course
        </button>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Course"
        description="This action cannot be undone. This will permanently delete the course."
      >
        <div className="mt-4 space-y-4">
          <p className="text-sm text-on-surface">
            Please type <strong className="font-mono text-red-600 select-none">{course.title}</strong> to confirm.
          </p>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-background border border-surface-border focus:border-red-600 focus:ring-1 focus:ring-red-600 text-on-surface text-sm transition-colors outline-none"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={course.title}
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-dim transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteConfirmText !== course.title || deleteMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseSettings;
