import { useEffect, useState } from "react";
import { Save, Palette, Image as ImageIcon, Layout as LayoutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storesApi } from "@/lib/api";
import { toast } from "sonner";

const themePresets = [
  { id: "minimal",   name: "Minimal",  primary: "#0f172a" },
  { id: "vibrant",   name: "Vibrant",  primary: "#f43f5e" },
  { id: "earthy",    name: "Earthy",   primary: "#b45309" },
  { id: "forest",    name: "Forest",   primary: "#15803d" },
  { id: "ocean",     name: "Ocean",    primary: "#0369a1" },
  { id: "midnight",  name: "Midnight", primary: "#4338ca" },
];

export default function StoreCustomizePage() {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState<any>({
    name: "", description: "", logo: "", banner: "",
    contact: { email: "", phone: "", website: "" },
    socialLinks: { facebook: "", instagram: "", twitter: "" },
    policies: { returnPolicy: "", shippingPolicy: "" },
    layout: { theme: "minimal", primaryColor: "#0f172a", bannerStyle: "wide", featuredCount: 8 },
    tags: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await storesApi.me();
        if (res?.store) setForm((p: any) => ({ ...p, ...res.store, layout: { ...p.layout, ...(res.store.layout || {}) } }));
      } catch (err: any) {
        toast.error(err.message || "Could not load your store");
      } finally { setLoading(false); }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await storesApi.updateMe(form);
      toast.success("Store customization saved");
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally { setSaving(false); }
  };

  const set = (path: string, value: any) => {
    setForm((p: any) => {
      const out = { ...p };
      const keys = path.split(".");
      let cur = out;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return out;
    });
  };

  if (loading) return <div className="container py-12 text-muted-foreground">Loading your store…</div>;

  return (
    <div className="container py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Customize your Smart Store</h1>
          <p className="text-muted-foreground text-sm">Brand identity, banners, and store layout</p>
        </div>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save"}</Button>
      </div>

      {/* Brand */}
      <section className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Brand identity</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Store name</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="space-y-2"><Label>Logo URL</Label>
            <Input value={form.logo || ""} onChange={(e) => set("logo", e.target.value)} placeholder="https://..." /></div>
          <div className="space-y-2 md:col-span-2"><Label>Banner image URL</Label>
            <Input value={form.banner || ""} onChange={(e) => set("banner", e.target.value)} placeholder="https://..." /></div>
          <div className="space-y-2 md:col-span-2"><Label>Description</Label>
            <Textarea rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></div>
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Palette className="w-4 h-4" />Theme</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {themePresets.map((t) => (
            <button
              key={t.id}
              onClick={() => { set("layout.theme", t.id); set("layout.primaryColor", t.primary); }}
              className={`p-3 rounded-xl border text-left transition ${form.layout?.theme === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
            >
              <div className="w-full h-8 rounded-md mb-2" style={{ backgroundColor: t.primary }} />
              <div className="text-xs font-medium">{t.name}</div>
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Primary color (hex)</Label>
            <Input value={form.layout?.primaryColor || ""} onChange={(e) => set("layout.primaryColor", e.target.value)} /></div>
          <div className="space-y-2"><Label>Banner style</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.layout?.bannerStyle || "wide"} onChange={(e) => set("layout.bannerStyle", e.target.value)}>
              <option value="wide">Wide</option><option value="centered">Centered</option><option value="split">Split</option>
            </select></div>
        </div>
      </section>

      {/* Layout */}
      <section className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><LayoutIcon className="w-4 h-4" />Layout</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Featured products count</Label>
            <Input type="number" min={4} max={24} value={form.layout?.featuredCount || 8}
              onChange={(e) => set("layout.featuredCount", parseInt(e.target.value || "8", 10))} /></div>
          <div className="space-y-2"><Label>Tags (comma-separated)</Label>
            <Input value={(form.tags || []).join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} /></div>
        </div>
      </section>

      {/* Contact / Social / Policies */}
      <section className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h2 className="font-display font-bold text-lg mb-4">Contact & policies</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Email</Label>
            <Input value={form.contact?.email || ""} onChange={(e) => set("contact.email", e.target.value)} /></div>
          <div className="space-y-2"><Label>Phone</Label>
            <Input value={form.contact?.phone || ""} onChange={(e) => set("contact.phone", e.target.value)} /></div>
          <div className="space-y-2"><Label>Facebook</Label>
            <Input value={form.socialLinks?.facebook || ""} onChange={(e) => set("socialLinks.facebook", e.target.value)} /></div>
          <div className="space-y-2"><Label>Instagram</Label>
            <Input value={form.socialLinks?.instagram || ""} onChange={(e) => set("socialLinks.instagram", e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Return policy</Label>
            <Textarea rows={3} value={form.policies?.returnPolicy || ""} onChange={(e) => set("policies.returnPolicy", e.target.value)} /></div>
          <div className="space-y-2 md:col-span-2"><Label>Shipping policy</Label>
            <Textarea rows={3} value={form.policies?.shippingPolicy || ""} onChange={(e) => set("policies.shippingPolicy", e.target.value)} /></div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} size="lg"><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save customization"}</Button>
      </div>
    </div>
  );
}
