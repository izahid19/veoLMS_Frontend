import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Film, Trash2 } from 'lucide-react';
import { adminUploadTrailer } from '../../../crud/course.crud';
import { toast } from '../../../Utils/toast';
import { cn } from '../../../Utils/helpers';
import { Modal } from '../../../components/ui/modal';
import type { ICourseDetail } from '../../../types/course.types';

interface CourseTrailerProps {
  course: ICourseDetail;
  courseId: string;
}

type UploadStats = {
  percent: number;
  loaded: number;
  total: number;
  speed: number;
  eta: number;
  fileName: string;
  phase: 'uploading' | 'processing';
};

export default function CourseTrailer({ course, courseId }: CourseTrailerProps) {
  const queryClient = useQueryClient();
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const uploadStartRef = useRef<number>(0);
  const [isVideoRemoveModalOpen, setIsVideoRemoveModalOpen] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      uploadStartRef.current = Date.now();
      setUploadStats({ percent: 0, loaded: 0, total: file.size, speed: 0, eta: 0, fileName: file.name, phase: 'uploading' });

      return adminUploadTrailer(courseId, file, (progressEvent) => {
        if (!progressEvent.total) return;
        const loaded = progressEvent.loaded;
        const total = progressEvent.total;
        const percent = Math.round((loaded * 100) / total);

        if (percent >= 100) {
          setUploadStats((prev) => prev ? { ...prev, percent: 100, phase: 'processing' } : null);
          return;
        }

        const elapsed = (Date.now() - uploadStartRef.current) / 1000;
        const speed = elapsed > 0 ? loaded / elapsed : 0;
        const eta = speed > 0 ? Math.round((total - loaded) / speed) : 0;
        setUploadStats({ percent, loaded, total, speed, eta, fileName: file.name, phase: 'uploading' });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast.success('Trailer uploaded successfully');
      setUploadStats(null);
    },
    onError: () => {
      toast.error('Failed to upload trailer');
      setUploadStats(null);
    },
  });

  return (
    <div className="bg-surface border border-surface-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Course Trailer</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Upload a short promotional video to be featured on the course details page.
        </p>
      </div>

      {course.trailerUrl ? (
        <div className="flex flex-col gap-4 p-4 border border-surface-border rounded-xl bg-background shadow-sm max-w-2xl">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-surface-border group/video shadow-sm">
            <video
              src={course.trailerUrl}
              controls
              className="w-full h-full object-contain"
              poster={course.thumbnail}
            />
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold text-on-surface">Trailer Attached</p>
              <p className="text-xs text-on-surface-variant mt-0.5">This video will be shown as a free preview on the public course page.</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => document.getElementById('trailer-upload')?.click()}
                className="px-4 py-2 text-xs font-semibold bg-primary-container text-white hover:bg-primary-container/90 rounded-lg transition-colors"
              >
                Replace Video
              </button>
            </div>
          </div>
          <input
            id="trailer-upload"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mkv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                uploadMutation.mutate(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        <div className="relative p-10 border-2 border-dashed border-surface-border hover:border-primary-container/50 rounded-xl bg-background transition-colors flex flex-col items-center justify-center text-center gap-3 group/upload max-w-2xl">
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
          <div className="w-14 h-14 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant group-hover/upload:text-primary-container group-hover/upload:bg-primary-container/10 transition-colors">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-on-surface group-hover/upload:text-primary-container transition-colors">Click to upload trailer</p>
            <p className="text-sm text-on-surface-variant mt-1">MP4, WebM, MOV, or MKV up to 1GB</p>
          </div>
        </div>
      )}

      {/* Upload progress panel */}
      {uploadStats !== null && (
        <div className="mt-4 p-5 rounded-xl bg-surface border border-surface-border space-y-4 max-w-2xl">
          {uploadStats.phase === 'uploading' ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Film className="w-5 h-5 text-primary-container shrink-0" />
                  <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">{uploadStats.fileName}</span>
                </div>
                <span className="text-sm font-bold text-primary-container tabular-nums">{uploadStats.percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-border rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-container to-orange-400 h-2.5 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadStats.percent}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs text-on-surface-variant tabular-nums font-mono">
                <span>
                  {(uploadStats.loaded / (1024 * 1024)).toFixed(1)} MB
                  {' / '}
                  {(uploadStats.total / (1024 * 1024)).toFixed(1)} MB
                </span>
                <span className="flex items-center gap-4">
                  <span title="Upload speed">
                    ↑ {uploadStats.speed >= 1024 * 1024
                      ? `${(uploadStats.speed / (1024 * 1024)).toFixed(1)} MB/s`
                      : `${(uploadStats.speed / 1024).toFixed(0)} KB/s`}
                  </span>
                  {uploadStats.eta > 0 && (
                    <span title="Estimated time remaining">
                      ⏳ {uploadStats.eta >= 60
                        ? `${Math.floor(uploadStats.eta / 60)}m ${uploadStats.eta % 60}s`
                        : `${uploadStats.eta}s`}
                    </span>
                  )}
                </span>
              </div>
            </>
          ) : (
            /* Processing phase */
            <div className="flex items-center gap-4 p-2">
              <div className="w-6 h-6 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-on-surface">Processing on Bunny Stream...</p>
                <p className="text-xs text-on-surface-variant mt-1">HLS encoding in progress. This may take a moment.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
