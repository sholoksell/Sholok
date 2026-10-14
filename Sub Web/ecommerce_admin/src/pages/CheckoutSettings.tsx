import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Plus, Trash2, Save, RefreshCw, ChevronDown, PackageCheck } from 'lucide-react';

// ── Bangladesh location data ──────────────────────────────────────────────────
const BD_DIVISIONS = [
  'Dhaka','Chittagong','Rajshahi','Khulna','Sylhet','Barisal','Rangpur','Mymensingh',
];

const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka:       ['Dhaka','Gazipur','Narayanganj','Narsingdi','Manikganj','Munshiganj','Rajbari','Shariatpur','Faridpur','Madaripur','Gopalganj','Kishoreganj','Tangail'],
  Chittagong:  ["Chittagong","Cox's Bazar","Comilla","Feni","Noakhali","Lakshmipur","Chandpur","Brahmanbaria","Khagrachhari","Rangamati","Bandarban"],
  Rajshahi:    ['Rajshahi','Bogura','Naogaon','Chapai Nawabganj','Natore','Sirajganj','Pabna','Joypurhat'],
  Khulna:      ['Khulna','Jessore','Satkhira','Bagerhat','Narail','Magura','Jhenaidah','Chuadanga','Kushtia','Meherpur'],
  Sylhet:      ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
  Barisal:     ['Barisal','Pirojpur','Bhola','Jhalokathi','Patuakhali','Barguna'],
  Rangpur:     ['Rangpur','Dinajpur','Kurigram','Gaibandha','Nilphamari','Panchagarh','Thakurgaon','Lalmonirhat'],
  Mymensingh:  ['Mymensingh','Jamalpur','Netrokona','Sherpur'],
};

