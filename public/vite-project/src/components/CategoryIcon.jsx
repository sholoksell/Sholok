import * as LucideIcons from 'lucide-react';
import { FolderTree } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

// Treat as image if it has a clear image-y signal:
//   absolute http(s)/data/blob URL, starts with / or ./, contains "/uploads/",
//   or ends with a known image extension.
const isImageSource = (value) => {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  if (/^(https?:|data:|blob:)/i.test(v)) return true;
  if (v.startsWith('/') || v.startsWith('./')) return true;
  if (v.includes('/uploads/')) return true;
  if (/\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)(\?.*)?$/i.test(v)) return true;
  return false;
};

/**
 * Renders a category icon. Accepts:
 *  - icon: Image URL / upload path  -> <img>
 *  - icon: Lucide icon name (e.g. "Home", "Sparkles") -> Lucide component
 *  - icon: Emoji / short text -> text
 *  - icon empty + image set -> shows category image as fallback
 *  - all empty -> fallback icon
 */
export default function CategoryIcon({
  icon,
  image,        // category.image — used when icon is empty
  name,
  className = 'w-6 h-6',
  fallbackEmoji = '📦',
  asText = false,
}) {
  // Prefer icon; fall back to image
  const src = (icon && icon.trim()) ? icon.trim() : (image && image.trim() ? image.trim() : '');

  if (src && isImageSource(src)) {
    return (
      <img
        src={getImageUrl(src)}
        alt={name || 'category'}
        className={`${className} object-contain`}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden';
        }}
      />
    );
  }

  if (src) {
    const LucideIcon = LucideIcons[src];
    if (LucideIcon) {
      return <LucideIcon className={className} aria-label={name} />;
    }
    if (src.length <= 4) {
      return <span className={className}>{src}</span>;
    }
  }

  if (asText) {
    return <span className={className}>{fallbackEmoji}</span>;
  }
  return <FolderTree className={className} aria-label={name} />;
}
