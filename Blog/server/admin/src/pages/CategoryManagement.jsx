import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit3, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const EMPTY_FORM = { name: '', nameBn: '', nameEn: '', description: '', icon: '', color: '#6941ff', group: 'entertainment', order: 0 };

export default function CategoryManagement() {
  const { getLocalizedField } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (_) {} finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/categories/${editingId}`, form);
        setCategories((prev) => prev.map((c) => c._id === editingId ? res.data.category : c));
        toast.success('Category updated!');
      } else {
        const res = await api.post('/categories', form);
        setCategories((prev) => [...prev, res.data.category]);
        toast.success('Category created!');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, nameBn: cat.nameBn || '', nameEn: cat.nameEn || '', description: cat.description || '', icon: cat.icon || '', color: cat.color || '#6941ff', group: cat.group || 'entertainment', order: cat.order || 0 });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Deactivate "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat._id}`);
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      toast.success('Category deactivated');
    } catch (_) { toast.error('Failed'); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.post('/admin/seed-categories');
      await fetchCategories();
      toast.success('Categories seeded!');
    } catch (_) { toast.error('Failed to seed'); } finally { setSeeding(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-400 text-sm">{categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSeed} disabled={seeding} className="btn-outline text-xs py-2">
            {seeding ? 'Seeding...' : '🌱 Seed Default'}
          </button>
          <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }} className="btn-primary">
            <FiPlus className="w-4 h-4" /> New Category
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><FiX /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Name (Bangla)</label>
              <input type="text" value={form.nameBn} onChange={(e) => setForm(f => ({ ...f, nameBn: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Name (English)</label>
              <input type="text" value={form.nameEn} onChange={(e) => setForm(f => ({ ...f, nameEn: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} className="input" placeholder="🎨" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                <input type="text" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Group</label>
              <select value={form.group} onChange={(e) => setForm(f => ({ ...f, group: e.target.value }))} className="input">
                <option value="entertainment">Entertainment</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="hobbies">Hobbies</option>
                <option value="knowledge">Knowledge</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Category'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      {/* Categories list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${cat.color}20`, border: `2px solid ${cat.color}30` }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-900">{getLocalizedField(cat, 'name')}</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{cat.group}</span>
                    <span className="text-xs text-gray-400">{cat.postCount || 0} posts</span>
                  </div>
                  {cat.description && <p className="text-sm text-gray-400 truncate">{cat.description}</p>}
                  {cat.subcategories?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{cat.subcategories.length} subcategories: {cat.subcategories.slice(0,3).map(s => s.name).join(', ')}{cat.subcategories.length > 3 ? '...' : ''}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(cat)} className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"><FiEdit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <div className="text-center py-12 text-gray-400">No categories yet. Seed default categories to get started.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
