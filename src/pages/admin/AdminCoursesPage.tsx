import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  GraduationCap,
  ImageOff,
  AlertTriangle,
} from 'lucide-react';

import { adminGetAllCourses, adminDeleteCourse, adminTogglePublish } from '../../crud/course.crud';
import type { ICourse } from '../../types/course.types';
import { toast } from '../../Utils/toast';
import { cn, formatPrice, formatDuration } from '../../Utils/helpers';
import { Modal } from '../../components/ui/modal';



// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <tr className="border-b border-surface-border animate-pulse">
    {[60, 200, 80, 60, 80, 100].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div
          className="h-4 bg-surface-dim rounded-lg"
          style={{ width: i === 0 ? 60 : `${w}px`, height: i === 0 ? 40 : 16 }}
        />
      </td>
    ))}
  </tr>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  isPublished: boolean;
  onClick: () => void;
  loading: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isPublished, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    title={isPublished ? 'Click to unpublish' : 'Click to publish'}
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 border',
      'hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
      isPublished
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
        : 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40 hover:bg-zinc-700/60',
    )}
  >
    <span
      className={cn(
        'w-1.5 h-1.5 rounded-full',
        isPublished ? 'bg-emerald-400' : 'bg-zinc-500',
        loading && 'animate-pulse',
      )}
    />
    {isPublished ? 'Published' : 'Draft'}
  </button>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 px-8 text-center"
  >
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-3xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
        <BookOpen className="w-10 h-10 text-primary-container" />
      </div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-surface border-2 border-surface-border flex items-center justify-center">
        <Plus className="w-4 h-4 text-on-surface-variant" />
      </div>
    </div>
    <h3 className="text-xl font-bold text-on-surface mb-2">No courses yet</h3>
    <p className="text-on-surface-variant text-sm max-w-xs mb-8">
      Create your first course and start building your academy.
    </p>
    <button
      onClick={onCreateClick}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-white font-semibold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] hover:shadow-[0_0_24px_rgba(255,107,0,0.55)] hover:-translate-y-0.5 transition-all duration-300"
    >
      <Plus className="w-4 h-4" />
      Create your first course
    </button>
  </motion.div>
);

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

interface DeleteModalProps {
  course: ICourse | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ course, onClose, onConfirm, isDeleting }) => (
  <Modal
    isOpen={!!course}
    onClose={onClose}
    title={
      <span className="flex items-center gap-2 text-red-400">
        <AlertTriangle className="w-5 h-5" />
        Delete Course
      </span>
    }
    description={
      course
        ? `Are you sure you want to delete "${course.title}"? This will permanently remove all sections, lessons, videos, enrollments, and progress records.`
        : ''
    }
  >
    <div className="flex items-center justify-end gap-3 mt-6">
      <button
        onClick={onClose}
        disabled={isDeleting}
        className="px-5 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={isDeleting}
        className="group/btn relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-[0_4px_12px_rgba(239,68,68,0.4)] hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {isDeleting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Deleting…
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete Course
          </>
        )}
      </button>
    </div>
  </Modal>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [courseToDelete, setCourseToDelete] = useState<ICourse | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Data Fetching ────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const res = await adminGetAllCourses();
      return res.data.data;
    },
  });

  // ── Delete Mutation ──────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      toast.success('Course deleted successfully');
      setCourseToDelete(null);
    },
    onError: () => {
      toast.error('Failed to delete course. Please try again.');
    },
  });

  // ── Toggle Publish Mutation ───────────────────────────────────────────────

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminTogglePublish(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      const isPublished = res.data.data.isPublished;
      toast.success(isPublished ? 'Course published' : 'Course unpublished');
      setTogglingId(null);
    },
    onError: () => {
      toast.error('Failed to update publish status.');
      setTogglingId(null);
    },
  });

  const handleTogglePublish = (course: ICourse) => {
    setTogglingId(course._id);
    toggleMutation.mutate(course._id);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) deleteMutation.mutate(courseToDelete._id);
  };

  const courses = data ?? [];

  return (
    <div className="min-h-full">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Manage Courses</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isLoading
              ? 'Loading…'
              : `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} total`}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/courses/create')}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-white font-semibold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] hover:shadow-[0_0_28px_rgba(255,107,0,0.55)] hover:-translate-y-0.5 transition-all duration-300 self-start sm:self-auto overflow-hidden relative"
        >
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Create Course</span>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.15),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
      >
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <AlertTriangle className="w-10 h-10 text-error mb-4" />
            <p className="text-on-surface font-semibold">Failed to load courses</p>
            <p className="text-on-surface-variant text-sm mt-1">
              Check your connection and refresh the page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface-dim/50">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState onCreateClick={() => navigate('/admin/courses/create')} />
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {courses.map((course, idx) => (
                      <motion.tr
                        key={course._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.04 }}
                        className="border-b border-surface-border last:border-0 hover:bg-surface-dim/40 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="px-4 py-3.5">
                          <div className="w-[60px] h-[40px] rounded-lg overflow-hidden bg-surface-dim border border-surface-border flex-shrink-0 flex items-center justify-center">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageOff className="w-4 h-4 text-on-surface-variant/40" />
                            )}
                          </div>
                        </td>

                        {/* Title + Slug */}
                        <td className="px-4 py-3.5 max-w-[240px]">
                          <p className="font-medium text-on-surface truncate leading-snug">
                            {course.title}
                          </p>
                          <p className="text-xs text-on-surface-variant/60 font-mono mt-0.5 truncate">
                            /{course.slug}
                          </p>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              'font-semibold',
                              course.price === 0
                                ? 'text-emerald-400'
                                : 'text-on-surface',
                            )}
                          >
                            {formatPrice(course.price)}
                          </span>
                        </td>

                        {/* Lessons */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>{course.totalLessons}</span>
                            {course.totalDuration > 0 && (
                              <span className="text-xs text-on-surface-variant/50">
                                · {formatDuration(course.totalDuration)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5">
                          <StatusBadge
                            isPublished={course.isPublished}
                            onClick={() => handleTogglePublish(course)}
                            loading={togglingId === course._id}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {/* Edit */}
                            <button
                              onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                              title="Edit course"
                              className="p-2 rounded-lg text-on-surface-variant hover:text-primary-container hover:bg-primary-container/10 transition-all duration-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => setCourseToDelete(course)}
                              title="Delete course"
                              className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      <DeleteModal
        course={courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
