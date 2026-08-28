import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then((r) => setSettings(r.data.settings || {})).catch(() => {});
  }, []);

  const handleChange = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { settings });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, k, type = 'text' }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {type === 'toggle' ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={settings[k] === '1'} onChange={(e) => handleChange(k, e.target.checked ? '1' : '0')}
            className="w-4 h-4 accent-indigo-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{settings[k] === '1' ? 'Visible' : 'Hidden'}</span>
        </label>
      ) : (
        <input type={type} value={settings[k] || ''} onChange={(e) => handleChange(k, e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
      )}
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog Settings</h2>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Site Information</h3>
        <Field label="Site Name" k="site_name" />
        <Field label="Site Tagline" k="site_tagline" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Homepage Sections</h3>
        <Field label="Show Featured Section" k="show_featured_section" type="toggle" />
        <Field label="Featured Posts Count" k="homepage_featured_count" type="number" />
        <Field label="Show Trending Section" k="show_trending_section" type="toggle" />
        <Field label="Trending Posts Count" k="homepage_trending_count" type="number" />
        <Field label="Show Latest Section" k="show_latest_section" type="toggle" />
        <Field label="Latest Posts Count" k="homepage_latest_count" type="number" />
        <Field label="Show Bloggers Section" k="show_bloggers_section" type="toggle" />
        <Field label="Top Bloggers Count" k="homepage_bloggers_count" type="number" />
      </div>

      <button onClick={handleSave} disabled={saving}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
