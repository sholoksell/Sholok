import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProductStore, Product, ProductVariant } from '@/store/productStore';
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
import { Plus, Trash2, X, CalendarIcon, Truck, Eye, EyeOff, Clock, Search, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ImageUpload from './ImageUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().max(100).optional(),
  regularPrice: z.number().min(0),
  salePrice: z.number().min(0).nullable(),
  sku: z.string().min(1, 'SKU is required').max(50),
  barcode: z.string().max(50).optional(),
  stock: z.number().min(0),
  lowStockThreshold: z.number().min(0),
  weight: z.number().min(0),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  status: z.enum(['draft', 'published', 'out_of_stock', 'archived']),
  featured: z.boolean(),
  isNew: z.boolean(),
  onSale: z.boolean(),
  visibility: z.enum(['visible', 'hidden']),
  scheduledPublishDate: z.string().optional().nullable(),
  availabilityDate: z.string().optional().nullable(),
  shippingClass: z.enum(['standard', 'express', 'free', 'heavy', 'fragile', 'custom']),
  shippingCharge: z.number().min(0),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
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

// ─────────────────────────────────────────────────────────────
// ProductPicker — searchable product selector
// ─────────────────────────────────────────────────────────────
const getThumb = (p: Product): string => {
  const raw = p.images?.[0] ?? '';
  if (!raw) return '';
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
};

function ProductPicker({
  value,
  onChange,
  allProducts,
  excludeId,
  label,
  description,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  allProducts: Product[];
  excludeId?: string;
  label: string;
  description?: string;
}) {
  const [search, setSearch] = useState('');
  const [dropOpen, setDropOpen] = useState(false);

  const available = allProducts.filter(
    (p) => p.id !== excludeId && !value.includes(p.id)
  );
  const filtered = search
    ? available.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      )
    : available.slice(0, 8);

  const selected = allProducts.filter((p) => value.includes(p.id));

  const add = (id: string) => {
    onChange([...value, id]);
    setSearch('');
    setDropOpen(false);
  };
  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setDropOpen(true); }}
          onFocus={() => setDropOpen(true)}
          onBlur={() => setTimeout(() => setDropOpen(false), 150)}
          placeholder="Search by name or SKU…"
          className="pl-10 bg-secondary border-border"
        />
        {dropOpen && filtered.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => add(p.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left"
              >
                {getThumb(p) ? (
                  <img
                    src={getThumb(p)}
                    alt={p.name}
                    className="w-9 h-9 rounded object-cover shrink-0 bg-muted"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded bg-muted flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">৳{p.regularPrice}</span>
              </button>
            ))}
          </div>
        )}
        {dropOpen && search.length > 0 && filtered.length === 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg px-3 py-4 text-center text-sm text-muted-foreground">
            No products found
          </div>
        )}
      </div>

      {/* Selected list */}
      {selected.length > 0 ? (
        <div className="space-y-2">
          {selected.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/30"
            >
              {getThumb(p) ? (
                <img
                  src={getThumb(p)}
                  alt={p.name}
                  className="w-10 h-10 rounded object-cover shrink-0 bg-muted"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
              ) : (
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  SKU: {p.sku} &nbsp;·&nbsp; ৳{p.regularPrice}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">No products selected yet.</p>
      )}
    </div>
  );
}

export default function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const { products, addProduct, updateProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const isEditing = !!product;
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]);
  const [upsellProducts, setUpsellProducts] = useState<string[]>([]);
  const [crossSellProducts, setCrossSellProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      categoryId: '',
      brand: '',
      regularPrice: 0,
      salePrice: null,
      sku: '',
      barcode: '',
      stock: 0,
      lowStockThreshold: 10,
      weight: 0,
      metaTitle: '',
      metaDescription: '',
      status: 'draft',
      featured: false,
      isNew: false,
      onSale: false,
      visibility: 'visible' as const,
      scheduledPublishDate: null,
      availabilityDate: null,
      shippingClass: 'standard' as const,
      shippingCharge: 0,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        categoryId: product.categoryId || '',
        brand: product.brand || '',
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        sku: product.sku,
        barcode: product.barcode || '',
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        weight: product.weight,
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        status: product.status,
        featured: product.featured,
        isNew: product.isNew,
        onSale: product.onSale,
        visibility: (product.visibility || 'visible') as 'visible' | 'hidden',
        scheduledPublishDate: product.scheduledPublishDate ? product.scheduledPublishDate.slice(0, 16) : null,
        availabilityDate: product.availabilityDate ? product.availabilityDate.split('T')[0] : null,
        shippingClass: product.shippingClass || 'standard',
        shippingCharge: product.shippingCharge || 0,
      });
      setVariants(product.variants);
      setTags(product.tags);
      setImages(product.images || []);
      setRelatedProducts(product.relatedProducts || []);
      setUpsellProducts(product.upsellProducts || []);
      setCrossSellProducts(product.crossSellProducts || []);
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        brand: '',
        regularPrice: 0,
        salePrice: null,
        sku: '',
        barcode: '',
        stock: 0,
        lowStockThreshold: 10,
        weight: 0,
        metaTitle: '',
        metaDescription: '',
        status: 'draft',
        featured: false,
        isNew: false,
        onSale: false,
        visibility: 'visible' as const,
        scheduledPublishDate: null,
        availabilityDate: null,
        shippingClass: 'standard' as const,
        shippingCharge: 0,
      });
      setVariants([]);
      setTags([]);
      setImages([]);
      setRelatedProducts([]);
      setUpsellProducts([]);
      setCrossSellProducts([]);
    }
  }, [product, form]);

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

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        name: '',
        sku: '',
        price: form.getValues('regularPrice'),
        salePrice: form.getValues('salePrice'),
        stock: 0,
        attributes: {},
      },
    ]);
  };

  const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const getCategoryPath = (category: Category): string => {
    const path: string[] = [category.name];
    let current = category;
    while (current.parentId) {
      const parent = categories.find((c) => c.id === current.parentId);
      if (parent) {
        path.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }
    return path.join(' > ');
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        categoryId: data.categoryId,
        brand: data.brand || '',
        regularPrice: data.regularPrice,
        salePrice: data.salePrice,
        sku: data.sku,
        barcode: data.barcode || '',
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        weight: data.weight,
        dimensions: { length: 0, width: 0, height: 0 },
        images: images,
        videoUrl: product?.videoUrl || '',
        tags,
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        status: data.status,
        featured: data.featured,
        isNew: data.isNew,
        onSale: data.onSale,
        variants,
        availabilityDate: data.availabilityDate || null,
        visibility: data.visibility,
        scheduledPublishDate: data.scheduledPublishDate || null,
        shippingClass: data.shippingClass,
        shippingCharge: data.shippingCharge,
        relatedProducts,
        upsellProducts,
        crossSellProducts,
      };

      if (isEditing && product) {
        await updateProduct(product.id, productData);
        toast.success('Product updated successfully');
      } else {
        await addProduct(productData);
        toast.success('Product created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const message = error.response?.data?.message || 'Failed to save product. Please check for duplicate Name, SKU or Slug.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-muted">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
                <TabsTrigger value="related">Related</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name *</FormLabel>
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
                          <Input {...field} className="bg-secondary border-border" />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value || 'none'}
                          onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories
                              .slice()
                              .sort((a, b) => getCategoryPath(a).localeCompare(getCategoryPath(b)))
                              .map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {getCategoryPath(cat)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-secondary border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-secondary border-border font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-secondary border-border font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={5}
                  productName={form.watch('name')}
                />

                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="bg-secondary border-border"
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="regularPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sale Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                            }
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity *</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Alert</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Shipping Class / Charges - বিশেষ শিপিং রেট থাকলে */}
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Truck className="w-4 h-4" />
                    Shipping Class / Charges
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shippingClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Class</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard Shipping</SelectItem>
                              <SelectItem value="express">Express Shipping</SelectItem>
                              <SelectItem value="free">Free Shipping</SelectItem>
                              <SelectItem value="heavy">Heavy Item</SelectItem>
                              <SelectItem value="fragile">Fragile Item</SelectItem>
                              <SelectItem value="custom">Custom Rate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Charge</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="bg-secondary border-border"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Set 0 for default shipping rate
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-foreground">Product Variants</h3>
                    <p className="text-sm text-muted-foreground">
                      Add variations like size, color, etc.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={addVariant}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </div>

                {variants.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    No variants added. Click "Add Variant" to create one.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className="p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-foreground">Variant {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(variant.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Variant Name</label>
                            <Input
                              value={variant.name}
                              onChange={(e) => updateVariant(variant.id, { name: e.target.value })}
                              placeholder="e.g., Large Red"
                              className="mt-1 bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">SKU</label>
                            <Input
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.id, { sku: e.target.value })}
                              className="mt-1 bg-secondary border-border font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Price</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(variant.id, { price: parseFloat(e.target.value) || 0 })
                              }
                              className="mt-1 bg-secondary border-border"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Stock</label>
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })
                              }
                              className="mt-1 bg-secondary border-border"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="publish" className="space-y-5 mt-4">
                {/* Status & Visibility */}
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
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storefront Visibility</FormLabel>
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => field.onChange('visible')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                              field.value === 'visible'
                                ? 'bg-success/10 border-success text-success'
                                : 'border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            Visible
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('hidden')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                              field.value === 'hidden'
                                ? 'bg-destructive/10 border-destructive text-destructive'
                                : 'border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <EyeOff className="w-4 h-4" />
                            Hidden
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledPublishDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Scheduled Publish Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Auto-publish on this date (when status is Draft)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availabilityDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Availability Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || null)}
                            className="bg-secondary border-border"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          When this product becomes available for sale
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Product Labels */}
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Product Labels</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Badges shown on the product card in the storefront.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                          <FormLabel className="text-sm">Featured</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                          <FormLabel className="text-sm">New Arrival</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="onSale"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                          <FormLabel className="text-sm">On Sale</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="related" className="space-y-6 mt-4">
                <ProductPicker
                  value={relatedProducts}
                  onChange={setRelatedProducts}
                  allProducts={products}
                  excludeId={product?.id}
                  label="Related Products"
                  description={'Products shown in the “You may also like” section on the product page.'}
                />
                <div className="border-t border-border" />
                <ProductPicker
                  value={upsellProducts}
                  onChange={setUpsellProducts}
                  allProducts={products}
                  excludeId={product?.id}
                  label="Upsell Products"
                  description="Higher-value alternatives suggested to the customer before checkout."
                />
                <div className="border-t border-border" />
                <ProductPicker
                  value={crossSellProducts}
                  onChange={setCrossSellProducts}
                  allProducts={products}
                  excludeId={product?.id}
                  label={'Cross-sell Products — “Customers also bought”'}
                  description="Complementary products shown in the cart or checkout page."
                />
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
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Product')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
