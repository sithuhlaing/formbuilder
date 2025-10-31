'use client';

type SkeletonLoaderProps = {
  count?: number;
  className?: string;
};

const baseClasses =
  'animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

export default function SkeletonLoader({
  count = 1,
  className = 'h-32',
}: SkeletonLoaderProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${className}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
