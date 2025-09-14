'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  loading?: 'lazy' | 'eager'
}

export default function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 85,
  loading = 'lazy',
}: OptimizedImageProps) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        loading={loading}
        className={cn('object-cover', fill ? 'position-absolute' : '')}
      />
    </div>
  );
}
