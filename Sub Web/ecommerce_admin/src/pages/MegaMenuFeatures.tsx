import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, ImageIcon, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axios';

interface Feature {
  id: number;
  feature_key: string;
  name: string;
  emoji: string;
  image: string;
  icon_image: string;
  description: string;
  link: string;
  enabled: number;
  sort_order: number;
}

const emptyForm = (f?: Feature) => ({
  name: f?.name || '',
  emoji: f?.emoji || '',
  image: f?.image || '',
  icon_image: f?.icon_image || '',
  description: f?.description || '',
  link: f?.link || '',
  enabled: f?.enabled ?? 1,
  sort_order: f?.sort_order ?? 0,
});

export default function MegaMenuFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await api.get('/megamenu-features');
      setFeatures(data);
    } catch {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (f: Feature) => {
    setEditing(f);
    setForm(emptyForm(f));
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/megamenu-features/${editing.id}`, form);
      setFeatures(prev => prev.map(f => f.id === data.id ? data : f));
      setEditing(null);
      toast.success('Feature updated');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (f: Feature) => {
    try {
      const { data } = await api.put(`/megamenu-features/${f.id}`, { ...f, enabled: f.enabled ? 0 : 1 });
      setFeatures(prev => prev.map(x => x.id === data.id ? data : x));
      toast.success(data.enabled ? 'Enabled' : 'Disabled');
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">MegaMenu Features</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage image and settings for each navigation feature. Images appear in the menu bar (icon) and on the feature page (banner).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(f => (
          <Card key={f.id} className={`overflow-hidden transition-opacity ${f.enabled ? '' : 'opacity-50'}`}>
            {/* Banner preview */}
            <div className="h-28 bg-muted relative overflow-hidden">
              {f.image ? (
                <img src={f.image} alt={f.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              ) : (
                <div className="flex items-center justify-center h-full text-4xl">{f.emoji}</div>
              )}
              {/* Icon image overlay */}
              {f.icon_image && (
                <div className="absolute bottom-2 left-2 w-10 h-10 rounded-lg bg-white shadow-md overflow-hidden border-2 border-white">
                  <img src={f.icon_image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => toggleEnabled(f)}
                  className="w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
                  title={f.enabled ? 'Disable' : 'Enable'}
                >
                  {f.enabled ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>
            </div>

            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{f.emoji} {f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.link}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openEdit(f)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="mt-2 flex gap-1.5 text-xs text-muted-foreground">
                {f.image && <span className="flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> Banner</span>}
                {f.icon_image && <span className="flex items-center gap-0.5"><ImageIcon className="w-3 h-3" /> Icon</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit — {editing?.emoji} {editing?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Flash Sales" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Emoji</label>
                <Input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} placeholder="⚡" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Link / Route</label>
              <Input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="/flash-sales" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Banner Image URL <span className="text-primary font-semibold">(Place 2 — Feature Page Hero)</span></label>
              <Input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
              {form.image && (
                <div className="mt-2 h-28 rounded-lg overflow-hidden bg-muted border">
                  <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon Image URL <span className="text-primary font-semibold">(Place 1 — MegaMenu Bar)</span></label>
              <Input value={form.icon_image} onChange={e => setForm(p => ({ ...p, icon_image: e.target.value }))} placeholder="https://..." />
              {form.icon_image && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border">
                    <img src={form.icon_image} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                  </div>
                  <span className="text-xs text-muted-foreground">Preview at menu bar size</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (shown on feature page)</label>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional tagline…" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort Order</label>
                <Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Visible in Menu</label>
                <button
                  onClick={() => setForm(p => ({ ...p, enabled: p.enabled ? 0 : 1 }))}
                  className={`mt-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full ${form.enabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {form.enabled ? '✓ Enabled' : '✗ Disabled'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1">
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
