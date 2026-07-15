import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { TipTapEditor } from '../../components/ui/TipTapEditor';
import { ThumbnailUpload } from '../../components/ui/ThumbnailUpload';
import { ArrowLeft, Check, Plus, Upload } from 'lucide-react';
import { Modal } from '../../components/ui/modal';
import {
  adminCreateCourse,
  adminUploadThumbnail,
  adminGetAllInstructors,
  adminCreateInstructor,
  adminUploadInstructorAvatar
} from '../../crud/course.crud';
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
  instructor: Yup.string().required('Instructor is required'),
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Quick Add Instructor Modal States
  const [isAddInstModalOpen, setIsAddInstModalOpen] = useState(false);
  const [instFullName, setInstFullName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instAvatarFile, setInstAvatarFile] = useState<File | null>(null);
  const [instAvatarPreview, setInstAvatarPreview] = useState<string | null>(null);
  const [isSavingInst, setIsSavingInst] = useState(false);

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const res = await adminGetAllInstructors();
      return res.data.data;
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInstAvatarFile(file);
      setInstAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleQuickAddInstructor = async (setFieldValue: (field: string, value: any) => void) => {
    if (!instFullName.trim() || !instEmail.trim()) {
      toast.error('Name and Email are required');
      return;
    }
    setIsSavingInst(true);
    try {
      const parts = instFullName.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const res = await adminCreateInstructor({
        firstName,
        lastName,
        emailId: instEmail.trim()
      });

      const newInst = res.data.data;

      if (instAvatarFile) {
        await adminUploadInstructorAvatar(newInst._id, instAvatarFile);
      }

      await queryClient.invalidateQueries({ queryKey: ['instructors'] });
      setFieldValue('instructor', newInst._id);
      setIsAddInstModalOpen(false);
      toast.success('Instructor created and selected!');

      // Reset form
      setInstFullName('');
      setInstEmail('');
      setInstAvatarFile(null);
      setInstAvatarPreview(null);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to save instructor';
      toast.error(msg);
    } finally {
      setIsSavingInst(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (values: { title: string; description: string; price: number; isPublished: boolean; instructor: string }) => {
      // 1. Create course (convert price from ₹ to paise)
      const createRes = await adminCreateCourse({
        title: values.title,
        description: values.description,
        price: Math.round(values.price * 100),
        isPublished: values.isPublished,
        instructor: values.instructor,
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
          instructor: '',
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

              {/* Instructor Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-on-surface">
                    Instructor <span className="text-error">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddInstModalOpen(true)}
                    className="text-xs font-semibold text-primary-container hover:text-primary-hover flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Instructor
                  </button>
                </div>
                <Field
                  as="select"
                  name="instructor"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl bg-background border transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                    errors.instructor && touched.instructor
                      ? 'border-error text-error focus:border-error'
                      : 'border-surface-border text-on-surface focus:border-primary-container'
                  )}
                >
                  <option value="">Select an instructor...</option>
                  {instructors?.map((inst: any) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.firstName} {inst.lastName} ({inst.emailId})
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="instructor" component="p" className="mt-2 text-sm text-error" />

                {/* Quick Add Instructor Modal */}
                <Modal
                  isOpen={isAddInstModalOpen}
                  onClose={() => setIsAddInstModalOpen(false)}
                  title="Add New Instructor"
                >
                  <div className="space-y-4 pt-2">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-4">
                      <div className="relative group">
                        {instAvatarPreview ? (
                          <img src={instAvatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary-container/30" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center border-2 border-dashed border-surface-border">
                            <Upload className="w-6 h-6 text-on-surface-variant/40" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      </div>
                      <span className="text-xs text-on-surface-variant">Choose Profile Image (Optional)</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={instFullName}
                        onChange={(e) => setInstFullName(e.target.value)}
                        className="w-full bg-background border border-surface-border text-on-surface text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-container"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-on-surface-variant mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. john@email.com"
                        value={instEmail}
                        onChange={(e) => setInstEmail(e.target.value)}
                        className="w-full bg-background border border-surface-border text-on-surface text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-container"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                      <button
                        type="button"
                        onClick={() => setIsAddInstModalOpen(false)}
                        className="px-5 py-2.5 bg-transparent border border-surface-border text-on-surface font-semibold text-sm rounded-lg hover:bg-surface transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddInstructor(setFieldValue)}
                        disabled={isSavingInst}
                        className="px-5 py-2.5 bg-primary-container text-white font-semibold text-sm rounded-lg transition-colors shadow-lg disabled:opacity-50"
                      >
                        {isSavingInst ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </Modal>
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
