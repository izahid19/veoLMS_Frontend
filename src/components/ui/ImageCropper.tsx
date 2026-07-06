import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal } from './modal';
import { getCroppedImg } from '../../Utils/cropImage';
import { toast } from '../../Utils/toast';
import { Scissors } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  aspectRatio?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
  aspectRatio = 16 / 9,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imageUrl = React.useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : '';
  }, [imageFile]);

  const onCropCompleteHandler = useCallback((croppedArea: any, currentCroppedAreaPixels: any) => {
    setCroppedAreaPixels(currentCroppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageFile || !croppedAreaPixels) return;
    try {
      setIsProcessing(true);
      const croppedFile = await getCroppedImg(imageUrl, croppedAreaPixels, imageFile.name);
      onCropComplete(croppedFile);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!imageFile) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-on-surface">
          <Scissors className="w-5 h-5 text-primary-container" /> Crop Image
        </span>
      }
    >
      <div className="relative w-full h-[300px] sm:h-[400px] bg-black rounded-xl overflow-hidden mt-4">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-sm font-semibold text-on-surface-variant">Zoom</span>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-primary-container"
        />
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-dim transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="px-6 py-2.5 rounded-xl bg-primary-container text-white font-semibold hover:bg-[#e65a00] transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Cropping...' : 'Apply Crop'}
        </button>
      </div>
    </Modal>
  );
};
