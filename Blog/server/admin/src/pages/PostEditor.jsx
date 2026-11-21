import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSave, FiEye, FiEdit3, FiImage, FiX, FiPlus,
  FiSend, FiClock, FiBold, FiItalic, FiLink, FiList
} from 'react-icons/fi';

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef();
  const contentRef = useRef();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showBnEn, setShowBnEn] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const [form, setForm] = useState({
    title: '', titleBn: '', titleEn: '',
    content: '', contentBn: '', contentEn: '',
    category: '',
    tags: [],
    status: 'draft',
    seoTitle: '', seoDescription: '',
    location: '', subcategory: '',
    featuredImage: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/posts/${id}/content`)
      .then((r) => {
        const p = r.data.post;
        setForm({
          title:          p.title         || '',
          titleBn:        p.titleBn       || '',
          titleEn:        p.titleEn       || '',
          content:        p.content       || '',
          contentBn:      p.contentBn     || '',
          contentEn:      p.contentEn     || '',
          category:       String(p.category?._id || ''),
          tags:           p.tags          || [],
          status:         p.status        || 'draft',
          seoTitle:       p.seoTitle      || '',
          seoDescription: p.seoDescription|| '',
          location:       p.location      || '',
          subcategory:    p.subcategory   || '',
          featuredImage:  p.featuredImage || '',
        });
        if (p.featuredImage) setImagePreview(p.featuredImage);
        if (p.titleBn || p.titleEn || p.contentBn || p.contentEn) setShowBnEn(true);
        if (p.seoTitle || p.seoDescription) setShowSeo(true);
      })
      .catch(() => toast.error('Failed to load post'))
      .finally(() => setLoading(false));
  }, [id]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setField('featuredImage', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tags.includes(tag) && form.tags.length < 20) {
      setField('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      setField('tags', form.tags.slice(0, -1));
    }
  };

  const insertFormat = (open, close) => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.substring(start, end);
    const text  = el.value.substring(0, start) + open + sel + close + el.value.substring(end);
    setField('content', text);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + open.length, start + open.length + sel.length);
    }, 0);
  };

  const handleSubmit = async (statusOverride) => {
    if (!form.title.trim())   { toast.error('Title is required');    return; }
    if (!form.category)       { toast.error('Category is required'); return; }
    if (!form.content.trim()) { toast.error('Content is required');  return; }

    setSaving(true);
    const targetStatus = statusOverride || form.status;
    try {
      const data = new FormData();
      data.append('title',          form.title);
      data.append('content',        form.content);
      data.append('category',       form.category);
      data.append('status',         targetStatus);
      data.append('tags',           JSON.stringify(form.tags));
      if (form.titleBn)       data.append('titleBn',       form.titleBn);
      if (form.titleEn)       data.append('titleEn',       form.titleEn);
      if (form.contentBn)     data.append('contentBn',     form.contentBn);
      if (form.contentEn)     data.append('contentEn',     form.contentEn);
      if (form.seoTitle)      data.append('seoTitle',      form.seoTitle);
      if (form.seoDescription)data.append('seoDescription',form.seoDescription);
      if (form.location)      data.append('location',      form.location);
      if (form.subcategory)   data.append('subcategory',   form.subcategory);
      if (imageFile)          data.append('featuredImage', imageFile);

      if (isEdit) {
        await api.put(`/posts/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(isEdit ? 'Post updated!' : 'Post created!');
      navigate('/posts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="card h-64 bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/posts" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isEdit ? 'Update post content and settings' : 'Create a new blog post'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                className="input text-lg font-semibold"
                placeholder="Enter post title..."
              />
            </div>

            {/* Bilingual toggle */}
            <button
              onClick={() => setShowBnEn((v) => !v)}
              className="text-xs text-primary-600 hover:underline"
            >
              {showBnEn ? '− Hide' : '+ Add'} Bengali / English titles
            </button>

            {showBnEn && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Title (বাংলা)</label>
                  <input type="text" value={form.titleBn} onChange={(e) => setField('titleBn', e.target.value)} className="input" placeholder="বাংলা শিরোনাম" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Title (English)</label>
                  <input type="text" value={form.titleEn} onChange={(e) => setField('titleEn', e.target.value)} className="input" placeholder="English title" />
                </div>
              </div>
            )}
          </div>

          {/* Content editor */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${!previewMode ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FiEdit3 className="w-3.5 h-3.5" /> Write
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${previewMode ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FiEye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
              {!previewMode && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => insertFormat('<strong>', '</strong>')} title="Bold" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs font-bold">B</button>
                  <button onClick={() => insertFormat('<em>', '</em>')}         title="Italic" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs italic">I</button>
                  <button onClick={() => insertFormat('<h2>', '</h2>')}         title="Heading 2" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs font-bold">H2</button>
                  <button onClick={() => insertFormat('<h3>', '</h3>')}         title="Heading 3" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs font-bold">H3</button>
                  <button onClick={() => insertFormat('<p>', '</p>')}           title="Paragraph" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs">P</button>
                  <button onClick={() => insertFormat('<ul>\n  <li>', '</li>\n</ul>')} title="Bullet list" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"><FiList className="w-3.5 h-3.5" /></button>
                  <button onClick={() => insertFormat('<a href="">', '</a>')}   title="Link" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"><FiLink className="w-3.5 h-3.5" /></button>
                  <button onClick={() => insertFormat('<blockquote>', '</blockquote>')} title="Quote" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xs">"</button>
                  <button onClick={() => insertFormat('<img src="" alt=""/>', '')} title="Image" className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"><FiImage className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>

            {!previewMode ? (
              <textarea
                ref={contentRef}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                rows={20}
                className="w-full px-5 py-4 text-sm font-mono text-gray-800 resize-none outline-none border-0 bg-white leading-relaxed"
                placeholder="Write your post content here (HTML is supported)..."
              />
            ) : (
              <div
                className="px-5 py-4 min-h-[480px] prose prose-sm max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-gray-400">Nothing to preview yet...</p>' }}
              />
            )}
          </div>

          {/* Tags */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                  #{tag}
                  <button onClick={() => setField('tags', form.tags.filter((t) => t !== tag))} className="text-primary-400 hover:text-primary-700 transition"><FiX className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="input flex-1 py-2"
                placeholder="Add tag and press Enter or comma..."
              />
              <button onClick={addTag} className="btn-outline py-2 px-3">
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Press Enter or comma to add. Max 20 tags.</p>
          </div>

          {/* SEO */}
          <div className="card p-5">
            <button
              onClick={() => setShowSeo((v) => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SEO Settings</span>
              <span className="text-xs text-primary-600">{showSeo ? '−' : '+'}</span>
            </button>
            {showSeo && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">SEO Title</label>
                  <input type="text" value={form.seoTitle} onChange={(e) => setField('seoTitle', e.target.value)} className="input" placeholder="Custom SEO title (defaults to post title)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">SEO Description</label>
                  <textarea value={form.seoDescription} onChange={(e) => setField('seoDescription', e.target.value)} rows={3} className="input resize-none" placeholder="Meta description (160 chars recommended)" maxLength={300} />
                  <p className="text-xs text-gray-400 mt-1">{form.seoDescription.length}/300</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publish box */}
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Publish</h3>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleSubmit()}
                disabled={saving}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <><FiSave className="w-4 h-4" /> {isEdit ? 'Update Post' : 'Save Post'}</>
                )}
              </button>
              {form.status !== 'published' && (
                <button
                  onClick={() => handleSubmit('published')}
                  disabled={saving}
                  className="btn w-full justify-center bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <FiSend className="w-4 h-4" /> Publish Now
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="input">
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {form.category && categories.find((c) => c._id === form.category)?.subcategories?.length > 0 && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Subcategory</label>
                <select value={form.subcategory} onChange={(e) => setField('subcategory', e.target.value)} className="input">
                  <option value="">None</option>
                  {categories.find((c) => c._id === form.category)?.subcategories?.map((s) => (
                    <option key={s._id} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Featured Image</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="" className="w-full h-40 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition"
              >
                <FiImage className="w-6 h-6" />
                <span className="text-xs font-medium">Click to upload image</span>
                <span className="text-xs">JPG, PNG, WebP — max 10MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Extra fields */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">Extra</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Location</label>
              <input type="text" value={form.location} onChange={(e) => setField('location', e.target.value)} className="input" placeholder="e.g. Dhaka, Bangladesh" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
