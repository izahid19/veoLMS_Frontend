import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  BookOpen,
  Layout,
  Plus,
  Trash2,
  Check,
  X,
  Film,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Link,
  Save,
} from 'lucide-react';
import { AxiosError } from 'axios';

import {
  adminGetCourseById,
  adminUpdateCourse,
  adminUploadThumbnail,
  adminDeleteCourse,
  adminCreateSection,
  adminUpdateSection,
  adminDeleteSection,
  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,
  adminUploadLessonVideo,
} from '../../crud/course.crud';
import { toast } from '../../Utils/toast';
import { cn, formatDuration } from '../../Utils/helpers';

import { TipTapEditor } from '../../components/ui/TipTapEditor';
import { ThumbnailUpload } from '../../components/ui/ThumbnailUpload';
import { Modal } from '../../components/ui/modal';

import type { ICourseDetail, ISection, ILesson } from '../../types/course.types';



// ─── Schemas ──────────────────────────────────────────────────────────────────

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
});

// ─── TAB 1: Details Form ──────────────────────────────────────────────────────

interface DetailsTabProps {
  course: ICourseDetail;
  courseId: string;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ course, courseId }) => {
  const queryClient = useQueryClient();
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const updateMutation = useMutation({
    mutationFn: async (values: { 
      title: string; 
      description: string; 
      price: number; 
      isPublished: boolean;
      discountPercent: number;
      discountExpiresAt: string;
      taxPercent: number;
    }) => {
      const payload: Partial<{ 
        title: string; 
        description: string; 
        price: number; 
        isPublished: boolean;
        discountPercent: number;
        discountExpiresAt: string | null;
        taxPercent: number;
      }> = {};
      if (values.title !== course.title) payload.title = values.title;
      if (values.description !== course.description) payload.description = values.description;
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
      setThumbnail(null); // Reset thumbnail selection after upload
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
        price: course.price / 100, // convert paise to ₹
        isPublished: course.isPublished,
        discountPercent: course.discountPercent || 0,
        discountExpiresAt: course.discountExpiresAt ? new Date(course.discountExpiresAt).toISOString().slice(0, 16) : '',
        taxPercent: course.taxPercent || 18,
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
              <h2 className="text-lg font-semibold text-white mb-2">Pricing & Discount</h2>
              
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
                {(values.discountPercent > 0) && (
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
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

// ─── TAB 2: Curriculum Builder ────────────────────────────────────────────────

// LESSON ITEM
const LessonItem = ({ lesson, courseId }: { lesson: ILesson; courseId: string }) => {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVideoRemoveModalOpen, setIsVideoRemoveModalOpen] = useState(false);

  // Rich upload tracking state
  type UploadStats = {
    percent: number;
    loaded: number;     // bytes uploaded so far
    total: number;      // total file size in bytes
    speed: number;      // bytes/sec
    eta: number;        // seconds remaining
    fileName: string;
    phase: 'uploading' | 'processing'; // uploading = to server, processing = Bunny encoding
  };
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const uploadStartRef = React.useRef<number>(0);

  // New states for content and resources
  const [content, setContent] = useState(lesson.content || '');
  const [resources, setResources] = useState<{title: string, url: string}[]>(lesson.resources || []);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const hasChanges = content !== (lesson.content || '') || JSON.stringify(resources) !== JSON.stringify(lesson.resources || []);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ILesson>) => adminUpdateLesson(lesson._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      setIsEditingTitle(false);
    },
    onError: () => toast.error('Failed to update lesson'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminDeleteLesson(lesson._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Lesson deleted');
    },
    onError: () => toast.error('Failed to delete lesson'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      uploadStartRef.current = Date.now();
      setUploadStats({ percent: 0, loaded: 0, total: file.size, speed: 0, eta: 0, fileName: file.name, phase: 'uploading' });

      return adminUploadLessonVideo(lesson._id, file, (progressEvent) => {
        if (!progressEvent.total) return;
        const loaded = progressEvent.loaded;
        const total = progressEvent.total;
        const percent = Math.round((loaded * 100) / total);

        // Browser → server transfer done: switch to "server → Bunny" processing phase
        if (percent >= 100) {
          setUploadStats(prev => prev ? { ...prev, percent: 100, phase: 'processing' } : null);
          return;
        }

        const elapsed = (Date.now() - uploadStartRef.current) / 1000;
        const speed = elapsed > 0 ? loaded / elapsed : 0;
        const eta = speed > 0 ? Math.round((total - loaded) / speed) : 0;
        setUploadStats({ percent, loaded, total, speed, eta, fileName: file.name, phase: 'uploading' });
      });
    },
    onSuccess: () => {
      // Backend finished uploading to Bunny — all done
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Video uploaded — Bunny is processing it now');
      setUploadStats(null);
    },
    onError: () => {
      toast.error('Failed to upload video');
      setUploadStats(null);
    },
  });

  const handleTitleSave = () => {
    if (title.trim() && title !== lesson.title) {
      updateMutation.mutate({ title });
    } else {
      setIsEditingTitle(false);
      setTitle(lesson.title);
    }
  };

  const handleSaveDetails = () => {
    setIsSavingDetails(true);
    adminUpdateLesson(lesson._id, { content, resources })
      .then(() => {
        toast.success('Lesson details saved');
        queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      })
      .catch(() => toast.error('Failed to save details'))
      .finally(() => setIsSavingDetails(false));
  };

  const handleAddResource = () => {
    if (newResourceTitle.trim() && newResourceUrl.trim()) {
      setResources([...resources, { title: newResourceTitle, url: newResourceUrl }]);
      setNewResourceTitle('');
      setNewResourceUrl('');
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col bg-background border border-surface-border rounded-xl group/lesson overflow-hidden transition-all duration-300">
      {/* ─── HEADER (Always Visible) ─── */}
      <div 
        className={cn(
          "flex items-center gap-3 p-3 transition-colors cursor-pointer",
          isExpanded ? "bg-surface-dim/30" : "hover:bg-surface-dim/30"
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          setIsExpanded(!isExpanded);
        }}
      >
        <GripVertical className="w-4 h-4 text-on-surface-variant/40 cursor-grab" />
        
        {/* Title Edit */}
        <div className="flex-1">
          {isEditingTitle ? (
            <input
              autoFocus
              className="w-full max-w-sm bg-surface border border-primary-container px-3 py-1.5 rounded-lg text-sm focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            />
          ) : (
            <p
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="text-sm font-medium text-on-surface hover:text-primary-container transition-colors inline-block"
            >
              {lesson.title}
            </p>
          )}
        </div>

        {/* Info Badges & Expand Chevron */}
        <div className="flex items-center gap-3">
          {lesson.isFree && (
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md uppercase">
              Free
            </span>
          )}
          {lesson.videoUrl && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-container bg-primary-container/10 px-2 py-1 rounded-md">
              <Film className="w-3.5 h-3.5" />
              <span>Video</span>
            </div>
          )}
          {lesson.duration > 0 && (
            <span className="text-xs font-mono text-on-surface-variant bg-surface-dim px-2 py-1 rounded-md">
              {formatDuration(lesson.duration)}
            </span>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1.5 text-on-surface-variant hover:bg-surface-dim rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── BODY (Expanded State) ─── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-surface-border"
          >
            <div className="p-4 flex flex-col gap-6 bg-surface-dim/10">
              
              {/* Settings Row 1: Free Preview */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-surface-border bg-background shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-on-surface">Free Preview</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Allow students to watch this lesson without purchasing the course.</p>
                </div>
                <button
                  onClick={() => updateMutation.mutate({ isFree: !lesson.isFree })}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    lesson.isFree ? 'bg-primary-container' : 'bg-surface-border'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                      lesson.isFree ? 'translate-x-[18px]' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Settings Row 2: Video Content */}
              <div>
                <p className="text-sm font-semibold text-on-surface mb-3">Lesson Video</p>
                {lesson.videoUrl ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-start p-3 border border-surface-border rounded-xl bg-background shadow-sm">
                    <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden bg-black border border-surface-border group/video shadow-sm">
                      <img 
                        src={lesson.videoUrl.replace(/\/[^/]+$/, '/thumbnail.jpg')}
                        alt="Video thumbnail" 
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary-container/90 flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3 pt-1">
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Video Attached</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-on-surface-variant">This video will be shown when students view the lesson.</p>
                          {lesson.duration > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-surface-border" />
                              <span className="text-[10px] font-mono font-medium text-primary-container bg-primary-container/10 px-1.5 py-0.5 rounded">
                                {formatDuration(lesson.duration)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setIsVideoRemoveModalOpen(true)}
                        className="self-start px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative p-6 border-2 border-dashed border-surface-border hover:border-primary-container/50 rounded-xl bg-background transition-colors flex flex-col items-center justify-center text-center gap-2 group/upload">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mkv"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploadStats !== null}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            uploadMutation.mutate(e.target.files[0]);
                          }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant group-hover/upload:text-primary-container group-hover/upload:bg-primary-container/10 transition-colors">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface group-hover/upload:text-primary-container transition-colors">Click to upload video</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">MP4, WebM, MOV, or MKV up to 1GB</p>
                    </div>
                  </div>
                )}
                
              {/* Upload progress panel */}
                {uploadStats !== null && (
                  <div className="mt-3 p-4 rounded-xl bg-surface border border-surface-border space-y-3">
                    {uploadStats.phase === 'uploading' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Film className="w-4 h-4 text-primary-container shrink-0" />
                            <span className="text-xs font-medium text-on-surface truncate max-w-[160px]">{uploadStats.fileName}</span>
                          </div>
                          <span className="text-xs font-bold text-primary-container tabular-nums">{uploadStats.percent}%</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-surface-border rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-container to-orange-400 h-2 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadStats.percent}%` }}
                          />
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between text-[11px] text-on-surface-variant tabular-nums">
                          <span>
                            {(uploadStats.loaded / (1024 * 1024)).toFixed(1)} MB
                            {' / '}
                            {(uploadStats.total / (1024 * 1024)).toFixed(1)} MB
                          </span>
                          <span className="flex items-center gap-3">
                            <span title="Upload speed">
                              ↑ {uploadStats.speed >= 1024 * 1024
                                ? `${(uploadStats.speed / (1024 * 1024)).toFixed(1)} MB/s`
                                : `${(uploadStats.speed / 1024).toFixed(0)} KB/s`}
                            </span>
                            {uploadStats.eta > 0 && (
                              <span title="Estimated time remaining">
                                ⏱ {uploadStats.eta >= 60
                                  ? `${Math.floor(uploadStats.eta / 60)}m ${uploadStats.eta % 60}s`
                                  : `${uploadStats.eta}s`}
                              </span>
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      /* Processing phase */
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-on-surface">Processing on Bunny Stream…</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">HLS encoding in progress. Duration will update automatically.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings Row 3: Description & Resources */}
              <div className="flex flex-col gap-4 p-4 border border-surface-border rounded-xl bg-background shadow-sm">
                
                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-on-surface mb-2">Lesson Description</p>
                  <TipTapEditor
                    value={content}
                    onChange={setContent}
                  />
                </div>

                {/* Resources */}
                <div className="mt-4 pt-4 border-t border-surface-border">
                  <p className="text-sm font-semibold text-on-surface mb-2">Resources & Links</p>
                  <p className="text-xs text-on-surface-variant mb-4">Attach external links, GitHub repositories, or files.</p>
                  
                  <div className="space-y-2 mb-4">
                    {resources.map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-surface-dim/30 border border-surface-border rounded-lg group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Link className="w-4 h-4 text-primary-container shrink-0" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-on-surface truncate">{res.title}</span>
                            <span className="text-xs text-on-surface-variant truncate">{res.url}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveResource(idx)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Title (e.g. GitHub Repo)"
                      className="flex-1 bg-surface-dim border border-surface-border rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container transition-colors"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="URL (https://...)"
                      className="flex-1 bg-surface-dim border border-surface-border rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container transition-colors"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddResource()}
                    />
                    <button
                      onClick={handleAddResource}
                      disabled={!newResourceTitle.trim() || !newResourceUrl.trim()}
                      className="px-4 py-2 bg-surface-border hover:bg-surface-border/80 text-on-surface rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-surface-border flex justify-end">
                  <button
                    onClick={handleSaveDetails}
                    disabled={isSavingDetails || !hasChanges}
                    className="px-4 py-2 bg-primary-container hover:bg-primary-container/90 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingDetails ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Details & Resources
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-surface-border flex justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Lesson
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
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

      <Modal
        isOpen={isVideoRemoveModalOpen}
        onClose={() => setIsVideoRemoveModalOpen(false)}
        title="Remove Video"
        description="Are you sure you want to remove this video? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-surface-border">
          <button
            onClick={() => setIsVideoRemoveModalOpen(false)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-dim transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setIsVideoRemoveModalOpen(false);
              updateMutation.mutate({ videoUrl: '', videoPublicId: '' });
            }}
            disabled={updateMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending ? 'Removing...' : 'Confirm Remove'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// SECTION ITEM
const SectionItem = ({ section, courseId }: { section: ISection; courseId: string }) => {
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    <div className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-sm mb-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-surface-bright/10 border-b border-surface-border cursor-pointer hover:bg-surface-bright/20 transition-colors"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <GripVertical className="w-5 h-5 text-on-surface-variant/40 cursor-grab" />
          {isEditingTitle ? (
            <input
              autoFocus
              className="flex-1 max-w-md bg-background border border-primary-container px-3 py-1.5 rounded-lg text-sm font-semibold focus:outline-none"
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
              className="text-base font-semibold text-on-surface cursor-pointer hover:text-primary-container transition-colors flex-1"
            >
              {section.title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            Delete
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-2 text-on-surface-variant hover:bg-surface-dim rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
            <div className="p-4 space-y-3 bg-background/50">
              {section.lessons.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">No lessons yet.</p>
              ) : (
                section.lessons.map((lesson) => (
                  <LessonItem key={lesson._id} lesson={lesson} courseId={courseId} />
                ))
              )}

              {/* Add Lesson Form */}
              {isAddingLesson ? (
                <div className="flex items-center gap-2 mt-4">
                  <input
                    autoFocus
                    placeholder="Enter lesson title..."
                    className="flex-1 bg-background border border-primary-container px-4 py-2 rounded-xl text-sm focus:outline-none"
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
                    className="p-2 bg-primary-container text-white rounded-xl hover:bg-primary-hover disabled:opacity-50"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsAddingLesson(false)}
                    className="p-2 text-on-surface-variant hover:bg-surface-dim rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingLesson(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-surface-border rounded-xl text-sm font-semibold text-on-surface-variant hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/5 transition-colors mt-4"
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
        <div className="flex items-center gap-2 bg-surface p-4 rounded-2xl border border-primary-container shadow-lg">
          <input
            autoFocus
            placeholder="Enter section title..."
            className="flex-1 bg-background border border-surface-border px-4 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-container"
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
            className="px-6 py-3 bg-primary-container text-white rounded-xl font-semibold hover:bg-primary-hover disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setIsAddingSection(false)}
            className="p-3 text-on-surface-variant hover:bg-surface-dim rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingSection(true)}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-surface-border rounded-2xl text-base font-semibold text-on-surface-variant hover:text-primary-container hover:border-primary-container/50 hover:bg-primary-container/5 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Section
        </button>
      )}
    </div>
  );
};

// ─── TAB 3: Settings Tab ──────────────────────────────────────────────────────

const SettingsTab = ({ course, courseId }: { course: ICourseDetail; courseId: string }) => {
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'settings'>('details');

  const { data, isLoading, isError } = useQuery({
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

  if (isError || !data) {
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

  const tabs = [
    { id: 'details', label: 'Course Details', icon: Layout },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/courses')}
          className="p-2 rounded-xl text-on-surface-variant hover:bg-surface border border-transparent hover:border-surface-border transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface truncate max-w-xl">{data.title}</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-mono">ID: {data._id}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-surface-border pb-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-semibold transition-all relative whitespace-nowrap',
                isActive ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-dim'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-container rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'details' && <DetailsTab course={data} courseId={id!} />}
        {activeTab === 'curriculum' && <CurriculumTab course={data} courseId={id!} />}
        {activeTab === 'settings' && <SettingsTab course={data} courseId={id!} />}
      </div>
    </div>
  );
}
