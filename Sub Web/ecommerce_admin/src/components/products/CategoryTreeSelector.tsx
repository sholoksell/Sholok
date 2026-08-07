import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
import { Category } from '@/store/categoryStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Folder,
  FolderOpen,
  FileText,
  ChevronsUpDown,
  FoldVertical,
  UnfoldVertical,
} from 'lucide-react';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL?.replace('/admin-api', '') || '';

function getCategoryImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^(https?:|data:|blob:)/i.test(image)) return image;
  const clean = image.startsWith('/') ? image : `/${image}`;
  return `${API_BASE}${clean}`;
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CategoryNode extends Category {
  children: CategoryNode[];
}

// ─── TREE BUILDER ─────────────────────────────────────────────────────────────

function buildTree(flat: Category[]): CategoryNode[] {
  const map: Record<string, CategoryNode> = {};
  flat.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });
  const roots: CategoryNode[] = [];
  flat.forEach((c) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else if (!c.parentId) {
      roots.push(map[c.id]);
    }
  });
  const sort = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => (a.position - b.position) || a.name.localeCompare(b.name));
    nodes.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

function filterTree(nodes: CategoryNode[], q: string): CategoryNode[] {
  const lower = q.toLowerCase();
  return nodes.reduce<CategoryNode[]>((acc, node) => {
    const kids = filterTree(node.children, lower);
    const match =
      node.name.toLowerCase().includes(lower) ||
      (node.nameBn && node.nameBn.toLowerCase().includes(lower));
    if (match || kids.length > 0) acc.push({ ...node, children: kids });
    return acc;
  }, []);
}

function collectAllIds(nodes: CategoryNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...collectAllIds(n.children)]);
}

