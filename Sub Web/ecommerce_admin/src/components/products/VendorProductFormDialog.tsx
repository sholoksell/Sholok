import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus, Trash2, X, CalendarIcon, Truck, Eye, EyeOff, Clock,
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import CategoryTreeSelector from './CategoryTreeSelector';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Category } from '@/store/categoryStore';

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  name:                  z.string().min(1, 'Name is required').max(200),
  nameBn:                z.string().max(200).optional(),
  slug:                  z.string().min(1, 'Slug is required').max(200),
  shortDescriptionBn:    z.string().max(500).optional(),
  description:           z.string().max(5000).optional(),
  category_id:           z.string().optional(),
  brand:                 z.string().max(100).optional(),
  product_type:          z.enum(['non_perishable', 'perishable']),
  regular_price:         z.number().min(0),
  sale_price:            z.number().min(0).nullable(),
  compare_price:         z.number().min(0).nullable(),
  sku:                   z.string().max(50).optional(),
  barcode:               z.string().max(50).optional(),
  stock:                 z.number().min(0),
  low_stock_threshold:   z.number().min(0),
  weight_kg:             z.number().min(0),
  shipping_class:        z.enum(['standard', 'express', 'free', 'heavy', 'fragile', 'custom']),
  shipping_charge:       z.number().min(0),
  status:                z.enum(['draft', 'active', 'archived']),
  visibility:            z.enum(['visible', 'hidden']),
  featured:              z.boolean(),
  is_new:                z.boolean(),
  on_sale:               z.boolean(),
  meta_title:            z.string().max(60).optional(),
  meta_description:      z.string().max(160).optional(),
  scheduled_publish_date: z.string().optional().nullable(),
  availability_date:     z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

// ─── Variant type ─────────────────────────────────────────────────────────────

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

