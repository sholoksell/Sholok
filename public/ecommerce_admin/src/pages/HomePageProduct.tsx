import { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  RefreshCw,
  Sparkles,
  Image as ImageIcon,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  homeSectionApi,
  HomeSection,
  HomeSectionItem,
} from '@/services/homeSectionService';

const API_ORIGIN = (() => {
  const url = (import.meta as any).env?.VITE_API_URL as string | undefined;
  if (url) return url.replace(/\/admin-api\/?$/, '').replace(/\/$/, '');
  return 'http://localhost:5000';
})();

const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};

// Rich text editor toolbar — mirrors common WYSIWYG layout.
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ font: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};
const quillFormats = [
  'header', 'font',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
];

const emptySection: Partial<HomeSection> = {
  key: '',
  title: '',
  titleBn: '',
  subtitle: '',
  description: '',
  icon: '',
  layout: 'carousel',
  accentColor: '',
  backgroundColor: '',
  order: 0,
  isActive: true,
};

const emptyItem: Partial<HomeSectionItem> = {
  name: '',
  nameBn: '',
  slug: '',
  image: '',
  price: 0,
  comparePrice: 0,
  unit: '',
  badge: '',
  minQty: 1,
  description: '',
  link: '',
  order: 0,
  isActive: true,
};

// Reserved sections shown on the storefront Product Detail page.
// Admin can manage products in these sections like any other home section.
const PRODUCT_DETAIL_SECTIONS: {
  key: string;
  title: string;
  titleBn?: string;
  icon?: string;
  description?: string;
}[] = [
  {
    key: 'similar-products',
    title: 'Similar Products',
    titleBn: 'অনুরূপ পণ্য',
    icon: '🛒',
    description: 'Shown in the "SIMILAR PRODUCTS" row on every product detail page.',
  },
  {
    key: 'related-products',
    title: 'Related Products',
    titleBn: 'সম্পর্কিত পণ্য',
    icon: '🛍️',
    description: 'Shown in the "RELATED PRODUCTS" row on every product detail page.',
  },
];

const isReservedKey = (key?: string) =>
  !!key && PRODUCT_DETAIL_SECTIONS.some((s) => s.key === key);

