import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiSave, FiSend, FiImage, FiVideo, FiTag, FiMapPin, FiClock, FiX, FiEye } from 'react-icons/fi';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ['clean'],
  ],
};

export default function WritePost() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [location, setLocation] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('write');
  const [autoSaved, setAutoSaved] = useState(false);

  const autoSaveRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    if (id) loadPost(id);
  }, [id]);

  useEffect(() => {
    // Auto-save to localStorage
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (title || content) {
        localStorage.setItem('blog_draft', JSON.stringify({ title, content, category, tags }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [title, content, category, tags]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.categories);
    } catch (_) {}
  };

  const loadPost = async (postId) => {
    try {
      const res = await api.get(`/posts/${postId}`);
      const p = res.data.post;
      setTitle(p.title);
      setContent(p.content);
      setCategory(p.category?._id || '');
      setSubcategory(p.subcategory || '');
      setTags(p.tags || []);
      setLocation(p.location || '');
      setSeoTitle(p.seoTitle || '');
      setSeoDescription(p.seoDescription || '');
      if (p.featuredImage) setFeaturedImagePreview(p.featuredImage);
    } catch (_) { toast.error('Failed to load post'); }
  };

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (newTag && !tags.includes(newTag) && tags.length < 10) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleFeaturedImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large (max 10MB)'); return; }
    setFeaturedImage(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (status) => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!content.trim() || content === '<p><br></p>') { toast.error('Content is required'); return; }
    if (!category) { toast.error('Please select a category'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content);
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('tags', JSON.stringify(tags));
      formData.append('status', status);
      formData.append('location', location);
      formData.append('seoTitle', seoTitle);
      formData.append('seoDescription', seoDescription);
      if (scheduledAt && status === 'scheduled') formData.append('scheduledAt', scheduledAt);
      if (featuredImage) formData.append('featuredImage', featuredImage);
      images.forEach((img) => formData.append('images', img));
      videos.forEach((vid) => formData.append('videos', vid));

      let res;
      if (id) {
        res = await api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      localStorage.removeItem('blog_draft');
      toast.success(status === 'draft' ? 'Saved as draft!' : 'Post published!');
      if (status === 'published') navigate(`/blog/${res.data.post.slug}`);
      else navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c._id === category);
  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <>
      <Helmet><title>Write Post - Sholok Blog</title></Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{id ? 'Edit Post' : 'Write a Post'}</h1>
            <div className="flex items-center gap-3 mt-1">
              {wordCount > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1"><FiClock className="w-3 h-3" />{readTime} min read · {wordCount} words</span>
              )}
              {autoSaved && <span className="text-xs text-green-500">✓ Auto-saved</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSubmit('draft')} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50">
              <FiSave className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={() => handleSubmit('published')} disabled={loading}
              className="flex items-center gap-2 btn-primary text-sm disabled:opacity-50">
              <FiSend className="w-4 h-4" /> {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {['write', 'preview'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition capitalize ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab === 'preview' && <FiEye className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'write' ? (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your post title here..."
                  className="w-full text-2xl sm:text-3xl font-bold font-heading border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-700 focus:outline-none focus:border-primary-500 pb-4 transition"
                  maxLength={200}
                />

                {/* Featured image */}
                <div className="relative">
                  {featuredImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden">
                      <img src={featuredImagePreview} alt="Featured" className="w-full h-48 object-cover" />
                      <button onClick={() => { setFeaturedImage(null); setFeaturedImagePreview(''); }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition">
                      <input type="file" accept="image/*" onChange={handleFeaturedImage} className="hidden" />
                      <FiImage className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-400 font-medium">Add featured image</span>
                    </label>
                  )}
                </div>

                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={QUILL_MODULES}
                  placeholder="Write your story here..."
                  className="bg-white dark:bg-gray-900"
                />

                {/* Media uploads */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-400 transition text-sm text-gray-500 dark:text-gray-400">
                    <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} className="hidden" />
                    <FiImage className="w-4 h-4" /> Add Images {images.length > 0 && `(${images.length})`}
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary-400 transition text-sm text-gray-500 dark:text-gray-400">
                    <input type="file" accept="video/*" multiple onChange={(e) => setVideos(Array.from(e.target.files))} className="hidden" />
                    <FiVideo className="w-4 h-4" /> Add Videos {videos.length > 0 && `(${videos.length})`}
                  </label>
                </div>
              </>
            ) : (
              <div className="card p-6">
                {featuredImagePreview && <img src={featuredImagePreview} alt="Featured" className="w-full h-48 object-cover rounded-xl mb-6" />}
                <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white mb-4">{title || 'Your Title'}</h1>
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: content || '<p>Your content preview will appear here...</p>' }} />
              </div>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Post Settings</h3>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input text-sm">
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {selectedCategory?.subcategories?.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Subcategory</label>
                  <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="input text-sm">
                    <option value="">None</option>
                    {selectedCategory.subcategories.map((sub) => (
                      <option key={sub.slug} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  <FiTag className="inline w-3 h-3 mr-1" />Tags (max 10)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition"><FiX className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Add tag and press Enter..."
                  disabled={tags.length >= 10}
                  className="input text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  <FiMapPin className="inline w-3 h-3 mr-1" />Location
                </label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Dhaka, Bangladesh" className="input text-sm" />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  <FiClock className="inline w-3 h-3 mr-1" />Schedule Publishing
                </label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="input text-sm" min={new Date().toISOString().slice(0, 16)} />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">SEO Title</label>
                <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="SEO-friendly title..." className="input text-sm" maxLength={70} />
                <p className="text-xs text-gray-400 mt-1">{seoTitle.length}/70</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Meta Description</label>
                <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Brief description for search engines..." rows={3} className="input text-sm resize-none" maxLength={160} />
                <p className="text-xs text-gray-400 mt-1">{seoDescription.length}/160</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button onClick={() => handleSubmit('published')} disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                <FiSend className="w-4 h-4" /> {loading ? 'Publishing...' : 'Publish Now'}
              </button>
              {scheduledAt && (
                <button onClick={() => handleSubmit('scheduled')} disabled={loading}
                  className="w-full btn-outline flex items-center justify-center gap-2 text-sm">
                  <FiClock className="w-4 h-4" /> Schedule Post
                </button>
              )}
              <button onClick={() => handleSubmit('draft')} disabled={loading}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2">
                <FiSave className="w-4 h-4" /> Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