function getCategoryPath(id: string, flat: Category[], language: 'en' | 'bn'): string {
  const getName = (c: Category) =>
    language === 'bn' && c.nameBn ? c.nameBn : c.name;
  const map = Object.fromEntries(flat.map((c) => [c.id, c]));
  const parts: string[] = [];
  let cur = map[id];
  while (cur) {
    parts.unshift(getName(cur));
    cur = cur.parentId ? map[cur.parentId] : undefined!;
  }
  return parts.join(' › ');
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-300/40 text-inherit rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── TREE NODE ────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: CategoryNode;
  depth: number;
  search: string;
  selectedId: string;
  language: 'en' | 'bn';
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

const TreeNode = memo(function TreeNode({
  node,
  depth,
  search,
  selectedId,
  language,
  expandedIds,
  onSelect,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const primaryName = language === 'bn' && node.nameBn ? node.nameBn : node.name;
  const secondaryName = language === 'bn' ? node.name : node.nameBn;
  const imgUrl = getCategoryImageUrl(node.image);

  const indent = depth * 20;

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(node.id);
    },
    [node.id, onSelect]
  );

  const handleExpandClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleExpand(node.id);
    },
    [node.id, onToggleExpand]
  );

  return (
    <div>
      {/* Row */}
      <div
        role="option"
        aria-selected={isSelected}
        onClick={handleRowClick}
        className={`
          group flex items-center gap-2 py-1.5 pr-3 rounded-md cursor-pointer select-none
          transition-colors duration-100
          ${isSelected
            ? 'bg-primary/15 text-primary font-medium'
            : 'hover:bg-muted/60 text-foreground'
          }
        `}
        style={{ paddingLeft: `${8 + indent}px` }}
      >
        {/* Expand / Collapse Toggle */}
        <button
          type="button"
          onClick={handleExpandClick}
          className={`
            shrink-0 w-5 h-5 flex items-center justify-center rounded
            transition-colors
            ${hasChildren
              ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
              : 'invisible pointer-events-none'
            }
          `}
          tabIndex={-1}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren && (
            isExpanded
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Folder / File Icon */}
        <span className={`shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
          {hasChildren
            ? isExpanded
              ? <FolderOpen className="w-4 h-4" />
              : <Folder className="w-4 h-4" />
            : <FileText className="w-3.5 h-3.5" />
          }
        </span>

        {/* Category Image */}
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={node.name}
            loading="lazy"
            className="shrink-0 w-6 h-6 rounded object-cover border border-border/50 bg-muted"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : node.icon ? (
          <span className="shrink-0 w-6 h-6 flex items-center justify-center text-base leading-none">
            {node.icon}
          </span>
        ) : null}

        {/* Name */}
        <div className="flex-1 min-w-0">
          <span className="text-sm leading-tight truncate block">
            {highlightText(primaryName, search)}
          </span>
          {secondaryName && secondaryName !== primaryName && (
            <span className="text-[10px] text-muted-foreground truncate block leading-tight">
              {highlightText(secondaryName, search)}
            </span>
          )}
        </div>

        {/* Level badge */}
        {node.level > 1 && (
          <span className="shrink-0 text-[9px] text-muted-foreground/60 font-mono">
            L{node.level}
          </span>
        )}

        {/* Selected check */}
        {isSelected && (
          <span className="shrink-0 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
            <svg viewBox="0 0 8 8" fill="none" className="w-2 h-2">
              <path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              search={search}
              selectedId={selectedId}
              language={language}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface CategoryTreeSelectorProps {
  categories: Category[];
  value: string;            // selected category id
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CategoryTreeSelector({
  categories,
  value,
  onChange,
  placeholder = '— ক্যাটাগরি বেছে নিন —',
  disabled = false,
  className = '',
}: CategoryTreeSelectorProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Build tree from flat list (active only for selection)
  const tree = useMemo(() => buildTree(categories.filter(c => c.status === 'active')), [categories]);
  const allIds = useMemo(() => collectAllIds(tree), [tree]);

  // Filtered tree for search
  const displayTree = useMemo(
    () => (search.trim() ? filterTree(tree, search.trim()) : tree),
    [tree, search]
  );

  // Auto-expand when searching
  useEffect(() => {
    if (search.trim()) {
      setExpandedIds(new Set(collectAllIds(displayTree)));
    }
  }, [search, displayTree]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      setOpen(false);
      setSearch('');
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange('');
    },
    [onChange]
  );

  const expandAll = useCallback(() => {
    setExpandedIds(new Set(allIds));
  }, [allIds]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Trigger button label
  const triggerLabel = useMemo(() => {
    if (!value) return null;
    const found = categories.find((c) => c.id === value);
    if (!found) return null;
    return getCategoryPath(value, categories, language);
  }, [value, categories, language]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`
          w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm text-left
          transition-colors bg-secondary border-border
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}
          ${open ? 'ring-2 ring-ring border-primary' : ''}
          ${!triggerLabel ? 'text-muted-foreground' : 'text-foreground'}
        `}
      >
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="flex-1 truncate">
          {triggerLabel || placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); handleClear(e); }}
            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full min-w-[320px] bg-popover border border-border rounded-lg shadow-xl flex flex-col"
          style={{ maxHeight: '420px' }}
        >
          {/* Search + Controls */}
          <div className="p-2 border-b border-border space-y-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="বাংলা বা English এ খুঁজুন..."
                className="pl-8 h-8 text-sm bg-secondary border-border"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Expand / Collapse All */}
            <div className="flex gap-1 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={expandAll}
              >
                <UnfoldVertical className="w-3 h-3 mr-1" />
                সব খুলুন
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                onClick={collapseAll}
              >
                <FoldVertical className="w-3 h-3 mr-1" />
                সব বন্ধ করুন
              </Button>
            </div>
          </div>

          {/* Tree Scroll Area */}
          <div className="overflow-y-auto flex-1 p-1.5" role="listbox">
            {displayTree.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {search ? `"${search}" পাওয়া যায়নি` : 'কোনো ক্যাটাগরি নেই'}
              </div>
            ) : (
              displayTree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  search={search}
                  selectedId={value}
                  language={language}
                  expandedIds={expandedIds}
                  onSelect={handleSelect}
                  onToggleExpand={handleToggleExpand}
                />
              ))
            )}
          </div>

          {/* Footer: selected path */}
          {value && triggerLabel && (
            <div className="border-t border-border px-3 py-2 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground shrink-0">নির্বাচিত:</span>
              <span className="text-[11px] text-primary font-medium truncate">{triggerLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
