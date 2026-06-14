import { useState, useMemo, useEffect } from 'react';
import { useCategoryStore, Category } from '@/store/categoryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Eye,
  EyeOff,
  Filter,
  ChevronRight,
  FolderTree,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';
import CategoryFormDialog from '@/components/categories/CategoryFormDialog';
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const isImageSource = (value: string): boolean => {
  const v = value.trim();
  if (!v) return false;
  if (/^(https?:|data:|blob:)/i.test(v)) return true;
  if (v.startsWith('/') || v.startsWith('./')) return true;
  if (v.includes('/uploads/')) return true;
  if (/\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)(\?.*)?$/i.test(v)) return true;
  return false;
};

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const resolveImageUrl = (value: string): string => {
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  // /uploads/ paths are served via the Vite /uploads proxy → http://localhost:5000/uploads/...
  if (value.startsWith('/uploads/')) return value;
  if (value.startsWith('uploads/')) return `/${value}`;
  if (value.startsWith('/')) return `${BACKEND_ORIGIN}${value}`;
  return value;
};

function CategoryIcon({ icon, image, name }: { icon?: string | null; image?: string | null; name?: string }) {
  // Use icon first, fall back to image
  const src = (icon && icon.trim()) ? icon.trim() : (image && image.trim() ? image.trim() : '');

  if (src && isImageSource(src)) {
    return (
      <img
        src={resolveImageUrl(src)}
        alt={name || 'category icon'}
        className="w-6 h-6 object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
        }}
      />
    );
  }
  if (src) {
    const LucideIcon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[src];
    if (LucideIcon) {
      return <LucideIcon className="w-5 h-5 text-foreground" />;
    }
    if (src.length <= 4) {
      return <span className="text-lg leading-none">{src}</span>;
    }
  }
  return <FolderTree className="w-5 h-5 text-muted-foreground" />;
}

export default function Categories() {
  const { categories, deleteCategory, bulkDelete, bulkUpdateStatus, fetchCategories } = useCategoryStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('position');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const activeFilterCount = useMemo(
    () =>
      [statusFilter !== 'all', parentFilter !== 'all', sortBy !== 'position'].filter(Boolean).length,
    [statusFilter, parentFilter, sortBy]
  );

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setParentFilter('all');
    setSortBy('position');
  };

  const filteredCategories = useMemo(() => {
    let result = categories.filter((cat) => {
      const parentName = cat.parentId
        ? (categories.find((p) => p.id === cat.parentId)?.name ?? '')
        : '';
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        parentName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || cat.status === statusFilter;
      const matchesParent =
        parentFilter === 'all'
          ? true
          : parentFilter === 'root'
          ? !cat.parentId
          : cat.parentId === parentFilter;
      return matchesSearch && matchesStatus && matchesParent;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':     return a.name.localeCompare(b.name);
        case 'name-desc':    return b.name.localeCompare(a.name);
        case 'status':       return a.status.localeCompare(b.status);
        case 'created-asc':  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'created-desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:             return (a.position ?? 0) - (b.position ?? 0);
      }
    });

    return result;
  }, [categories, search, statusFilter, parentFilter, sortBy]);

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

  const getChildCount = (categoryId: string): number => {
    return categories.filter((c) => c.parentId === categoryId).length;
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredCategories.map((c) => c.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setFormOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    const hasChildren = getChildCount(category.id) > 0;
    setCategoryToDelete(category);
    if (hasChildren) {
      setDeleteOpen(true);
    } else {
      setDeleteConfirmOpen(true);
    }
  };

  const confirmSimpleDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete.id);
        toast.success('Category deleted');
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          'Failed to delete category. You must move or delete products first.';
        toast.error(message);
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} categories deleted`);
      setSelectedIds([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to delete categories. You must move or delete products first.';
      toast.error(message);
    }
  };

  const handleBulkStatus = (status: 'active' | 'inactive') => {
    bulkUpdateStatus(selectedIds, status);
    setSelectedIds([]);
    toast.success(`${selectedIds.length} categories updated`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage your product categories</p>
        </div>
        <Button
          onClick={() => {
            setEditCategory(null);
            setFormOpen(true);
          }}
          className="gradient-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Total Categories</p>
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
                {categories.filter((c) => c.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {categories.filter((c) => c.status === 'inactive').length}
              </p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="glass-card border-border">
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Search + Filter toggle + Bulk actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, slug or parent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button
              variant="outline"
              className="border-border relative"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-3 h-3 ml-1 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatus('active')}
                  className="border-success text-success hover:bg-success/10"
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatus('inactive')}
                  className="border-warning text-warning hover:bg-warning/10"
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>

          {/* Advanced filter panel */}
          {showAdvanced && (
            <div className="border border-border rounded-lg p-4 bg-secondary/30 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Parent */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Parent Category</label>
                  <Select value={parentFilter} onValueChange={setParentFilter}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="root">Root Only</SelectItem>
                      {rootCategories.map((rc) => (
                        <SelectItem key={rc.id} value={rc.id}>
                          {rc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="position">Position</SelectItem>
                      <SelectItem value="name-asc">Name A → Z</SelectItem>
                      <SelectItem value="name-desc">Name Z → A</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="created-desc">Newest First</SelectItem>
                      <SelectItem value="created-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active filter chips + Clear all */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter('all')} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {parentFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                      Parent: {parentFilter === 'root' ? 'Root Only' : (rootCategories.find((r) => r.id === parentFilter)?.name ?? parentFilter)}
                      <button onClick={() => setParentFilter('all')} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {sortBy !== 'position' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                      Sort: {sortBy === 'name-asc' ? 'Name A→Z' : sortBy === 'name-desc' ? 'Name Z→A' : sortBy === 'status' ? 'Status' : sortBy === 'created-desc' ? 'Newest' : 'Oldest'}
                      <button onClick={() => setSortBy('position')} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="ml-auto text-xs text-muted-foreground hover:text-destructive underline underline-offset-2"
                  >
                    Clear all
                  </button>
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
                    checked={
                      filteredCategories.length > 0 &&
                      selectedIds.length === filteredCategories.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id} className="border-border">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(category.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        <CategoryIcon icon={category.icon} image={category.image} name={category.name} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.parentId && categories.find(p => p.id === category.parentId) ? (
                      <span className="text-muted-foreground text-sm">
                        {getCategoryPath(categories.find(p => p.id === category.parentId)!)}
                      </span>
                    ) : (
                      <Badge variant="secondary">Root</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={category.status === 'active' ? 'default' : 'secondary'}
                      className={
                        category.status === 'active'
                          ? 'bg-success/20 text-success border-0'
                          : 'bg-muted text-muted-foreground border-0'
                      }
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {category.showOnMenu && (
                        <Badge variant="outline" className="text-xs">Menu</Badge>
                      )}
                      {category.showOnHomepage && (
                        <Badge variant="outline" className="text-xs">Home</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">{category.position}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(category)}
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
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-muted-foreground">No categories found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editCategory}
      />
      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={categoryToDelete}
      />
      <DeleteConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmSimpleDelete}
      />
    </div>
  );
}