const BD_AREAS: Record<string, string[]> = {
  Dhaka:         ['Dhanmondi','Mirpur','Gulshan','Banani','Uttara','Mohammadpur','Rayer Bazar','Badda','Khilgaon','Motijheel','Paltan','Old Dhaka','Demra','Jatrabari','Shyamoli','Lalmatia','Azimpur','Lalbagh','New Market','Kalabagan','Farmgate','Tejgaon','Rampura','Khilkhet','Vatara'],
  Gazipur:       ['Gazipur Sadar','Kaliakoir','Kapasia','Sreepur','Tongi'],
  Narayanganj:   ['Narayanganj Sadar','Araihazar','Bandar','Rupganj','Sonargaon'],
  Chittagong:    ['Agrabad','Anderkilla','Bakolia','Bayazid','Chandgaon','Chawkbazar','Double Mooring','Halishahar','Khulshi','Kotwali','Pahartali','Panchlaish','Patenga','Sholoshahar'],
  "Cox's Bazar": ["Cox's Bazar Sadar",'Chakaria','Maheshkhali','Ukhia','Teknaf','Kutubdia'],
  Comilla:       ['Comilla Sadar','Burichang','Chandina','Chauddagram','Daudkandi','Debidwar','Homna','Laksam','Monohorganj','Muradnagar'],
  Rajshahi:      ['Rajshahi Sadar','Boalia','Motihar','Rajpara','Shah Makhdum'],
  Khulna:        ['Khulna Sadar','Daulatpur','Khalishpur','Khanepur','Sonadanga'],
  Sylhet:        ['Sylhet Sadar','Beanibazar','Companiganj','Golapganj','Gowainghat','Jaintapur','Kanaighat','Osmaninagar'],
  Barisal:       ['Barisal Sadar','Agailjhara','Babuganj','Bakerganj','Banaripara','Gauranadi','Mehendiganj','Muladi','Wazirpur'],
  Rangpur:       ['Rangpur Sadar','Badarganj','Gangachara','Kaunia','Mithapukur','Pirgachha','Pirganj','Taraganj'],
  Mymensingh:    ['Mymensingh Sadar','Bhaluka','Dhobaura','Fulbaria','Gaffargaon','Gauripur','Haluaghat','Ishwarganj','Muktagachha','Nandail','Phulpur','Trishal'],
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface RateGroup {
  id: string;
  store: string;
  name: string;
  base: number;
  additional: number;
}

interface Assignment {
  key: string;
  store: string;
  division: string;
  district: string;
  area: string;
  areaId: string;
  groupId: string;
  groupName?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const makeGroupId = (store: string, name: string) => `${slugify(store)}_${slugify(name)}_${Date.now()}`;
const makeAssignmentKey = (store: string, division: string, district: string, area: string) =>
  `${store}|${division}|${district}|${area}`.replace(/\s+/g, '_');

// ── Component ─────────────────────────────────────────────────────────────────
export default function CheckoutSettings() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'groups' | 'assignments'>('groups');

  // ── Rate Groups state ──────────────────────────────────────────────────────
  const [groups, setGroups] = useState<RateGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsSaving, setGroupsSaving] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', base: '', additional: '' });

  // ── Assignments state ──────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [selDiv, setSelDiv] = useState('');
  const [selDist, setSelDist] = useState('');
  const [selArea, setSelArea] = useState('');
  const [selGroup, setSelGroup] = useState('');

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const { data } = await api.get('/delivery-rates/rate-groups');
      setGroups(data);
    } catch { toast.error('Failed to load rate groups'); }
    finally { setGroupsLoading(false); }
  }, []);

  const loadAssignments = useCallback(async () => {
    setAssignLoading(true);
    try {
      const { data } = await api.get('/delivery-rates/assignments');
      setAssignments(data);
    } catch { toast.error('Failed to load assignments'); }
    finally { setAssignLoading(false); }
  }, []);

  useEffect(() => { loadGroups(); loadAssignments(); }, [loadGroups, loadAssignments]);

  // ── Rate Groups actions ────────────────────────────────────────────────────
  const addGroup = () => {
    const name = newGroup.name.trim();
    if (!name) return toast.error('Group name is required');
    const base = parseFloat(newGroup.base) || 0;
    const additional = parseFloat(newGroup.additional) || 0;
    const id = makeGroupId('main', name);
    setGroups(g => [...g, { id, store: 'main', name, base, additional }]);
    setNewGroup({ name: '', base: '', additional: '' });
  };

  const removeGroup = (id: string) => {
    setGroups(g => g.filter(x => x.id !== id));
  };

  const saveGroups = async () => {
    setGroupsSaving(true);
    try {
      await api.post('/delivery-rates/rate-groups/sync', groups);
      toast.success('Rate groups saved successfully');
      loadGroups();
    } catch { toast.error('Failed to save rate groups'); }
    finally { setGroupsSaving(false); }
  };

  // ── Assignments actions ────────────────────────────────────────────────────
  const addAssignment = () => {
    if (!selDist) return toast.error('Select a district');
    if (!selGroup) return toast.error('Select a rate group');
    const key = makeAssignmentKey('main', selDiv, selDist, selArea);
    if (assignments.find(a => a.key === key)) {
      return toast.error('This area is already assigned');
    }
    const group = groups.find(g => g.id === selGroup);
    setAssignments(a => [...a, {
      key,
      store: 'main',
      division: selDiv,
      district: selDist,
      area: selArea,
      areaId: selArea || selDist,
      groupId: selGroup,
      groupName: group?.name,
    }]);
    setSelArea('');
  };

  const removeAssignment = (key: string) => {
    setAssignments(a => a.filter(x => x.key !== key));
  };

  const saveAssignments = async () => {
    setAssignSaving(true);
    try {
      await api.post('/delivery-rates/assignments/sync', assignments);
      toast.success('Area assignments saved successfully');
      loadAssignments();
    } catch { toast.error('Failed to save assignments'); }
    finally { setAssignSaving(false); }
  };

  // ── Cascading reset ────────────────────────────────────────────────────────
  const handleDivChange = (v: string) => { setSelDiv(v); setSelDist(''); setSelArea(''); };
  const handleDistChange = (v: string) => { setSelDist(v); setSelArea(''); };
  const districts = selDiv ? (BD_DISTRICTS[selDiv] || []) : [];
  const areas = selDist ? (BD_AREAS[selDist] || []) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageCheck className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('checkoutSettings')}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage delivery rates and area assignments for checkout</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['groups', 'assignments'] as const).map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
              tab === tabKey
                ? 'bg-background border border-b-background border-border text-foreground -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tabKey === 'groups' ? 'Delivery Rate Groups' : 'Area Assignments'}
          </button>
        ))}
      </div>

      {/* ── Rate Groups Tab ────────────────────────────────────────────────── */}
      {tab === 'groups' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Add New Rate Group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Group Name *</label>
                <input
                  value={newGroup.name}
                  onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))}
                  placeholder="e.g. Dhaka City, Outside Dhaka"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Base Rate (৳) *</label>
                <input
                  type="number"
                  min="0"
                  value={newGroup.base}
                  onChange={e => setNewGroup(g => ({ ...g, base: e.target.value }))}
                  placeholder="e.g. 60"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Additional / kg (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={newGroup.additional}
                  onChange={e => setNewGroup(g => ({ ...g, additional: e.target.value }))}
                  placeholder="e.g. 20"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
            <button
              onClick={addGroup}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Group
            </button>
          </div>

          {/* Groups table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">{groups.length} Rate Groups</span>
              <div className="flex gap-2">
                <button onClick={loadGroups} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
                <button
                  onClick={saveGroups}
                  disabled={groupsSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> {groupsSaving ? 'Saving…' : 'Save All'}
                </button>
              </div>
            </div>
            {groupsLoading ? (
              <div className="py-12 flex items-center justify-center text-muted-foreground text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading…
              </div>
            ) : groups.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No rate groups yet. Add one above.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Base Rate (৳)</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Additional/kg (৳)</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Example (1kg)</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {groups.map(g => (
                    <tr key={g.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{g.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={g.base}
                          onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, base: parseFloat(e.target.value) || 0 } : x))}
                          className="w-24 border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={g.additional}
                          onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, additional: parseFloat(e.target.value) || 0 } : x))}
                          className="w-24 border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">৳{g.base}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeGroup(g.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Area Assignments Tab ──────────────────────────────────────────── */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Assign Area to Rate Group</h2>
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">First create rate groups in the "Delivery Rate Groups" tab.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Division */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Division</label>
                    <div className="relative">
                      <select
                        value={selDiv}
                        onChange={e => handleDivChange(e.target.value)}
                        className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8"
                      >
                        <option value="">All Divisions</option>
                        {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  {/* District */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">District *</label>
                    <div className="relative">
                      <select
                        value={selDist}
                        onChange={e => handleDistChange(e.target.value)}
                        className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8"
                      >
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  {/* Area (optional) */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Area <span className="text-muted-foreground/60">(optional)</span></label>
                    <div className="relative">
                      <select
                        value={selArea}
                        onChange={e => setSelArea(e.target.value)}
                        disabled={!selDist}
                        className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8 disabled:opacity-50"
                      >
                        <option value="">All Areas in District</option>
                        {areas.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  {/* Rate Group */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Rate Group *</label>
                    <div className="relative">
                      <select
                        value={selGroup}
                        onChange={e => setSelGroup(e.target.value)}
                        className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8"
                      >
                        <option value="">Select Group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name} (৳{g.base})</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                <button
                  onClick={addAssignment}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Assignment
                </button>
              </>
            )}
          </div>

          {/* Assignments table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">{assignments.length} Assignments</span>
              <div className="flex gap-2">
                <button onClick={loadAssignments} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
                <button
                  onClick={saveAssignments}
                  disabled={assignSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> {assignSaving ? 'Saving…' : 'Save All'}
                </button>
              </div>
            </div>
            {assignLoading ? (
              <div className="py-12 flex items-center justify-center text-muted-foreground text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading…
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No area assignments yet. Add one above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-xs font-medium text-muted-foreground">Division</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">District</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Area</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Rate Group</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {assignments.map(a => (
                      <tr key={a.key} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-2.5 text-foreground">{a.division || '—'}</td>
                        <td className="px-4 py-2.5 text-foreground">{a.district}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{a.area || <span className="italic text-xs">All areas</span>}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {a.groupName || a.groupId}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => removeAssignment(a.key)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
