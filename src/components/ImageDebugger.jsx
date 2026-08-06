import { useEffect } from 'react';

/**
 * Debug component to log product image data
 * Add this to HomePage or any page to see product image URLs in console
 */
export function ImageDebugger({ products }) {
  useEffect(() => {
    if (products && products.length > 0) {
      console.group('🖼️ Image Debug Info');
      console.log('Total products:', products.length);
      
      products.slice(0, 5).forEach((product, index) => {
        console.group(`Product ${index + 1}: ${product.name}`);
        console.log('Raw image:', product.image);
        console.log('Images array:', product.images);
        console.log('Thumbnail:', product.thumbnail);
        console.log('Full product:', product);
        console.groupEnd();
      });
      
      console.groupEnd();
    }
  }, [products]);

  return null; // This component doesn't render anything
}

export default ImageDebugger;
