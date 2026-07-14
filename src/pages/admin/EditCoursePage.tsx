import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Settings,
  BookOpen,
  Layout,
  Film,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../Utils/helpers';

import { adminGetCourseById } from '../../crud/course.crud';
import CourseDetailsForm from './components/CourseDetailsForm';
import CourseCurriculum from './components/CourseCurriculum';
import CourseTrailer from './components/CourseTrailer';
import CourseSettings from './components/CourseSettings';

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'details';

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await adminGetCourseById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-container/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-error mb-4" />
        <h2 className="text-xl font-bold text-on-surface">Course not found</h2>
        <button onClick={() => navigate('/admin/courses')} className="mt-4 text-primary-container hover:underline">
          Back to Courses
        </button>
      </div>
    );
  }



  return (
    <div className="w-full pb-12">
      {/* Header Info */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary-container transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </button>
          <h1 className="text-xl font-bold text-on-surface leading-tight line-clamp-2">{course.title}</h1>
          <p className="text-xs text-on-surface-variant mt-2 font-mono break-all">ID: {course._id}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'details' && <CourseDetailsForm course={course} courseId={id!} />}
            {activeTab === 'curriculum' && <CourseCurriculum course={course} courseId={id!} />}
            {activeTab === 'trailer' && <CourseTrailer course={course} courseId={id!} />}
            {activeTab === 'settings' && <CourseSettings course={course} courseId={id!} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
