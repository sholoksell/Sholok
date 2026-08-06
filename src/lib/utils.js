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
  // Handle null/undefined
  if (!imagePath || imagePath === '') return placeholder;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  
  // For development, use relative path (Vite proxy will handle it)
  // For production, you may need to adjust this to your production server URL
  if (imagePath.startsWith('/uploads')) {
    return imagePath; // Vite will proxy this to the backend
  }
  
  // If it's a relative path without /uploads, prepend it
  return `/uploads/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
}
