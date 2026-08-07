import { useState, useMemo, useEffect, useCallback } from 'react';
import { useCategoryStore, Category } from '@/store/categoryStore';
import { categoryApi } from '@/services/categoryService';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus, Search, MoreVertical, Edit, Trash2, RotateCcw,
  ChevronRight, Folder, FolderOpen, FileText, FolderTree,
  Eye, EyeOff, Star, Layers, RefreshCw, ChevronDown, ChevronUp, Languages,
} from 'lucide-react';
import CategoryFormDialog from '@/components/categories/CategoryFormDialog';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CategoryNode extends Category {
  children: CategoryNode[];
}

// ─── TREE BUILDER ────────────────────────────────────────────────────────────

function buildCategoryTree(flat: Category[]): CategoryNode[] {
  const map: Record<string, CategoryNode> = {};
  flat.forEach(c => { map[c.id] = { ...c, children: [] }; });
  const roots: CategoryNode[] = [];
  flat.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else if (!c.parentId) {
      roots.push(map[c.id]);
    }
  });
  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name));
    nodes.forEach(n => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

function filterTree(nodes: CategoryNode[], q: string): CategoryNode[] {
  if (!q) return nodes;
  const lower = q.toLowerCase();
  return nodes.reduce<CategoryNode[]>((acc, node) => {
    const kids = filterTree(node.children, lower);
    const match =
      node.name.toLowerCase().includes(lower) ||
      (node.nameBn && node.nameBn.toLowerCase().includes(lower)) ||
      node.slug.toLowerCase().includes(lower);
    if (match || kids.length > 0) acc.push({ ...node, children: kids });
    return acc;
  }, []);
}

function countDescendants(nodes: CategoryNode[]): number {
  return nodes.reduce((s, n) => s + 1 + countDescendants(n.children), 0);
}

// ─── TREE NODE COMPONENT ─────────────────────────────────────────────────────

interface TreeNodeProps {
  node: CategoryNode;
  depth: number;
  search: string;
  selectedIds: string[];
  language: 'en' | 'bn';
  onToggleSelect: (id: string) => void;
  onEdit: (node: CategoryNode) => void;
  onAddChild: (node: CategoryNode) => void;
  onDelete: (node: CategoryNode) => void;
}

function TreeNode({ node, depth, search, selectedIds, language, onToggleSelect, onEdit, onAddChild, onDelete }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const [expanded, setExpanded] = useState(depth < 1 || !!search);
  const primaryName = language === 'bn' && node.nameBn ? node.nameBn : node.name;
  const secondaryName = language === 'bn' ? node.name : node.nameBn;

  useEffect(() => {
    if (search) setExpanded(true);
  }, [search]);

  const indent = depth * 22;

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 py-1.5 pr-2 rounded-md transition-colors hover:bg-accent/40
          ${selectedIds.includes(node.id) ? 'bg-primary/8' : ''}`}
        style={{ paddingLeft: `${8 + indent}px` }}
      >
        {/* Expand/Collapse toggle */}
        <button
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-muted"
          onClick={() => setExpanded(v => !v)}
        >
          {hasChildren ? (
            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
          ) : (
            <span className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={selectedIds.includes(node.id)}
          onCheckedChange={() => onToggleSelect(node.id)}
          className="shrink-0 h-3.5 w-3.5"
        />

        {/* Folder/File icon */}
        <span className="shrink-0">
          {hasChildren ? (
            expanded
              ? <FolderOpen className="w-4 h-4 text-yellow-500" />
              : <Folder className="w-4 h-4 text-yellow-500" />
          ) : (
            <FileText className="w-4 h-4 text-blue-400" />
          )}
        </span>

        {/* Name */}
        <div
          className="flex-1 min-w-0 flex items-center gap-1.5 cursor-pointer"
          onClick={() => onEdit(node)}
        >
          <span className="font-medium text-sm text-foreground truncate">{primaryName}</span>
          {secondaryName && (
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              ({secondaryName})
            </span>
          )}
          {hasChildren && (
            <span className="text-xs text-muted-foreground shrink-0">({node.children.length})</span>
          )}
          {node.featured && (
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
          )}
        </div>

        {/* Status badge */}
        <Badge
          variant={node.status === 'active' ? 'default' : 'secondary'}
          className={`shrink-0 text-[10px] px-1.5 py-0 h-4
            ${node.status === 'active'
              ? 'bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/15'
              : 'bg-muted text-muted-foreground border-0'}`}
        >
          {node.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>

        {/* Actions – visible on row hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost" size="icon" className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
            title="Edit"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onAddChild(node); }}
            title="Add subcategory"
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onDelete(node); }}
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              search={search}
              selectedIds={selectedIds}
              language={language}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TRASH ITEM ──────────────────────────────────────────────────────────────

function TrashItem({
  category, onRestore, onPermanentDelete,
}: { category: Category; onRestore: (c: Category) => void; onPermanentDelete: (c: Category) => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md border border-border hover:bg-muted/30">
      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{category.name}</p>
        {category.nameBn && <p className="text-xs text-muted-foreground">{category.nameBn}</p>}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        Deleted {new Date(category.deletedAt!).toLocaleDateString()}
      </span>
      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onRestore(category)}>
        <RotateCcw className="w-3 h-3 mr-1" /> Restore
      </Button>
      <Button
        size="sm" variant="ghost"
        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onPermanentDelete(category)}
      >
        <Trash2 className="w-3 h-3 mr-1" /> Delete
      </Button>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function Categories() {
  const { categories, fetchCategories, deleteCategory, restoreCategory, bulkDelete, bulkUpdateStatus } = useCategoryStore();
  const { language, toggleLanguage } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen]           = useState(false);
  const [editCategory, setEditCategory]   = useState<Category | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryNode | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Category | null>(null);
  const [trashedCategories, setTrashedCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab]         = useState('tree');
  const [allExpanded, setAllExpanded]     = useState(false);
  const [expandKey, setExpandKey]         = useState(0);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const loadTrash = useCallback(async () => {
    try {
      const data = await categoryApi.getDeleted();
      // Map API shape (_id) → store shape (id)
      setTrashedCategories(data.map((c: any) => ({ ...c, id: c._id || c.id })) as any);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (activeTab === 'trash') loadTrash();
  }, [activeTab, loadTrash]);

  // Active (non-deleted) categories only
  const activeCategories = useMemo(() =>
    categories.filter(c => !c.deletedAt), [categories]
  );

  const tree = useMemo(() => buildCategoryTree(activeCategories), [activeCategories]);
  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

  const stats = useMemo(() => ({
    total:    activeCategories.length,
    active:   activeCategories.filter(c => c.status === 'active').length,
    inactive: activeCategories.filter(c => c.status === 'inactive').length,
    trash:    trashedCategories.length,
  }), [activeCategories, trashedCategories]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEdit = (node: CategoryNode) => {
    setEditCategory(node as unknown as Category);
    setDefaultParentId(null);
    setFormOpen(true);
  };

  const handleAddChild = (node: CategoryNode) => {
    setEditCategory(null);
    setDefaultParentId(node.id);
    setFormOpen(true);
  };

  const handleAddRoot = () => {
    setEditCategory(null);
    setDefaultParentId(null);
    setFormOpen(true);
  };

  const handleDeleteClick = (node: CategoryNode) => setDeletingCategory(node);

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      toast.success('Category moved to trash');
      setDeletingCategory(null);
      setSelectedIds([]);
      loadTrash();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleRestore = async (cat: Category) => {
    try {
      await restoreCategory(cat.id);
      toast.success(`"${cat.name}" restored`);
      loadTrash();
      setTrashedCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch {
      toast.error('Failed to restore');
    }
  };

  const handlePermanentDelete = async (cat: Category) => {
    try {
      await categoryApi.bulkDelete([cat.id], true);
      toast.success(`"${cat.name}" permanently deleted`);
      setTrashedCategories(prev => prev.filter(c => c.id !== cat.id));
      setPermanentDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to permanently delete');
    }
  };

  const handleToggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} categories moved to trash`);
      setSelectedIds([]);
      loadTrash();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    if (!selectedIds.length) return;
    try {
      await bulkUpdateStatus(selectedIds, status);
      toast.success(`${selectedIds.length} categories ${status === 'active' ? 'activated' : 'deactivated'}`);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const toggleExpandAll = () => {
    setAllExpanded(v => !v);
    setExpandKey(k => k + 1);
  };

  // Flat count for "delete with N subcategories" warning
  const deletingSubCount = deletingCategory
    ? countDescendants(deletingCategory.children)
    : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm">Manage product categories — tree view</p>
        </div>
        <Button onClick={handleAddRoot} className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: stats.total,    icon: FolderTree, color: 'text-primary' },
          { label: 'Active',   value: stats.active,   icon: Eye,        color: 'text-green-500' },
          { label: 'Inactive', value: stats.inactive, icon: EyeOff,     color: 'text-yellow-500' },
          { label: 'Trash',    value: stats.trash,    icon: Trash2,     color: 'text-red-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="glass-card border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`w-5 h-5 shrink-0 ${color}`} />
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories (English or বাংলা)…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <Button variant="outline" size="sm" className="border-border" onClick={toggleExpandAll}>
          {allExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </Button>
        <Button variant="outline" size="sm" className="border-border gap-1.5" onClick={toggleLanguage} title="Toggle category language">
          <Languages className="w-4 h-4" />
          {language === 'bn' ? 'EN' : 'বাং'}
        </Button>
        <Button variant="outline" size="sm" className="border-border" onClick={() => fetchCategories()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Bulk action bar ── */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-muted/60 rounded-lg border border-border">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="flex gap-1.5 ml-2">
            <Button size="sm" variant="outline" className="h-7 text-xs border-green-500/30 text-green-600 hover:bg-green-500/10"
              onClick={() => handleBulkStatus('active')}>
              <Eye className="w-3 h-3 mr-1" /> Activate
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
              onClick={() => handleBulkStatus('inactive')}>
              <EyeOff className="w-3 h-3 mr-1" /> Deactivate
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={handleBulkDelete}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete ({selectedIds.length})
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Tabs: Tree / Trash ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="tree" className="gap-2">
            <FolderTree className="w-4 h-4" /> Tree View
          </TabsTrigger>
          <TabsTrigger value="trash" className="gap-2" onClick={loadTrash}>
            <Trash2 className="w-4 h-4" /> Trash
            {stats.trash > 0 && (
              <Badge variant="destructive" className="h-4 px-1 text-[10px]">{stats.trash}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tree View Tab ── */}
        <TabsContent value="tree" className="mt-3">
          <Card className="glass-card border-border">
            <CardContent className="p-3">
              {filteredTree.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                  <Layers className="w-10 h-10 opacity-30" />
                  <p className="text-sm">
                    {search ? `No categories match "${search}"` : 'No categories yet. Add your first category!'}
                  </p>
                  {!search && (
                    <Button size="sm" onClick={handleAddRoot}>
                      <Plus className="w-4 h-4 mr-1" /> Add Category
                    </Button>
                  )}
                </div>
              ) : (
                <div key={expandKey} className="space-y-0.5">
                  {filteredTree.map(node => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      depth={0}
                      search={search}
                      selectedIds={selectedIds}
                      language={language}
                      onToggleSelect={handleToggleSelect}
                      onEdit={handleEdit}
                      onAddChild={handleAddChild}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Trash Tab ── */}
        <TabsContent value="trash" className="mt-3">
          <Card className="glass-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                Trash ({trashedCategories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trashedCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Trash is empty</p>
              ) : (
                trashedCategories.map(cat => (
                  <TrashItem
                    key={cat.id}
                    category={cat as any}
                    onRestore={handleRestore}
                    onPermanentDelete={(c) => setPermanentDeleteTarget(c)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Add/Edit Dialog ── */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) { setEditCategory(null); setDefaultParentId(null); }
        }}
        category={editCategory}
        defaultParentId={defaultParentId}
      />

      {/* ── Soft-delete Confirmation ── */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deletingCategory?.name}"</strong> will be moved to trash
              {deletingSubCount > 0 && (
                <> along with its <strong>{deletingSubCount} subcategor{deletingSubCount === 1 ? 'y' : 'ies'}</strong></>
              )}.
              You can restore it from the Trash tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={confirmDelete}
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Permanent-delete Confirmation ── */}
      <AlertDialog open={!!permanentDeleteTarget} onOpenChange={() => setPermanentDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{permanentDeleteTarget?.name}"</strong> will be permanently deleted. This cannot be undone.
              If products are assigned to this category, deletion will be blocked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => permanentDeleteTarget && handlePermanentDelete(permanentDeleteTarget)}
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
