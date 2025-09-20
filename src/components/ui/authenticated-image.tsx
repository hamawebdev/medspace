// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

function isApiImage(imagePath: string): boolean {
  return imagePath.includes('med-cortex.com/api/v1/media/');
}

export function AuthenticatedImage({
  src,
  alt,
  onError,
  onLoad,
  ...props
}: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    if (!isApiImage(src)) {
      // For non-API images, use original URL
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // Simple solution: use proxy URL directly without blob URLs
    const token = localStorage.getItem('auth_token');
    const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;

    // Set the proxy URL directly - no blob creation/revocation
    setImageSrc(proxiedUrl);
    setIsLoading(false);

  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onLoad) {
      onLoad(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-transparent animate-pulse" {...props}>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center bg-transparent" {...props}>
        <span className="text-sm text-red-500">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
