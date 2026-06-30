function BookCover({ title, gradient = 'from-brand-600 via-brand-700 to-brand-900', className = '', textSize = 'text-sm' }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient} shadow-soft ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.4)_0px,transparent_2px,transparent_10px)]" />
      <span className={`relative z-10 line-clamp-4 px-3 text-center font-semibold text-white drop-shadow ${textSize}`}>
        {title}
      </span>
      <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
    </div>
  );
}

export default BookCover;
