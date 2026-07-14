import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronDown, ChevronUp, Film, Trash2, Link, Save, Plus } from 'lucide-react';
import { adminUpdateLesson, adminDeleteLesson, adminUploadLessonVideo } from '../../../crud/course.crud';
import { toast } from '../../../Utils/toast';
import { cn, formatDuration } from '../../../Utils/helpers';
import { Modal } from '../../../components/ui/modal';
import { TipTapEditor } from '../../../components/ui/TipTapEditor';
import type { ILesson } from '../../../types/course.types';

const LessonItem = ({ lesson, courseId, isExpanded, onToggle }: { lesson: ILesson; courseId: string; isExpanded?: boolean; onToggle?: () => void }) => {
  const queryClient = useQueryClient();
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

        // Browser Î“Ã¥Ã† server transfer done: switch to "server Î“Ã¥Ã† Bunny" processing phase
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
      // Backend finished uploading to Bunny Î“Ã‡Ã¶ all done
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Video uploaded Î“Ã‡Ã¶ Bunny is processing it now');
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
    <div className="flex flex-col group/lesson transition-all duration-300 border-b border-surface-border last:border-0 hover:bg-surface-dim/20">
      {/* Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡ HEADER (Always Visible) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
      <div 
        className={cn(
          "flex items-center gap-3 p-3 transition-colors cursor-pointer",
          isExpanded ? "bg-surface-dim/40" : ""
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          if (onToggle) onToggle();
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
              if (onToggle) onToggle();
            }}
            className="p-1.5 text-on-surface-variant hover:bg-surface-dim rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡ BODY (Expanded State) Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
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
                              Î“Ã¥Ã¦ {uploadStats.speed >= 1024 * 1024
                                ? `${(uploadStats.speed / (1024 * 1024)).toFixed(1)} MB/s`
                                : `${(uploadStats.speed / 1024).toFixed(0)} KB/s`}
                            </span>
                            {uploadStats.eta > 0 && (
                              <span title="Estimated time remaining">
                                Î“Ã…â–’ {uploadStats.eta >= 60
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
                          <p className="text-xs font-semibold text-on-surface">Processing on Bunny StreamÎ“Ã‡Âª</p>
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

export default LessonItem;

