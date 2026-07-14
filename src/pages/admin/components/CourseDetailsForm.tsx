import React, { useState } from 'react';
import type { AxiosError } from 'axios';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { cn } from '../../../Utils/helpers';
import {
  adminUpdateCourse,
  adminUploadThumbnail,
  adminGetAllInstructors,
  adminCreateInstructor,
  adminUploadInstructorAvatar
} from '../../../crud/course.crud';
import { Plus, Upload } from 'lucide-react';
import { Modal } from '../../../components/ui/modal';
import { toast } from '../../../Utils/toast';
import { TipTapEditor } from '../../../components/ui/TipTapEditor';
import { ThumbnailUpload } from '../../../components/ui/ThumbnailUpload';
import type { ICourseDetail } from '../../../types/course.types';

const courseValidationSchema = Yup.object({
  title: Yup.string().required('Title is required').min(5).max(150),
  description: Yup.string().required('Description is required').test('min-length', 'Description must be at least 20 characters', (value) => {
    if (!value) return false;
    const stripped = value.replace(/<[^>]+>/g, '').trim();
    return stripped.length >= 20;
  }),
  price: Yup.number().typeError('Price must be a number').required('Price is required').min(0),
  isPublished: Yup.boolean().default(false),
  discountPercent: Yup.number().min(0).max(100),
  discountExpiresAt: Yup.string().nullable(),
  taxPercent: Yup.number().oneOf([0, 5, 12, 18, 28]),
  instructor: Yup.string().required('Instructor is required'),
});

