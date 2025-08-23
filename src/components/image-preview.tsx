"use client";

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  RotateCw
} from 'lucide-react';
import Image from 'next/image';

interface ImageFile {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface ImagePreviewProps {
  images: ImageFile[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (imageId: string) => void;
}

export function ImagePreview({ 
  images, 
  currentIndex, 
  onIndexChange, 
  open, 
  onOpenChange,
  onDelete 
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  if (!images.length || !images[currentIndex]) return null;
  
  const currentImage = images[currentIndex];
  
  const handlePrevious = () => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
    setZoom(100);
    setRotation(0);
  };
  
  const handleNext = () => {
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
    setZoom(100);
    setRotation(0);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 400));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.file_url;
    link.download = currentImage.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleNext();
        break;
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        handleRotate();
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium">{currentImage.file_name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>{currentIndex + 1} of {images.length}</span>
                <span>•</span>
                <span>{new Date(currentImage.uploaded_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setZoom(100)}
                className="text-white hover:bg-white/10"
              >
                {zoom}%
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/10"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/10"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRotate}
                className="text-white hover:bg-white/10"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(currentImage.id)}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              size="lg"
              variant="ghost"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/10 h-12 w-12"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/10 h-12 w-12"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Image */}
        <div className="flex items-center justify-center min-h-[60vh] p-16 pt-20">
          <div 
            className="transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
          >
            <Image
              src={currentImage.file_url}
              alt={currentImage.file_name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              style={{ maxWidth: '80vw', maxHeight: '70vh' }}
            />
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 p-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => onIndexChange(index)}
                  className={`
                    relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${index === currentIndex 
                      ? 'border-white shadow-lg' 
                      : 'border-gray-600 hover:border-gray-400 opacity-60 hover:opacity-100'
                    }
                  `}
                >
                  <Image
                    src={image.file_url}
                    alt={image.file_name}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-20 left-4 text-xs text-gray-400 space-y-1">
          <p>← → Navigate • + - Zoom • R Rotate • ESC Close</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Thumbnail Grid Component for showing multiple images
interface ImageThumbnailGridProps {
  images: ImageFile[];
  onImageClick: (index: number) => void;
  className?: string;
}

export function ImageThumbnailGrid({ images, onImageClick, className = '' }: ImageThumbnailGridProps) {
  if (!images.length) return null;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${className}`}>
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onImageClick(index)}
          className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-all duration-200"
        >
          <Image
            src={image.file_url}
            alt={image.file_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/50 rounded-full p-1">
              <Maximize2 className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <p className="text-xs text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {image.file_name}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}