import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
  placeholder?: string;
  /** Optional product/asset name. Used to build SEO-friendly filenames on the server. */
  productName?: string;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  label = 'Product Images',
  placeholder = 'product images',
  productName,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (!productName || !productName.trim()) {
      toast.error('Please enter the product name first — it is used to generate SEO-friendly image filenames.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      // IMPORTANT: append `name` BEFORE the files so multer can read it inside the filename callback
      formData.append('name', productName.trim());
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await axios.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newImages = [...images, ...response.data.urls];
      onChange(newImages);
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (imageUrl: string) => {
    try {
      // Only attempt to delete from server if it's a local upload (not an external URL)
      if (!imageUrl.startsWith('http')) {
        const filename = imageUrl.split('/').pop();
        await axios.delete(`/upload/${filename}`);
      }
      onChange(images.filter((img) => img !== imageUrl));
      toast.success('Image removed');
    } catch (error) {
      console.error('Delete error:', error);
      // Still remove from list even if server delete fails
      onChange(images.filter((img) => img !== imageUrl));
      toast.success('Image removed');
    }
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
      onChange([...images, imageUrl]);
      setImageUrl('');
      setShowUrlDialog(false);
      toast.success('Image URL added successfully');
    } catch (e) {
      toast.error('Invalid URL format');
    }
  };

  const getFullImageUrl = (url: string) => {
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    // /uploads/ paths are proxied by Vite dev server → http://localhost:5000/uploads/...
    // Use relative paths so the proxy works correctly.
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowUrlDialog(true)}
            disabled={images.length >= maxImages}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Add URL
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length > 0 ? (
        <div className="grid grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={getFullImageUrl(image)}
                alt={`Image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Invalid+Image';
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(image)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Upload Files" to add {placeholder} or "Add URL" to use external images
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images • First image will be the primary image
      </p>

      {/* URL Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct link to an image (jpg, png, webp, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUrlDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUrl}>
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
