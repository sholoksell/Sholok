import { useState, useMemo, useEffect } from 'react';
import { useProductStore, Product } from '@/store/productStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  Package,
  AlertTriangle,
  Star,
  Eye,
  EyeOff,
  Archive,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import StockUpdateDialog from '@/components/products/StockUpdateDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const statusConfig: Record<Product['status'], { label: string; className: string }> = {
  published: { label: 'Published', className: 'bg-success/20 text-success' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  out_of_stock: { label: 'Out of Stock', className: 'bg-destructive/20 text-destructive' },
  archived: { label: 'Archived', className: 'bg-warning/20 text-warning' },
};

export default function Products() {
  const { products, deleteProduct, bulkDelete, bulkUpdateStatus, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Product['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = useMemo(() => {
    const minPrice = priceMin !== '' ? parseFloat(priceMin) : null;
    const maxPrice = priceMax !== '' ? parseFloat(priceMax) : null;
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

    return products.filter((p) => {
      // Search: name or SKU
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      // Status / Visibility
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      // Category
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;

      // Stock status
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && p.stock > p.lowStockThreshold) ||
        (stockFilter === 'low_stock' && p.stock > 0 && p.stock <= p.lowStockThreshold) ||
        (stockFilter === 'out_of_stock' && p.stock === 0);

      // Price range (use effective price: salePrice if set, else regularPrice)
      const effectivePrice = p.salePrice ?? p.regularPrice;
      const matchesPrice =
        (minPrice === null || effectivePrice >= minPrice) &&
        (maxPrice === null || effectivePrice <= maxPrice);

      // Date range
      const createdAt = p.createdAt ? new Date(p.createdAt) : null;
      const matchesDate =
        (!fromDate || (createdAt && createdAt >= fromDate)) &&
        (!toDate || (createdAt && createdAt <= toDate));

      return matchesSearch && matchesStatus && matchesCategory && matchesStock && matchesPrice && matchesDate;
    });
  }, [products, search, statusFilter, categoryFilter, stockFilter, priceMin, priceMax, dateFrom, dateTo]);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || 'Unknown';
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);
  const totalValue = products.reduce((sum, p) => sum + (p.salePrice || p.regularPrice) * p.stock, 0);

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredProducts.map((p) => p.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast.success('Product deleted');
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    bulkDelete(selectedIds);
    setSelectedIds([]);
    toast.success(`${selectedIds.length} products deleted`);
  };

  const handleBulkStatus = (status: Product['status']) => {
    bulkUpdateStatus(selectedIds, status);
    setSelectedIds([]);
    toast.success(`${selectedIds.length} products updated`);
  };

  const handleStockClick = (product: Product) => {
    setStockProduct(product);
    setStockDialogOpen(true);
  };

  const activeFilterCount = [
    statusFilter !== 'all',
    categoryFilter !== 'all',
    stockFilter !== 'all',
    priceMin !== '',
    priceMax !== '',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setStockFilter('all');
    setPriceMin('');
    setPriceMax('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button
          onClick={() => {
            setEditProduct(null);
            setFormOpen(true);
          }}
          className="gradient-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{products.length}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {products.filter((p) => p.status === 'published').length}
              </p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{lowStockProducts.length}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">৳{totalValue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">{lowStockProducts.length} products</span> are running low on stock:{' '}
              {lowStockProducts.slice(0, 3).map((p) => p.name).join(', ')}
              {lowStockProducts.length > 3 && ` and ${lowStockProducts.length - 3} more`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters & Actions */}
      <Card className="glass-card border-border">
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Search + toggle + bulk actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button
              variant="outline"
              className={`border-border gap-2 ${activeFilterCount > 0 ? 'border-primary text-primary' : ''}`}
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground gap-1">
                <X className="w-3.5 h-3.5" />
                Clear all
              </Button>
            )}
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkStatus('published')}
                  className="border-success text-success hover:bg-success/10">
                  Publish
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkStatus('archived')}
                  className="border-warning text-warning hover:bg-warning/10">
                  Archive
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}
                  className="border-destructive text-destructive hover:bg-destructive/10">
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>

          {/* Row 2: Advanced filter panel */}
          {showAdvanced && (
            <div className="border border-border rounded-lg p-4 space-y-4 bg-secondary/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Status / Visibility */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Status / Visibility</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Stock Status */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Stock Status</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
                    className="w-full h-9 rounded-md border border-border bg-secondary px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Stock</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Price Range (৳)</label>
                  <div className="flex gap-1.5 items-center">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="bg-secondary border-border h-9 text-sm"
                    />
                    <span className="text-muted-foreground text-xs shrink-0">–</span>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="bg-secondary border-border h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Date Added — From</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-secondary border-border h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Date Added — To</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-secondary border-border h-9 text-sm"
                  />
                </div>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Status: {statusConfig[statusFilter].label}
                      <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Category: {getCategoryName(categoryFilter)}
                      <button onClick={() => setCategoryFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {stockFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Stock: {stockFilter.replace('_', ' ')}
                      <button onClick={() => setStockFilter('all')}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {(priceMin !== '' || priceMax !== '') && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Price: {priceMin || '0'} – {priceMax || '∞'} ৳
                      <button onClick={() => { setPriceMin(''); setPriceMax(''); }}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {(dateFrom !== '' || dateTo !== '') && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Date: {dateFrom || '…'} → {dateTo || '…'}
                      <button onClick={() => { setDateFrom(''); setDateTo(''); }}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-border">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) => handleSelectOne(product.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{product.name}</p>
                          {product.featured && <Star className="w-4 h-4 text-warning fill-warning" />}
                          {product.isNew && <Badge className="bg-primary/20 text-primary border-0 text-xs">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">{product.sku}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{getCategoryName(product.categoryId)}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      {product.salePrice ? (
                        <>
                          <span className="font-semibold text-success">৳{product.salePrice}</span>
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ৳{product.regularPrice}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-foreground">৳{product.regularPrice}</span>
                      )}
                    </div>
                    {product.variants.length > 0 && (
                      <p className="text-xs text-muted-foreground">{product.variants.length} variants</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleStockClick(product)}
                      className={`font-medium ${product.stock <= product.lowStockThreshold
                        ? 'text-destructive'
                        : 'text-foreground'
                        } hover:underline`}
                    >
                      {product.stock}
                    </button>
                    {product.stock <= product.lowStockThreshold && (
                      <AlertTriangle className="w-4 h-4 text-destructive inline ml-1" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusConfig[product.status].className} border-0`}>
                      {statusConfig[product.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStockClick(product)}>
                          <Package className="w-4 h-4 mr-2" />
                          Update Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <p className="text-muted-foreground">No products found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
      />
      <StockUpdateDialog
        open={stockDialogOpen}
        onOpenChange={setStockDialogOpen}
        product={stockProduct}
      />
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
