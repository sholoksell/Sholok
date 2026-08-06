import React, { useState, useEffect, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Returns a Set of slugs that are ancestors of targetSlug, or null if not found
function findAncestorSlugs(nodes, targetSlug, path = []) {
  for (const node of nodes) {
    if (node.slug === targetSlug) {
      return new Set(path.map((n) => n.slug));
    }
    const kids = node.subcategories || [];
    if (kids.length > 0) {
      const result = findAncestorSlugs(kids, targetSlug, [...path, node]);
      if (result !== null) return result;
    }
  }
  return null;
}

// ─── TREE NODE ────────────────────────────────────────────────────────────────

const TreeNode = memo(function TreeNode({ node, depth, getCatName, activeSlug, openSlugs }) {
  const hasChildren = (node.subcategories?.length || 0) > 0;
  const isActive = node.slug === activeSlug;
  const isAncestor = openSlugs ? openSlugs.has(node.slug) : false;

  // L1 nodes (depth 0) expand by default; others expand if they are active or an ancestor
  const [open, setOpen] = useState(() => depth === 0 || isActive || isAncestor);

  // Auto-expand when navigation changes the active slug
  useEffect(() => {
    if (isActive || isAncestor) setOpen(true);
  }, [activeSlug, isActive, isAncestor]);

  const indent = depth * 14;

  return (
    <li>
      <div
        className={`flex items-center gap-1 py-1.5 pr-2 rounded-md transition-colors ${
          isActive
            ? 'bg-[#E31E24]/10 text-[#E31E24]'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${6 + indent}px` }}
      >
        {/* Expand / Collapse toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          className={`shrink-0 w-5 h-5 flex items-center justify-center rounded transition-colors ${
            hasChildren
              ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'
              : 'invisible pointer-events-none'
          }`}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {hasChildren &&
            (open ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            ))}
        </button>

        {/* Category link */}
        <Link
          to={`/category/${node.slug}`}
          className={`flex-1 flex items-center gap-1.5 min-w-0 text-sm leading-tight ${
            isActive
              ? 'font-semibold text-[#E31E24]'
              : 'text-gray-700 hover:text-[#E31E24]'
          }`}
        >
          {node.icon && (
            <span className="shrink-0 text-base leading-none">{node.icon}</span>
          )}
          <span className="truncate">{getCatName(node)}</span>
        </Link>

        {/* Child count badge */}
        {hasChildren && (
          <span className="shrink-0 text-[10px] text-gray-400 font-mono ml-1 tabular-nums">
            {node.subcategories.length}
          </span>
        )}
      </div>

      {/* Children rendered recursively — no depth limit */}
      {hasChildren && open && (
        <ul className="border-l border-gray-100 ml-3">
          {node.subcategories.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              getCatName={getCatName}
              activeSlug={activeSlug}
              openSlugs={openSlugs}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

// ─── CATEGORY TREE ────────────────────────────────────────────────────────────

const CategoryTree = ({ categories, activeSlug = '', title = '', className = '' }) => {
  const { language } = useLanguage();
  const getCatName = (cat) =>
    language === 'bn' && cat.nameBn ? cat.nameBn : cat.name;

  // Compute which nodes must be open to reveal the active slug
  const openSlugs = useMemo(() => {
    if (!activeSlug || !categories?.length) return null;
    return findAncestorSlugs(categories, activeSlug) || null;
  }, [categories, activeSlug]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
            {title}
          </h3>
        </div>
      )}
      <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        <ul className="space-y-0.5">
          {categories.map((cat) => (
            <TreeNode
              key={cat._id}
              node={cat}
              depth={0}
              getCatName={getCatName}
              activeSlug={activeSlug}
              openSlugs={openSlugs}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default CategoryTree;
