export function SkeletonLine({ width = "100%", height = 14, className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/50 ${className}`}
      style={{ width, height }}
    />
  );
}

export function MailSkeleton({ rows = 8 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl p-3 glass">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="40%" />
            <SkeletonLine width="70%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}
