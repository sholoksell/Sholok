import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategoryStore, Category } from '@/store/categoryStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import * as LucideIcons from 'lucide-react';
import { Upload, Trash2, X } from 'lucide-react';

import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import ImageUpload from '../products/ImageUpload';
import axiosApi from '@/lib/axios';

// ─── rc-tree styles & animation ───────────────────────────────────────────────
const TREE_STYLE = `
  .category-rc-tree .rc-tree { font-size: 13px; line-height: 1.6; }
  .category-rc-tree .rc-tree-treenode { padding: 2px 0; display: flex; align-items: center; white-space: nowrap; }
  .category-rc-tree .rc-tree-node-content-wrapper { border-radius: 4px; padding: 1px 4px; cursor: pointer; flex: 1; }
  .category-rc-tree .rc-tree-node-content-wrapper:hover { background: rgba(255,255,255,0.08); }
  .category-rc-tree .rc-tree-node-selected { background: rgba(99,102,241,0.25) !important; }
  .category-rc-tree .rc-tree-switcher { display: inline-flex; align-items: center; justify-content: center; width: 16px; cursor: pointer; }
  .category-rc-tree .rc-tree-iconEle { margin-right: 3px; }
  .node-motion { transition: all .25s; overflow-y: hidden; }
`;

const treeMotion = {
  motionName: 'node-motion',
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: (node: HTMLElement) => ({ height: node.scrollHeight }),
  onLeaveStart: (node: HTMLElement) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

// Checks if a string is an image source (URL/path) rather than a Lucide icon name
const isIconImageSource = (value: string): boolean => {
  if (!value || !value.trim()) return false;
  const v = value.trim();
  if (/^(https?:|data:|blob:)/i.test(v)) return true;
  if (v.startsWith('/') || v.startsWith('./')) return true;
  if (v.includes('/uploads/')) return true;
  if (/\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)(\?.*)?$/i.test(v)) return true;
  return false;
};

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().optional(),
  parentId: z.string().nullable(),
  icon: z.string().optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(['active', 'inactive']),
  featured: z.boolean(),
  position: z.number().min(0),
  showOnMenu: z.boolean(),
  showOnHomepage: z.boolean(),
  showInSearch: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const formats = [
  'header', 'font',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

// ─────────────────────────────────────────────────────────────────────────────
// Single-image field: Upload / Replace / Delete with preview
// ─────────────────────────────────────────────────────────────────────────────
function SingleImageField({
  value,
  onChange,
  productName,
  placeholder,
  hint,
  imageHeight = 'h-36',
}: {
  value: string;
  onChange: (url: string) => void;
  productName: string;
  placeholder: string;
  hint?: string;
  imageHeight?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewUrl = !value
    ? ''
    : /^(https?:|data:|blob:)/i.test(value)
    ? value
    : value.startsWith('/')
    ? value
    : `/${value}`;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!productName.trim()) {
      toast.error('Please enter category name first');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name', productName.trim());
      fd.append('images', file);
      const res = await axiosApi.post('/upload/multiple', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.urls[0]);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    try {
      if (!/^https?:/.test(value)) {
        const filename = value.split('/').pop();
        await axiosApi.delete(`/upload/${filename}`);
      }
    } catch { /* ignore – file may already be gone */ }
    onChange('');
    toast.success('Image removed');
  };

  return (
    <div className="space-y-1.5">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className={`${imageHeight} rounded-lg overflow-hidden border border-border bg-muted/50`}>
        {previewUrl ? (
          <div className="relative group w-full h-full">
            <img
              src={previewUrl}
              alt={placeholder}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button type="button" size="sm" variant="secondary"
                onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {uploading ? 'Uploading…' : 'Replace'}
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-full flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/80 transition-colors"
          >
            {uploading ? (
              <span className="text-xs text-muted-foreground">Uploading…</span>
            ) : (
              <>
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload</span>
              </>
            )}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const { categories, addCategory, updateCategory } = useCategoryStore();
  const isEditing = !!category;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      icon: '',
      image: '',
      banner: '',
      metaTitle: '',
      metaDescription: '',
      status: 'active',
      featured: false,
      position: 1,
      showOnMenu: true,
      showOnHomepage: true,
      showInSearch: true,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId,
        icon: category.icon || '',
        image: category.image || '',
        banner: category.banner || '',
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        status: category.status,
        featured: category.featured,
        position: category.position,
        showOnMenu: category.showOnMenu,
        showOnHomepage: category.showOnHomepage,
        showInSearch: category.showInSearch,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        parentId: null,
        icon: '',
        image: '',
        banner: '',
        metaTitle: '',
        metaDescription: '',
        status: 'active',
        featured: false,
        position: categories.length + 1,
        showOnMenu: true,
        showOnHomepage: true,
        showInSearch: true,
      });
    }
  }, [category, form, categories.length]);


  // ── Build rc-tree data from flat categories ──────────────────────────────
  const treeData = useMemo(() => {
    const eligible = categories.filter((c) => c.id !== category?.id);
    const buildNodes = (parentId: string | null): any[] =>
      eligible
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
        .map((c) => {
          const children = buildNodes(c.id);
          return {
            key: c.id,
            title: c.name,
            ...(children.length > 0 ? { children } : { isLeaf: true }),
          };
        });
    const rootNodes = buildNodes(null);
    return [{ key: '__root__', title: 'Home', children: rootNodes }];
  }, [categories, category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!isEditing || !form.getValues('slug')) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && category) {
        await updateCategory(category.id, {
          ...data,
          image: data.image || null,
          banner: data.banner || null,
        });
        toast.success('Category updated');
      } else {
        await addCategory({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          parentId: data.parentId,
          icon: data.icon || null,
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          status: data.status,
          featured: data.featured,
          position: data.position,
          showOnMenu: data.showOnMenu,
          showOnHomepage: data.showOnHomepage,
          showInSearch: data.showInSearch,
          image: data.image || null,
          banner: data.banner || null,
        });
        toast.success('Category created');
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting category:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to save category';
      if (msg === 'Network Error') {
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else if (msg.includes('buffering timed out')) {
        toast.error('Database connection timed out. IP Address might be blocked in MongoDB Atlas.');
      } else if (msg.includes('duplicate key') || msg.includes('E11000')) {
        toast.error('Category with this Name or Slug already exists. Please change the "URL Slug".');
        form.setError('slug', { message: 'This slug is already taken' });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <div className="bg-secondary/50 rounded-md border border-border">
                          <ReactQuill
                            theme="snow"
                            value={field.value || ''}
                            onChange={field.onChange}
                            modules={modules}
                            formats={formats}
                            className="text-foreground min-h-[150px]"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Category — Tree Picker */}
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => {
                    const selectedName = field.value
                      ? (categories.find((c) => c.id === field.value)?.name ?? '')
                      : '';
                    const selectedKeys = field.value ? [field.value] : [];
                    const handleSelect = (keys: React.Key[]) => {
                      const key = keys[0] as string;
                      if (!key || key === '__root__') {
                        field.onChange(null); // Root category — no parent
                      } else {
                        field.onChange(key);
                      }
                    };
                    return (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <FormControl>
                          <div>
                            <Input
                              readOnly
                              value={selectedName}
                              placeholder="— None (will be a root category) —"
                              className="bg-secondary border-border cursor-default mb-1"
                            />
                            <div className="category-rc-tree border border-border rounded-md p-2 bg-secondary/40 max-h-60 overflow-y-auto">
                              <style dangerouslySetInnerHTML={{ __html: TREE_STYLE }} />
                              <Tree
                                expandAction="click"
                                treeData={treeData}
                                selectedKeys={selectedKeys}
                                defaultExpandedKeys={['__root__']}
                                onSelect={handleSelect}
                                motion={treeMotion}
                              />
                            </div>
                            {field.value && (
                              <button
                                type="button"
                                onClick={() => field.onChange(null)}
                                className="mt-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                              >
                                ✕ Clear (make root category)
                              </button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Icon — only for root (parent) categories */}
                {!form.watch('parentId') && (
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => {
                      const isImage = isIconImageSource(field.value || '');
                      const isLucide = !isImage && !!field.value && !!(LucideIcons as Record<string, unknown>)[field.value.trim()];
                      return (
                        <FormItem>
                          <FormLabel>
                            Category Icon{' '}
                            <span className="text-xs font-normal text-muted-foreground">(Only for parent categories)</span>
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              {/* Lucide icon name input */}
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={isImage ? '' : (field.value || '')}
                                  onChange={(e) => field.onChange(e.target.value)}
                                  placeholder=""
                                  className="bg-secondary border-border"
                                  disabled={isImage}
                                />
                                {field.value && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => field.onChange('')}
                                    className="shrink-0"
                                    title="Clear icon"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                                {isLucide && (() => {
                                  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[field.value!.trim()];
                                  return <Icon className="w-6 h-6 shrink-0 text-foreground" />;
                                })()}
                              </div>
                              <p className="text-xs text-muted-foreground text-center">— or upload an image icon —</p>
                              <SingleImageField
                                value={isImage ? (field.value || '') : ''}
                                onChange={(url) => field.onChange(url)}
                                productName={`${form.watch('name') || 'category'} icon`}
                                placeholder="icon"
                                imageHeight="h-24"
                                hint="Recommended: 64×64 px (PNG / SVG)"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                )}

                {/* Thumbnail & Banner */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Thumbnail</FormLabel>
                        <FormControl>
                          <SingleImageField
                            value={field.value || ''}
                            onChange={field.onChange}
                            productName={`${form.watch('name') || 'category'} image`}
                            placeholder="category thumbnail"
                            imageHeight="h-40"
                            hint="Recommended: 300×300 px"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="banner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Banner</FormLabel>
                        <FormControl>
                          <SingleImageField
                            value={field.value || ''}
                            onChange={field.onChange}
                            productName={`${form.watch('name') || 'category'} banner`}
                            placeholder="category banner"
                            imageHeight="h-40"
                            hint="Recommended: 1000×400 px"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Position</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title (max 60 chars)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="SEO title for search engines"
                          maxLength={60}
                          className="bg-secondary border-border"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/60 characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description (max 160 chars)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="SEO description for search engines"
                          maxLength={160}
                          rows={3}
                          className="bg-secondary border-border resize-none"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {field.value?.length || 0}/160 characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="visibility" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="showOnMenu"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <FormLabel className="text-base">Show on Menu</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Display this category in navigation menu
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showOnHomepage"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <FormLabel className="text-base">Show on Homepage</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Display this category on homepage
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showInSearch"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <FormLabel className="text-base">Show in Search</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Allow this category to appear in search results
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4 bg-accent/50">
                      <div>
                        <FormLabel className="text-base">⭐ Featured Category</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show in "Shop by Category" section on homepage
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Category')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
