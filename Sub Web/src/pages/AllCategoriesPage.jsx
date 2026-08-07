import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useCategories } from '@/contexts/CategoryContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CategoryIcon from '@/components/CategoryIcon';
import { getImageUrl } from '@/lib/utils';

// Recursive sub-tree node used inside each L1 card
const SubTreeNode = ({ node, getCatName, depth }) => {
  const hasChildren = (node.subcategories?.length || 0) > 0;
  const [open, setOpen] = useState(depth === 0);
  const indent = depth * 12;

  return (
    <li>
      <div
        className="flex items-center gap-1 py-1.5 pr-2 rounded-md hover:bg-gray-50 transition-colors"
        style={{ paddingLeft: `${6 + indent}px` }}
      >
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); setOpen((o) => !o); }}
          className={`shrink-0 w-4 h-4 flex items-center justify-center text-gray-300 hover:text-gray-600 ${
            !hasChildren ? 'invisible pointer-events-none' : ''
          }`}
        >
          {hasChildren && (
            open
              ? <ChevronDown className="w-3 h-3" />
              : <ChevronRight className="w-3 h-3" />
          )}
        </button>
        <Link
          to={`/category/${node.slug}`}
          className={`flex-1 min-w-0 truncate text-sm hover:text-[#E31E24] transition-colors ${
            depth === 0 ? 'font-medium text-gray-700' : 'text-gray-600'
          }`}
        >
          {getCatName(node)}
        </Link>
        {hasChildren && (
          <span className="shrink-0 text-[10px] text-gray-400 tabular-nums">
            {node.subcategories.length}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <SubTree nodes={node.subcategories} getCatName={getCatName} depth={depth + 1} />
      )}
    </li>
  );
};

// Recursive list wrapper
const SubTree = ({ nodes, getCatName, depth }) => {
  if (!nodes || nodes.length === 0) return null;
  return (
    <ul className={depth > 0 ? 'border-l border-gray-100 ml-3 mt-0.5' : ''}>
      {nodes.map((node) => (
        <SubTreeNode key={node._id} node={node} getCatName={getCatName} depth={depth} />
      ))}
    </ul>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const AllCategoriesPage = () => {
  const { categories, loading } = useCategories();
  const { language } = useLanguage();
  const getCatName = (cat) =>
    language === 'bn' && cat.nameBn ? cat.nameBn : cat.name;

  const pageTitle = language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories';

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb + Header */}
      <div className="bg-muted/50 border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-primary transition-colors">
              {language === 'bn' ? 'হোম' : 'Home'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{pageTitle}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {language === 'bn'
              ? `${categories.length}টি প্রধান ক্যাটাগরি`
              : `${categories.length} main categories`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* One card per L1 category, each showing full recursive sub-tree */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* L1 header row */}
              <Link
                to={`/category/${cat.slug}`}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 hover:bg-red-50 transition-colors group"
              >
                <div className="w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm shrink-0 overflow-hidden">
                  {cat.image ? (
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      className="w-7 h-7 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <CategoryIcon
                      icon={cat.icon}
                      image={cat.image}
                      name={cat.name}
                      className="w-6 h-6"
                    />
                  )}
                </div>
                <span className="flex-1 font-bold text-gray-900 group-hover:text-[#E31E24] transition-colors truncate">
                  {getCatName(cat)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E31E24] shrink-0" />
              </Link>

              {/* Sub-tree body */}
              {cat.subcategories?.length > 0 ? (
                <nav className="p-2 max-h-80 overflow-y-auto">
                  <SubTree
                    nodes={cat.subcategories}
                    getCatName={getCatName}
                    depth={0}
                  />
                </nav>
              ) : (
                <p className="px-4 py-3 text-sm text-muted-foreground italic">
                  {language === 'bn' ? 'কোনো সাব-ক্যাটাগরি নেই' : 'No subcategories'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCategoriesPage;
