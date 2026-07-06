import React, { useState, useEffect } from 'react';
import { UploadCloud, X, Image as ImageIcon, Crop } from 'lucide-react';
import { toast } from '../../Utils/toast';
import { cn } from '../../Utils/helpers';
import { ImageCropper } from './ImageCropper';

interface ThumbnailUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string;
  aspectRatio?: number;
}

export const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({ file, onChange, existingUrl, aspectRatio = 16 / 9 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  
  // Cropper State
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(existingUrl || null);
    }
  }, [file, existingUrl]);

  const handleFile = (selectedFile: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      // Temporarily allowing slightly larger files for cropping, the cropper outputs a highly compressed version.
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }
    
    // Instead of onChange immediately, open the cropper
    setFileToCrop(selectedFile);
    setIsCropperOpen(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    onChange(croppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-200 group overflow-hidden',
            isDragging
              ? 'border-primary bg-primary/5'
              : preview
              ? 'border-surface-border bg-surface'
              : 'border-surface-border hover:border-primary/50 hover:bg-surface-dim/50'
          )}
        >
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
              // Reset input so selecting the same file again works
              e.target.value = '';
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          {preview ? (
            <div className="flex flex-col items-center w-full z-20 pointer-events-none">
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-surface-border mb-4">
                <img src={preview} alt="Thumbnail preview" className="w-full h-auto object-cover aspect-video" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-medium text-sm flex items-center gap-2">
                    <UploadCloud className="w-5 h-5" />
                    Click or drag to replace
                  </p>
                </div>
              </div>
              {file && (
                <div className="flex items-center gap-3 bg-surface border border-surface-border px-4 py-2 rounded-lg pointer-events-auto mt-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-on-surface truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">{formatFileSize(file.size)}</p>
                  </div>
                  
                  {/* Re-crop button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToCrop(file);
                      setIsCropperOpen(true);
                    }}
                    className="p-1.5 ml-2 hover:bg-surface-dim rounded-full transition-colors text-on-surface-variant hover:text-primary-container"
                    title="Recrop Image"
                  >
                    <Crop className="w-4 h-4" />
                  </button>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                    className="p-1.5 hover:bg-surface-dim rounded-full transition-colors text-on-surface-variant hover:text-error"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center z-20 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Upload Thumbnail</h3>
              <p className="text-sm text-on-surface-variant mt-2 max-w-xs">
                Drag and drop your image here, or click to browse.
              </p>
              <p className="text-xs text-on-surface-variant/60 mt-4">
                Supports JPG, PNG, WebP (Max 5MB). Will be cropped to {aspectRatio === 16/9 ? '16:9' : 'aspect ratio'}.
              </p>
            </div>
          )}
        </div>
      </div>

      <ImageCropper
        isOpen={isCropperOpen}
        onClose={() => {
          setIsCropperOpen(false);
          setFileToCrop(null);
        }}
        imageFile={fileToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
      />
    </>
  );
};