interface DetailsTabProps {
  course: ICourseDetail;
  courseId: string;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ course, courseId }) => {
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
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create instructor';
      toast.error(msg);
    } finally {
      setIsSavingInst(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (values: {
      title: string;
      description: string;
      price: number;
      isPublished: boolean;
      discountPercent: number;
      discountExpiresAt: string;
      taxPercent: number;
      instructor: string;
    }) => {
      const payload: Partial<{
        title: string;
        description: string;
        price: number;
        isPublished: boolean;
        discountPercent: number;
        discountExpiresAt: string | null;
        taxPercent: number;
        instructor: string;
      }> = {};

      if (values.title !== course.title) payload.title = values.title;
      if (values.description !== course.description) payload.description = values.description;
      if (values.instructor !== (typeof course.instructor === 'object' ? course.instructor?._id : course.instructor)) {
        payload.instructor = values.instructor;
      }
      const newPrice = Math.round(values.price * 100);
      if (newPrice !== course.price) payload.price = newPrice;
      if (values.isPublished !== course.isPublished) payload.isPublished = values.isPublished;
      if (values.discountPercent !== (course.discountPercent || 0)) payload.discountPercent = values.discountPercent;
      if (values.taxPercent !== (course.taxPercent || 18)) payload.taxPercent = Number(values.taxPercent);

      const newExpiry = values.discountExpiresAt ? new Date(values.discountExpiresAt).toISOString() : null;
      const oldExpiry = course.discountExpiresAt ? new Date(course.discountExpiresAt).toISOString() : null;
      if (newExpiry !== oldExpiry) {
        payload.discountExpiresAt = newExpiry;
      }

      if (Object.keys(payload).length > 0) {
        await adminUpdateCourse(courseId, payload);
      }

      if (thumbnail) {
        await adminUploadThumbnail(courseId, thumbnail);
      }
    },
    onSuccess: () => {
      toast.success('Course details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setThumbnail(null);
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || 'Failed to update course details');
    },
  });

  return (
    <Formik
      initialValues={{
        title: course.title,
        description: course.description,
        price: course.price / 100,
        isPublished: course.isPublished,
        discountPercent: course.discountPercent || 0,
        discountExpiresAt: course.discountExpiresAt
          ? new Date(course.discountExpiresAt).toISOString().slice(0, 16)
          : '',
        taxPercent: course.taxPercent || 18,
        instructor: typeof course.instructor === 'object'
          ? (course.instructor?._id ?? '')
          : (course.instructor ?? ''),
      }}
      enableReinitialize
      validationSchema={courseValidationSchema}
      onSubmit={(values) => {
        updateMutation.mutate(values);
      }}
    >
      {({ values, errors, touched, setFieldValue, dirty }) => (
        <Form className="space-y-8 pb-20">
          <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">

            {/* Title */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-semibold text-on-surface">Course Title *</label>
                <span className="text-xs text-on-surface-variant">{values.title.length}/150</span>
              </div>
              <Field
                name="title"
                className={cn(
                  'w-full px-4 py-3 rounded-xl bg-background border transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/20',
                  errors.title && touched.title ? 'border-error text-error' : 'border-surface-border text-on-surface'
                )}
              />
              <ErrorMessage name="title" component="p" className="mt-2 text-sm text-error" />
            </div>

            {/* Instructor Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-on-surface">Instructor *</label>
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
                  errors.instructor && touched.instructor ? 'border-error text-error' : 'border-surface-border text-on-surface'
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
                        <div className="w-20 h-20 rounded-full bg-[#1e1e1e] flex items-center justify-center border-2 border-dashed border-[#262626]">
                          <Upload className="w-6 h-6 text-[#737373]" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                    <span className="text-xs text-[#a3a3a3]">Choose Profile Image (Optional)</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#a3a3a3] mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={instFullName}
                      onChange={(e) => setInstFullName(e.target.value)}
                      className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#404040]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#a3a3a3] mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@email.com"
                      value={instEmail}
                      onChange={(e) => setInstEmail(e.target.value)}
                      className="w-full bg-[#131313] border border-[#262626] text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#404040]"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setIsAddInstModalOpen(false)}
                      className="px-5 py-2.5 bg-transparent border border-[#262626] text-white font-semibold text-sm rounded-lg hover:bg-[#262626] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddInstructor(setFieldValue)}
                      disabled={isSavingInst}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#e05300] hover:from-[#e05300] hover:to-[#c74600] text-white font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-[#ff6b00]/10 disabled:opacity-50"
                    >
                      {isSavingInst ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </Modal>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Course Description *</label>
              <TipTapEditor
                value={values.description}
                onChange={(val) => setFieldValue('description', val)}
                isError={!!(errors.description && touched.description)}
              />
              <ErrorMessage name="description" component="p" className="mt-2 text-sm text-error" />
            </div>

            {/* Pricing Section Card */}
            <div className="bg-[#131313] border border-[#262626] rounded-[12px] p-5 space-y-6">
              <h2 className="text-lg font-semibold text-white mb-2">Pricing &amp; Discount</h2>

              {/* Base Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Base Price (₹) *</label>
                <div className="relative max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <Field
                    name="price"
                    type="number"
                    min="0"
                    className={cn(
                      'w-full pl-8 pr-4 py-3 rounded-xl bg-[#0a0a0a] border transition-all focus:outline-none focus:ring-2 focus:ring-[#ff6b00]/20',
                      errors.price && touched.price ? 'border-red-500 text-red-500' : 'border-[#333] text-white focus:border-[#ff6b00]'
                    )}
                  />
                </div>
                <ErrorMessage name="price" component="p" className="mt-2 text-sm text-red-500" />
              </div>

              {/* Course Discount */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Percentage</label>
                <div className="flex items-center gap-4 max-w-lg">
                  <Field
                    type="range"
                    name="discountPercent"
                    min="0"
                    max="100"
                    step="5"
                    className="flex-1 accent-[#ff6b00]"
                  />
                  <div className="w-20">
                    <Field
                      type="number"
                      name="discountPercent"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#ff6b00]"
                    />
                  </div>
                </div>
                {values.discountPercent > 0 && (
                  <p className="mt-2 text-sm text-gray-400">
                    Students pay ₹{Math.round(values.price * (1 - values.discountPercent / 100))} (₹{Math.round(values.price * (values.discountPercent / 100))} off)
                  </p>
                )}
                <ErrorMessage name="discountPercent" component="p" className="mt-2 text-sm text-red-500" />
              </div>

              {/* Discount Expiry */}
              {values.discountPercent > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Discount Expires On (optional)</label>
                  <Field
                    type="datetime-local"
                    name="discountExpiresAt"
                    className="w-full max-w-xs px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#ff6b00]"
                  />
                  <p className="mt-2 text-xs text-gray-500">Leave empty for permanent discount</p>
                </div>
              )}

              {/* Tax */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tax / GST Percentage</label>
                <Field
                  as="select"
                  name="taxPercent"
                  className="w-full max-w-xs px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#333] text-white focus:outline-none focus:border-[#ff6b00]"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18% (Default)</option>
                  <option value="28">28%</option>
                </Field>
                <p className="mt-2 text-xs text-gray-500">Applied on final price after discounts</p>
              </div>

              {/* LIVE PRICE PREVIEW card */}
              <div className="bg-[#0a0a0a] border border-[#ff6b00]/30 rounded-lg p-4 max-w-md font-mono text-sm space-y-2 mt-4">
                <div className="flex justify-between text-gray-400">
                  <span>Base price:</span>
                  <span>₹{values.price || 0}</span>
                </div>
                {values.discountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({values.discountPercent}%):</span>
                    <span>- ₹{Math.round((values.price || 0) * (values.discountPercent / 100))}</span>
                  </div>
                )}
                {values.discountPercent > 0 && (
                  <div className="flex justify-between text-gray-400 pt-1 border-t border-[#333]">
                    <span>After discount:</span>
                    <span>₹{Math.round((values.price || 0) * (1 - values.discountPercent / 100))}</span>
                  </div>
                )}
                {values.taxPercent > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>GST ({values.taxPercent}%):</span>
                    <span>+ ₹{Math.round(Math.round((values.price || 0) * (1 - values.discountPercent / 100)) * (values.taxPercent / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-white pt-2 border-t border-[#333] mt-2">
                  <span>Student pays:</span>
                  <span className="text-[#ff6b00] font-bold text-base">
                    ₹{Math.round(Math.round((values.price || 0) * (1 - values.discountPercent / 100)) * (1 + values.taxPercent / 100))}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2">Course Thumbnail</label>
              <ThumbnailUpload file={thumbnail} onChange={setThumbnail} existingUrl={course.thumbnail} />
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 sticky bottom-6 z-40">
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
              </div>
            </div>

            <button
              type="submit"
              disabled={(!dirty && !thumbnail) || updateMutation.isPending}
              className="group flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-container text-white font-semibold text-sm shadow-[0_4px_16px_rgba(255,107,0,0.35)] hover:shadow-[0_0_28px_rgba(255,107,0,0.55)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default DetailsTab;
