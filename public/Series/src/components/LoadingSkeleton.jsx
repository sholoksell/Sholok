function LoadingSkeleton({ count = 8, variant = 'card' }) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="skeleton aspect-[3/4] rounded-2xl" />
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
