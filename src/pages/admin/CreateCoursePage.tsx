import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TipTapEditor } from '../../components/ui/TipTapEditor';
import { ThumbnailUpload } from '../../components/ui/ThumbnailUpload';
import { ArrowLeft, Check } from 'lucide-react';
import { adminCreateCourse, adminUploadThumbnail } from '../../crud/course.crud';
import { toast } from '../../Utils/toast';
import { cn } from '../../Utils/helpers';

// ─── Form Schema ──────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: Yup.string()
    .required('Description is required')
    // Remove HTML tags for length calculation
    .test('min-length', 'Description must be at least 20 characters', (value) => {
      if (!value) return false;
      const stripped = value.replace(/<[^>]+>/g, '').trim();
      return stripped.length >= 20;
    }),
  price: Yup.number()
    .typeError('Price must be a number')
    .required('Price is required')
    .min(0, 'Price cannot be negative'),
  isPublished: Yup.boolean().default(false),
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: async (values: { title: string; description: string; price: number; isPublished: boolean }) => {
      // 1. Create course (convert price from ₹ to paise)
      const createRes = await adminCreateCourse({
        title: values.title,
        description: values.description,
        price: Math.round(values.price * 100),
        isPublished: values.isPublished,
      });

      const newCourseId = createRes.data.data._id;

      // 2. Upload thumbnail if selected
      if (thumbnail) {
        await adminUploadThumbnail(newCourseId, thumbnail);
      }

      return newCourseId;
    },
    onSuccess: (courseId) => {
      toast.success('Course created successfully!');
      navigate(`/admin/courses/${courseId}/edit`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    },
  });

  return (
    <div className="w-full pb-12">
      {/* ── Progress Bar ───────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-surface-border z-50">
        <div
          className={cn(
            'h-full bg-primary-container transition-all duration-300 ease-out',
            createMutation.isPending ? 'w-2/3 animate-pulse' : createMutation.isSuccess ? 'w-full' : 'w-0'
          )}
        />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/courses')}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface border border-transparent hover:border-surface-border transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Create New Course</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Fill in the details below to start building your course.
          </p>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <Formik
        initialValues={{
          title: '',
          description: '',
          price: 0,
          isPublished: false,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          createMutation.mutate(values);
        }}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className="space-y-8">
            <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
              
              {/* Title */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-on-surface">
                    Course Title <span className="text-error">*</span>
                  </label>
                  <span className="text-xs text-on-surface-variant">
                    {values.title.length}/150
                  </span>
                </div>
                <Field
                  name="title"
                  type="text"
                  placeholder="e.g., Advanced React Patterns 2026"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-background border transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                    errors.title && touched.title
                      ? 'border-error focus:border-error text-error'
                      : 'border-surface-border focus:border-primary-container text-on-surface'
                  )}
                />
                <ErrorMessage name="title" component="p" className="mt-2 text-sm text-error" />
              </div>

              {/* Description (TipTap) */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Course Description <span className="text-error">*</span>
                </label>
                <TipTapEditor
                  value={values.description}
                  onChange={(val) => setFieldValue('description', val)}
                  isError={!!(errors.description && touched.description)}
                />
                <ErrorMessage name="description" component="p" className="mt-2 text-sm text-error" />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-on-surface mb-2">
                  Price (₹) <span className="text-error">*</span>
                </label>
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-on-surface-variant">₹</span>
                  </div>
                  <Field
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    className={cn(
                      'w-full pl-8 pr-4 py-3 rounded-xl bg-background border transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                      errors.price && touched.price
                        ? 'border-error focus:border-error text-error'
                        : 'border-surface-border focus:border-primary-container text-on-surface'
                    )}
                  />
                </div>
                <ErrorMessage name="price" component="p" className="mt-2 text-sm text-error" />
                <p className="mt-2 text-sm text-on-surface-variant flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  Students will be charged: <strong className="text-on-surface">₹{(values.price || 0).toLocaleString('en-IN')}</strong>
                  {values.price === 0 && <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs font-semibold ml-2">FREE</span>}
                </p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Course Thumbnail
                </label>
                <ThumbnailUpload file={thumbnail} onChange={setThumbnail} />
              </div>

            </div>

            {/* Submit Action Bar */}
            <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 sticky bottom-6 z-40">
              
              {/* Publish Toggle */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFieldValue('isPublished', !values.isPublished)}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-background',
                    values.isPublished ? 'bg-emerald-500' : 'bg-surface-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      values.isPublished ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Publish immediately</p>
                  <p className="text-xs text-on-surface-variant">
                    {values.isPublished ? 'Course will be visible to students.' : 'Save as draft. You can publish it later.'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/admin/courses')}
                  disabled={createMutation.isPending}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-on-surface-variant hover:bg-surface-dim transition-colors disabled:opacity-50 flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="group relative flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-container text-white font-semibold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] hover:shadow-[0_0_28px_rgba(255,107,0,0.55)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 overflow-hidden flex-1 sm:flex-none"
                >
                  {createMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                      <span className="relative z-10">Saving…</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Create Course</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,45%,rgba(255,255,255,0.15),55%,transparent)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>

            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
