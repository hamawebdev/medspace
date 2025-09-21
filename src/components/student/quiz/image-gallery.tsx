// @ts-nocheck
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { FullScreenImageViewer } from '@/components/ui/full-screen-image-viewer';

interface ImageData {
  id: number;
  imagePath: string;
  altText?: string;
}

interface ImageGalleryProps {
  images: ImageData[];
  title?: string;
  className?: string;
  maxHeight?: string;
  gridCols?: 'auto' | 1 | 2 | 3;
  showZoom?: boolean;
  compact?: boolean;
}

// Legacy ImageModal interface kept for backward compatibility
interface ImageModalProps {
  image: ImageData;
  images: ImageData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

// Legacy ImageModal component - now just a wrapper around FullScreenImageViewer
function ImageModal(props: ImageModalProps) {
  return <FullScreenImageViewer {...props} />;
}

export function ImageGallery({
  images,
  title,
  className,
  maxHeight = "max-h-64",
  gridCols = 'auto',
  showZoom = true,
  compact = false
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [nextImageErrors, setNextImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = useCallback((imageId: number, imagePath: string, error: any) => {
    console.error(`Image failed to load - ID: ${imageId}, Path: ${imagePath}`, error);
    setImageErrors(prev => new Set(prev).add(imageId));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  const handleNextImageError = useCallback((imageId: number, imagePath: string, error: any) => {
    console.warn(`Next.js Image failed to load (likely CORP issue) - ID: ${imageId}, Path: ${imagePath}`, error);
    setNextImageErrors(prev => new Set(prev).add(imageId));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  const handleImageLoad = useCallback((imageId: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  }, []);

  const handleImageLoadStart = useCallback((imageId: number) => {
    setLoadingImages(prev => new Set(prev).add(imageId));
  }, []);

  const openModal = useCallback((index: number) => {
    if (showZoom) {
      setSelectedImageIndex(index);
    }
  }, [showZoom]);

  const closeModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const nextImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev !== null && prev < images.length - 1 ? prev + 1 : prev
    );
  }, [images.length]);

  const previousImage = useCallback(() => {
    setSelectedImageIndex(prev => 
      prev !== null && prev > 0 ? prev - 1 : prev
    );
  }, []);

  if (!images || images.length === 0) {
    return null;
  }

  // Determine grid columns - memoized for performance
  const gridClassName = useMemo(() => {
    if (gridCols !== 'auto') return `grid-cols-${gridCols}`;

    if (images.length === 1) return 'grid-cols-1';
    if (images.length === 2) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [gridCols, images.length]);

  // Determine if we should center single images
  const shouldCenterSingleImage = images.length === 1 && gridCols === 'auto';

  return (
    <>
      <div className={cn("space-y-3", className)}>

        <div className={cn(
          "grid gap-3",
          gridClassName,
          shouldCenterSingleImage && "justify-center"
        )}>
          {images.map((image, index) => {
            const hasError = imageErrors.has(image.id);
            const isLoading = loadingImages.has(image.id);

            return (
              <Card
                key={image.id}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  showZoom && !hasError && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
                  compact && "border-border/50",
                  shouldCenterSingleImage && "max-w-md mx-auto"
                )}
                onClick={() => !hasError && !isLoading && openModal(index)}
              >
                <CardContent className="p-0">
                  <div className={cn(
                    "relative bg-muted/30 flex items-center justify-center",
                    maxHeight,
                    compact ? "min-h-[120px]" : "min-h-[160px]",
                    isLoading && "quiz-image-loading"
                  )}>
                    {hasError ? (
                      <div className="text-center space-y-2 p-4">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground">Image unavailable</p>
                      </div>
                    ) : (
                      <>
                        {nextImageErrors.has(image.id) ? (
                          // Fallback to regular img tag with CORS handling for CORP issues
                          <img
                            src={image.imagePath}
                            alt={image.altText || `Image ${index + 1}`}
                            className={cn(
                              "w-full h-full object-contain transition-opacity duration-200",
                              isLoading ? "opacity-0" : "opacity-100"
                            )}
                            onError={(e) => handleImageError(image.id, image.imagePath, e)}
                            onLoad={() => handleImageLoad(image.id)}
                            onLoadStart={() => handleImageLoadStart(image.id)}
                            loading="lazy"
                            decoding="async"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          // Try Next.js Image first for optimization
                          <Image
                            src={image.imagePath}
                            alt={image.altText || `Image ${index + 1}`}
                            fill
                            className={cn(
                              "object-contain transition-opacity duration-200",
                              isLoading ? "opacity-0" : "opacity-100"
                            )}
                            onError={(e) => handleNextImageError(image.id, image.imagePath, e)}
                            onLoad={() => handleImageLoad(image.id)}
                            onLoadStart={() => handleImageLoadStart(image.id)}
                            unoptimized
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                        {showZoom && !isLoading && (
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                            <ZoomIn className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {image.altText && !compact && (
                    <div className="p-2 border-t bg-muted/20">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.altText}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          image={images[selectedImageIndex]}
          images={images}
          currentIndex={selectedImageIndex}
          isOpen={selectedImageIndex !== null}
          onClose={closeModal}
          onNext={nextImage}
          onPrevious={previousImage}
        />
      )}
    </>
  );
}
