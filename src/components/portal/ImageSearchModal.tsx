interface Props {
  file: File | null;
  onClose: () => void;
}

export function ImageSearchModal({ file, onClose }: Props) {
  if (!file) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <p className="text-sm text-muted-foreground text-center">Image search coming soon</p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