// ─── Quill config ─────────────────────────────────────────────────────────────

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};
const quillFormats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'list', 'bullet', 'link', 'image'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any | null;
  onSaved: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VendorProductFormDialog({ open, onOpenChange, product, onSaved }: Props) {
  const { token } = useVendorAuth();
  const { t } = useLanguage();
  const isEditing = !!product;

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', nameBn: '', slug: '', shortDescriptionBn: '', description: '',
      category_id: '', brand: '', product_type: 'non_perishable',
      regular_price: 0, sale_price: null, compare_price: null,
      sku: '', barcode: '', stock: 0, low_stock_threshold: 10, weight_kg: 0,
      shipping_class: 'standard', shipping_charge: 0,
      status: 'draft', visibility: 'visible',
      featured: false, is_new: false, on_sale: false,
      meta_title: '', meta_description: '',
      scheduled_publish_date: null, availability_date: null,
    },
  });

  // Fetch categories and brands once
  useEffect(() => {
    fetch('/admin-api/categories/public/all')
      .then(r => r.json())
      .then((data: any[]) => {
        const cats: Category[] = data.map(c => ({
          id: String(c.id),
          name: c.name,
          nameBn: c.name_bn || '',
          slug: c.slug || '',
          description: '',
          parentId: c.parent_id ? String(c.parent_id) : null,
          image: c.image || null,
          banner: null,
          icon: c.icon || null,
          level: c.level || 1,
          keywords: '',
          metaTitle: '',
          metaDescription: '',
          status: (c.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
          featured: false,
          position: c.sort_order || 0,
          showOnMenu: false,
          showOnHomepage: false,
          showInSearch: true,
          productCount: 0,
          deletedAt: null,
        }));
        setCategories(cats);
      })
      .catch(() => {});

    fetch('/admin-api/brands')
      .then(r => r.json())
      .then((data: any) => { setBrands(Array.isArray(data) ? data : data.brands || []); })
      .catch(() => {});
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        nameBn: product.name_bn || '',
        slug: product.slug || '',
        shortDescriptionBn: product.short_description_bn || '',
        description: product.description || '',
        category_id: product.category_id ? String(product.category_id) : '',
        brand: product.brand_name || '',
        product_type: product.product_type || 'non_perishable',
        regular_price: Number(product.regular_price) || 0,
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        compare_price: product.compare_price ? Number(product.compare_price) : null,
        sku: product.sku || '',
        barcode: product.barcode || '',
        stock: Number(product.stock) || 0,
        low_stock_threshold: Number(product.low_stock_threshold) || 10,
        weight_kg: Number(product.weight_kg) || 0,
        shipping_class: product.shipping_class || 'standard',
        shipping_charge: Number(product.shipping_charge) || 0,
        status: product.status || 'draft',
        visibility: product.visibility || 'visible',
        featured: !!product.featured,
        is_new: !!product.is_new,
        on_sale: !!product.on_sale,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        scheduled_publish_date: product.scheduled_publish_date ? product.scheduled_publish_date.slice(0, 16) : null,
        availability_date: product.availability_date ? product.availability_date.split('T')[0] : null,
      });
      setImages(product.images || (product.thumbnail ? [product.thumbnail] : []));
      setTags(product.tags || []);
      setDescriptionBn(product.description_bn || '');
    } else {
      form.reset({
        name: '', nameBn: '', slug: '', shortDescriptionBn: '', description: '',
        category_id: '', brand: '', product_type: 'non_perishable',
        regular_price: 0, sale_price: null, compare_price: null,
        sku: '', barcode: '', stock: 0, low_stock_threshold: 10, weight_kg: 0,
        shipping_class: 'standard', shipping_charge: 0,
        status: 'draft', visibility: 'visible',
        featured: false, is_new: false, on_sale: false,
        meta_title: '', meta_description: '',
        scheduled_publish_date: null, availability_date: null,
      });
      setImages([]);
      setTags([]);
      setDescriptionBn('');
      setVariants([]);
    }
  }, [product, form]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    if (!isEditing) form.setValue('slug', generateSlug(name));
  };

  // Vendor-specific image upload function
  const vendorUploadFn = async (formData: FormData): Promise<string[]> => {
    const res = await fetch('/admin-api/vendor/upload/multiple', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.urls;
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addVariant = () => setVariants(v => [...v, { id: crypto.randomUUID(), name: '', sku: '', price: form.getValues('regular_price'), stock: 0 }]);
  const updateVariant = (id: string, upd: Partial<Variant>) => setVariants(v => v.map(x => x.id === id ? { ...x, ...upd } : x));
  const removeVariant = (id: string) => setVariants(v => v.filter(x => x.id !== id));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const body: any = {
        name: data.name,
        nameBn: data.nameBn || '',
        slug: data.slug,
        description: data.description || '',
        descriptionBn: descriptionBn || '',
        shortDescriptionBn: data.shortDescriptionBn || '',
        shortDescription: data.shortDescriptionBn || '',
        category_id: data.category_id || null,
        product_type: data.product_type,
        regular_price: data.regular_price,
        sale_price: data.sale_price,
        compare_price: data.compare_price,
        sku: data.sku || '',
        barcode: data.barcode || '',
        stock: data.stock,
        low_stock_threshold: data.low_stock_threshold,
        weight_kg: data.weight_kg,
        shipping_class: data.shipping_class,
        shipping_charge: data.shipping_charge,
        status: data.status,
        visibility: data.visibility,
        featured: data.featured,
        is_new: data.is_new,
        on_sale: data.on_sale,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        scheduled_publish_date: data.scheduled_publish_date || null,
        availability_date: data.availability_date || null,
        thumbnail: images[0] || '',
        images,
        tags,
      };

      // Resolve brand by name
      const brandMatch = brands.find(b => b.name === data.brand);
      if (brandMatch) body.brand_id = brandMatch.id;

      const url = isEditing
        ? `/admin-api/vendor/products/${product.id}`
        : '/admin-api/vendor/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save');
      }

      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
      onOpenChange(false);
      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-muted">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="publish">Publish</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* ─── General ──────────────────────────────────────────────── */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name (EN) *</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={e => handleNameChange(e.target.value)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nameBn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>পণ্যের নাম (বাংলা)</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-secondary border-border" placeholder="পণ্যের বাংলা নাম" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary border-border font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="shortDescriptionBn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>সংক্ষিপ্ত বিবরণ (বাংলা)</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="সংক্ষিপ্ত বিবরণ বাংলায় লিখুন..." className="bg-secondary border-border resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (EN)</FormLabel>
                    <FormControl>
                      <div className="bg-secondary/50 rounded-md border border-border">
                        <ReactQuill theme="snow" value={field.value || ''} onChange={field.onChange}
                          modules={quillModules} formats={quillFormats} className="text-foreground min-h-[150px]" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
                  <p className="text-sm font-medium mb-2">বিবরণ (বাংলা)</p>
                  <div className="bg-secondary/50 rounded-md border border-border">
                    <ReactQuill theme="snow" value={descriptionBn} onChange={setDescriptionBn}
                      modules={quillModules} formats={quillFormats}
                      placeholder="বাংলায় বিস্তারিত বিবরণ লিখুন..." className="text-foreground min-h-[150px]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="category_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <CategoryTreeSelector
                          categories={categories}
                          value={field.value || ''}
                          onChange={id => field.onChange(id)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        {brands.length > 0 ? (
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select brand" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No brand</SelectItem>
                              {brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input {...field} className="bg-secondary border-border" placeholder="Brand name" />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-secondary border-border font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="barcode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-secondary border-border font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="product_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="non_perishable">Non-Perishable</SelectItem>
                        <SelectItem value="perishable">Perishable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxImages={5}
                  productName={form.watch('name')}
                  uploadFn={vendorUploadFn}
                />

                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..." className="bg-secondary border-border" />
                    <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}<X className="w-3 h-3 cursor-pointer" onClick={() => setTags(t => t.filter(x => x !== tag))} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ─── Pricing & Stock ──────────────────────────────────────── */}
              <TabsContent value="pricing" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="regular_price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regular Price *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="sale_price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="compare_price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="low_stock_threshold" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Alert</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="weight_kg" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-secondary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="shipping_class" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Class</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
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
                    )} />
                    <FormField control={form.control} name="shipping_charge" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Charge</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} className="bg-secondary border-border" />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Set 0 for default shipping rate</p>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </TabsContent>

              {/* ─── Variants ─────────────────────────────────────────────── */}
              <TabsContent value="variants" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-foreground">Product Variants</h3>
                    <p className="text-sm text-muted-foreground">Add variations like size, color, etc.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addVariant}>
                    <Plus className="w-4 h-4 mr-2" />Add Variant
                  </Button>
                </div>
                {variants.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No variants added. Click "Add Variant" to create one.</div>
                ) : (
                  <div className="space-y-4">
                    {variants.map((v, i) => (
                      <div key={v.id} className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-foreground">Variant {i + 1}</h4>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(v.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-muted-foreground">Variant Name</label>
                            <Input value={v.name} onChange={e => updateVariant(v.id, { name: e.target.value })} placeholder="e.g., Large Red" className="mt-1 bg-secondary border-border" />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">SKU</label>
                            <Input value={v.sku} onChange={e => updateVariant(v.id, { sku: e.target.value })} className="mt-1 bg-secondary border-border font-mono" />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Price</label>
                            <Input type="number" step="0.01" value={v.price} onChange={e => updateVariant(v.id, { price: parseFloat(e.target.value) || 0 })} className="mt-1 bg-secondary border-border" />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Stock</label>
                            <Input type="number" value={v.stock} onChange={e => updateVariant(v.id, { stock: parseInt(e.target.value) || 0 })} className="mt-1 bg-secondary border-border" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ─── Publish ──────────────────────────────────────────────── */}
              <TabsContent value="publish" className="space-y-5 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="visibility" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storefront Visibility</FormLabel>
                      <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => field.onChange('visible')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${field.value === 'visible' ? 'bg-success/10 border-success text-success' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                          <Eye className="w-4 h-4" />Visible
                        </button>
                        <button type="button" onClick={() => field.onChange('hidden')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${field.value === 'hidden' ? 'bg-destructive/10 border-destructive text-destructive' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                          <EyeOff className="w-4 h-4" />Hidden
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="scheduled_publish_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Clock className="w-4 h-4" />Scheduled Publish Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" value={field.value || ''} onChange={e => field.onChange(e.target.value || null)} className="bg-secondary border-border" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Auto-publish on this date</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="availability_date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" />Availability Date</FormLabel>
                      <FormControl>
                        <Input type="date" value={field.value || ''} onChange={e => field.onChange(e.target.value || null)} className="bg-secondary border-border" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">When this product becomes available</p>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Product Labels</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Badges shown on the product card.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {(['featured', 'is_new', 'on_sale'] as const).map(fieldName => (
                      <FormField key={fieldName} control={form.control} name={fieldName} render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                          <FormLabel className="text-sm capitalize">{fieldName === 'is_new' ? 'New Arrival' : fieldName === 'on_sale' ? 'On Sale' : 'Featured'}</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ─── SEO ──────────────────────────────────────────────────── */}
              <TabsContent value="seo" className="space-y-4 mt-4">
                <FormField control={form.control} name="meta_title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title (max 60 chars)</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={60} className="bg-secondary border-border" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">{(field.value?.length || 0)}/60 characters</p>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meta_description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description (max 160 chars)</FormLabel>
                    <FormControl>
                      <Textarea {...field} maxLength={160} rows={3} className="bg-secondary border-border resize-none" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">{(field.value?.length || 0)}/160 characters</p>
                    <FormMessage />
                  </FormItem>
                )} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
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
