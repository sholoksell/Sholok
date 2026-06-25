import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(price).replace('BDT', '৳')
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function getDiscountPercentage(regularPrice, salePrice) {
  if (!salePrice || salePrice >= regularPrice) return 0
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100)
}

export function getImageUrl(imagePath, placeholder = '') {
  if (!imagePath || imagePath === '') return placeholder;
  // Full URL, data URI, or blob — return as-is
  if (/^(https?:|data:|blob:)/i.test(imagePath)) return imagePath;
  if (imagePath.startsWith('/uploads')) return imagePath;
  // Relative path without /uploads — prepend
  return `/uploads/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
}