export default function HomePageProduct() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Section dialog
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] =
    useState<Partial<HomeSection>>(emptySection);

  // Product dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productSectionId, setProductSectionId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] =
    useState<Partial<HomeSectionItem>>(emptyItem);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop reordering
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const persistOrder = async (next: HomeSection[]) => {
    try {
      await homeSectionApi.reorder(
        next.map((s, i) => ({ _id: s._id, order: i + 1 }))
      );
      toast.success('Order saved');
    } catch {
      toast.error('Failed to save new order');
      loadSections();
    }
  };

  const moveSection = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = next.map((s, i) => ({ ...s, order: i + 1 }));
    setSections(renumbered);
    persistOrder(renumbered);
  };

  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      moveSection(dragIndex, index);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await homeSectionApi.list();
      setSections(
        [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to load home sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleSeedDefaults = async () => {
    try {
      await homeSectionApi.seedDefaults();
      toast.success('Default sections seeded');
      loadSections();
    } catch {
      toast.error('Failed to seed defaults');
    }
  };

  // Ensure the two reserved Product-Detail-Page sections exist.
  // Creates any that are missing; safe to run repeatedly.
  const ensureProductDetailSections = async () => {
    try {
      const existingKeys = new Set(sections.map((s) => s.key));
      const missing = PRODUCT_DETAIL_SECTIONS.filter((d) => !existingKeys.has(d.key));
      if (missing.length === 0) {
        toast.info('Product detail sections already exist');
        return;
      }
      const baseOrder = sections.length;
      await Promise.all(
        missing.map((d, i) =>
          homeSectionApi.create({
            key: d.key,
            title: d.title,
            titleBn: d.titleBn,
            icon: d.icon,
            description: d.description,
            layout: 'grid',
            order: baseOrder + i + 1,
            isActive: true,
          })
        )
      );
      toast.success(
        `Created: ${missing.map((m) => m.title).join(', ')}`
      );
      loadSections();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create reserved sections');
    }
  };

  // ----- Section CRUD -----
  const openCreateSection = () => {
    setEditingSectionId(null);
    setSectionForm(emptySection);
    setSectionDialogOpen(true);
  };

  const openEditSection = (s: HomeSection) => {
    setEditingSectionId(s._id);
    setSectionForm({
      key: s.key,
      title: s.title,
      titleBn: s.titleBn,
      subtitle: s.subtitle,
      description: s.description || '',
      icon: s.icon,
      layout: s.layout,
      accentColor: s.accentColor,
      backgroundColor: s.backgroundColor,
      order: s.order,
      isActive: s.isActive,
    });
    setSectionDialogOpen(true);
  };

  const saveSection = async () => {
    if (!sectionForm.title || !sectionForm.key) {
      toast.error('Title and key are required');
      return;
    }
    try {
      if (editingSectionId) {
        await homeSectionApi.update(editingSectionId, sectionForm);
        toast.success('Section updated');
      } else {
        await homeSectionApi.create(sectionForm);
        toast.success('Section created');
      }
      setSectionDialogOpen(false);
      loadSections();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save section');
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Delete this section and all its products?')) return;
    try {
      await homeSectionApi.remove(id);
      toast.success('Section deleted');
      loadSections();
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const toggleSectionActive = async (s: HomeSection) => {
    try {
      await homeSectionApi.update(s._id, { isActive: !s.isActive });
      loadSections();
    } catch {
      toast.error('Failed to update');
    }
  };

  // ----- Product CRUD -----
  const openCreateProduct = (sectionId: string) => {
    setProductSectionId(sectionId);
    setEditingProductId(null);
    setProductForm(emptyItem);
    setProductDialogOpen(true);
  };

  const openEditProduct = (sectionId: string, item: HomeSectionItem) => {
    setProductSectionId(sectionId);
    setEditingProductId(item._id || null);
    setProductForm({
      name: item.name,
      nameBn: item.nameBn,
      slug: item.slug,
      image: item.image,
      price: item.price,
      comparePrice: item.comparePrice,
      unit: item.unit,
      badge: item.badge,
      minQty: item.minQty,
      description: item.description || '',
      link: item.link,
      order: item.order,
      isActive: item.isActive,
    });
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!productSectionId) return;
    if (!productForm.name) {
      toast.error('Product name is required');
      return;
    }
    try {
      if (editingProductId) {
        await homeSectionApi.updateProduct(
          productSectionId,
          editingProductId,
          productForm
        );
        toast.success('Product updated');
      } else {
        await homeSectionApi.addProduct(productSectionId, productForm);
        toast.success('Product added');
      }
      setProductDialogOpen(false);
      loadSections();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (sectionId: string, productId: string) => {
    if (!confirm('Remove this product from the section?')) return;
    try {
      await homeSectionApi.removeProduct(sectionId, productId);
      toast.success('Product removed');
      loadSections();
    } catch {
      toast.error('Failed to remove product');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const url = await homeSectionApi.uploadImage(file);
      if (url) setProductForm((p) => ({ ...p, image: url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Home Page Product</h1>
          <p className="text-muted-foreground">
            Manage products shown in each home page section
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={loadSections}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="outline" onClick={handleSeedDefaults}>
            <Sparkles className="w-4 h-4 mr-1" /> Seed Default Sections
          </Button>
          <Button variant="outline" onClick={ensureProductDetailSections}>
            <Sparkles className="w-4 h-4 mr-1" /> Add Product Detail Sections
          </Button>
          <Button onClick={openCreateSection}>
            <Plus className="w-4 h-4 mr-1" /> New Section
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No sections yet. Click "Seed Default Sections" to create the standard
            home page sections.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((s, idx) => {
            const isOpen = expanded[s._id];
            const isDragging = dragIndex === idx;
            const isDragOver = dragOverIndex === idx && dragIndex !== idx;
            return (
              <Card
                key={s._id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`${isDragging ? 'opacity-40' : ''} ${
                  isDragOver ? 'border-primary ring-2 ring-primary' : ''
                } transition-all`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-2">
                      <div
                        className="cursor-grab active:cursor-grabbing pt-2 text-muted-foreground hover:text-foreground"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, idx - 1)}
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={idx === sections.length - 1}
                          onClick={() => moveSection(idx, idx + 1)}
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setExpanded((e) => ({ ...e, [s._id]: !e[s._id] }))
                        }
                      >
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <div>
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          {s.icon && <span>{s.icon}</span>}
                          {s.title}
                          {!s.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          <Badge variant="outline">{s.layout}</Badge>
                          {isReservedKey(s.key) && (
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                              Product Detail Page
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          key: <code className="text-xs">{s.key}</code> ·{' '}
                          {s.products?.length || 0} products · order {s.order}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.isActive}
                        onCheckedChange={() => toggleSectionActive(s)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditSection(s)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSection(s._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="space-y-3">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => openCreateProduct(s._id)}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Product
                      </Button>
                    </div>
                    {(!s.products || s.products.length === 0) ? (
                      <p className="text-center text-sm text-muted-foreground py-6">
                        No products in this section yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {s.products.map((p) => (
                          <div
                            key={p._id}
                            className="border rounded-lg p-3 flex gap-3"
                          >
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {p.image ? (
                                <img
                                  src={resolveImageUrl(p.image)}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                ৳{p.price ?? 0}
                                {p.comparePrice
                                  ? ` · was ৳${p.comparePrice}`
                                  : ''}
                              </p>
                              {p.badge && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {p.badge}
                                </Badge>
                              )}
                              <div className="flex gap-1 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditProduct(s._id, p)}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    deleteProduct(s._id, p._id || '')
                                  }
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSectionId ? 'Edit Section' : 'New Section'}
            </DialogTitle>
            <DialogDescription>
              Configure how this section appears on the home page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Key (unique)</Label>
              <Input
                value={sectionForm.key || ''}
                disabled={!!editingSectionId}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, key: e.target.value })
                }
                placeholder="e.g. trending-products"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={sectionForm.title || ''}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Title (Bangla)</Label>
              <Input
                value={sectionForm.titleBn || ''}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, titleBn: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input
                value={sectionForm.icon || ''}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, icon: e.target.value })
                }
                placeholder="🔥"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={sectionForm.subtitle || ''}
                onChange={(e) =>
                  setSectionForm({ ...sectionForm, subtitle: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <div className="bg-background rounded-md border">
                <ReactQuill
                  theme="snow"
                  value={sectionForm.description || ''}
                  onChange={(html) =>
                    setSectionForm({ ...sectionForm, description: html })
                  }
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Layout</Label>
                <Select
                  value={sectionForm.layout || 'carousel'}
                  onValueChange={(v) =>
                    setSectionForm({
                      ...sectionForm,
                      layout: v as 'grid' | 'carousel',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={sectionForm.order ?? 0}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      order: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Accent color</Label>
                <Input
                  value={sectionForm.accentColor || ''}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      accentColor: e.target.value,
                    })
                  }
                  placeholder="#ff0000"
                />
              </div>
              <div>
                <Label>Background color</Label>
                <Input
                  value={sectionForm.backgroundColor || ''}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      backgroundColor: e.target.value,
                    })
                  }
                  placeholder="#fff"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={sectionForm.isActive ?? true}
                onCheckedChange={(v) =>
                  setSectionForm({ ...sectionForm, isActive: v })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveSection}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProductId ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              Product entry shown inside the section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded bg-muted flex items-center justify-center overflow-hidden">
                {productForm.image ? (
                  <img
                    src={resolveImageUrl(productForm.image)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = '';
                  }}
                />
                <Input
                  placeholder="or paste image URL"
                  value={productForm.image || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, image: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Name</Label>
              <Input
                value={productForm.name || ''}
                onChange={(e) =>
                  setProductForm({ ...productForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={productForm.slug || ''}
                onChange={(e) =>
                  setProductForm({ ...productForm, slug: e.target.value })
                }
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (৳)</Label>
                <Input
                  type="number"
                  value={productForm.price ?? 0}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Compare price (৳)</Label>
                <Input
                  type="number"
                  value={productForm.comparePrice ?? 0}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      comparePrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit</Label>
                <Input
                  value={productForm.unit || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, unit: e.target.value })
                  }
                  placeholder="1 kg, 500ml..."
                />
              </div>
              <div>
                <Label>Badge</Label>
                <Input
                  value={productForm.badge || ''}
                  onChange={(e) =>
                    setProductForm({ ...productForm, badge: e.target.value })
                  }
                  placeholder="HOT, SALE..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min qty</Label>
                <Input
                  type="number"
                  value={productForm.minQty ?? 1}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      minQty: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={productForm.order ?? 0}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      order: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input
                value={productForm.link || ''}
                onChange={(e) =>
                  setProductForm({ ...productForm, link: e.target.value })
                }
                placeholder="/product/some-slug"
              />
            </div>
            <div>
              <Label>Description</Label>
              <div className="bg-background rounded-md border">
                <ReactQuill
                  theme="snow"
                  value={productForm.description || ''}
                  onChange={(html) =>
                    setProductForm({ ...productForm, description: html })
                  }
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={productForm.isActive ?? true}
                onCheckedChange={(v) =>
                  setProductForm({ ...productForm, isActive: v })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveProduct}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
