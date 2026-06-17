interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseStyles =
    'animate-pulse bg-gradient-to-r from-surface-200 via-surface-100 to-surface-200 dark:from-surface-800 dark:via-surface-700 dark:to-surface-800 bg-[length:200%_100%] animate-shimmer';

  const variantStyles = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="group p-6 rounded-3xl bg-surface-0 dark:bg-surface-900 border border-surface-200/60 dark:border-surface-800/60">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-4 border-t border-surface-200/60 dark:border-surface-800/60">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-surface-200/60 dark:border-surface-800/60 rounded-2xl overflow-hidden">
      <div className="bg-surface-50 dark:bg-surface-850 px-6 py-4 border-b border-surface-200/60 dark:border-surface-800/60">
        <div className="flex gap-8">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="divide-y divide-surface-200/60 dark:divide-surface-800/60 bg-surface-0 dark:bg-surface-900">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-8 items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-surface-0 dark:bg-surface-900 border border-surface-200/60 dark:border-surface-800/60">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" variant="text" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" variant="text" />
        <Skeleton className="h-4 w-full" variant="text" />
        <Skeleton className="h-4 w-2/3" variant="text" />
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="h-4 w-24" variant="text" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
