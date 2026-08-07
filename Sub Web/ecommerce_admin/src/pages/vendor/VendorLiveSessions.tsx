import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Radio, Plus, Clock, Package } from 'lucide-react';

type Session = {
  id: number; title: string; description: string; status: string;
  scheduled_at: string; started_at: string; viewer_count: number; product_count: number;
};

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-red-100 text-red-700',
  scheduled: 'bg-blue-100 text-blue-700',
  ended: 'bg-gray-100 text-gray-600',
};

export default function VendorLiveSessions() {
  const { vendor, token } = useVendorAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '' });
  const [saving, setSaving] = useState(false);

  const vendorId = vendor?._id;

  const load = () => {
    if (!vendorId) return;
    setLoading(true);
    fetch(`/admin-api/live-shop/vendor/${vendorId}/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [vendorId]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await fetch('/admin-api/live-shop/vendor/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendorId, ...form, scheduledAt: form.scheduledAt || null }),
      });
      setShowCreate(false);
      setForm({ title: '', description: '', scheduledAt: '' });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/admin-api/live-shop/vendor/sessions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, vendorId }),
    });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Live Shopping Sessions</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus size={16} className="mr-1" /> Create Session
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Video size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No live sessions yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first live shopping session</p>
              <Button onClick={() => setShowCreate(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Plus size={14} className="mr-1" /> Create Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {s.status === 'live' ? <Radio size={14} className="text-red-500 animate-pulse" /> : <Video size={14} className="text-gray-400" />}
                        <span className="font-semibold">{s.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100'}`}>{s.status}</span>
                      </div>
                      {s.scheduled_at && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> Scheduled: {new Date(s.scheduled_at).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Package size={12} /> {s.product_count || 0} products · {s.viewer_count || 0} viewers
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {s.status === 'scheduled' && (
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => updateStatus(s.id, 'live')}>
                          <Radio size={12} className="mr-1" /> Go Live
                        </Button>
                      )}
                      {s.status === 'live' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, 'ended')}>End Session</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Live Session</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Session Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Weekend Flash Sale Live!" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e: any) => setForm(f => ({...f, description: e.target.value}))} placeholder="What will you show?" className="mt-1" rows={3} />
            </div>
            <div>
              <Label>Scheduled Time (optional)</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({...f, scheduledAt: e.target.value}))} className="mt-1" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={saving || !form.title.trim()} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? 'Creating…' : 'Create Session'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
