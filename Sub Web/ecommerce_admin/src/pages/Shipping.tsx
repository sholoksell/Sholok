import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  LayoutDashboard, MapPin, Activity, Truck, DollarSign, Database,
  Plus, Pencil, Trash2, Search, ChevronDown, Download, Upload,
  X, Check, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, ArrowRight,
  Shield, FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── BD Location Data ───────────────────────────────────────────────────────────
const BD_DIVISIONS = ['Dhaka','Chattogram','Rajshahi','Khulna','Barishal','Sylhet','Rangpur','Mymensingh'];
const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka:      ['Dhaka','Faridpur','Gazipur','Gopalganj','Kishoreganj','Madaripur','Manikganj','Munshiganj','Narayanganj','Narsingdi','Rajbari','Shariatpur','Tangail'],
  Chattogram: ['Bandarban','Brahmanbaria','Chandpur','Chattogram',"Cox's Bazar",'Cumilla','Feni','Khagrachhari','Lakshmipur','Noakhali','Rangamati'],
  Rajshahi:   ['Bogra','Chapainawabganj','Joypurhat','Naogaon','Natore','Pabna','Rajshahi','Sirajganj'],
  Khulna:     ['Bagerhat','Chuadanga','Jashore','Jhenaidah','Khulna','Kushtia','Magura','Meherpur','Narail','Satkhira'],
  Barishal:   ['Barguna','Barishal','Bhola','Jhalokathi','Patuakhali','Pirojpur'],
  Sylhet:     ['Habiganj','Moulvibazar','Sunamganj','Sylhet'],
  Rangpur:    ['Dinajpur','Gaibandha','Kurigram','Lalmonirhat','Nilphamari','Panchagarh','Rangpur','Thakurgaon'],
  Mymensingh: ['Jamalpur','Mymensingh','Netrokona','Sherpur'],
};
const BD_AREAS: Record<string, string[]> = {
  Dhaka: ['Adabor','Agargaon','Ashkona','Azimpur','Badda (Middle Badda)','Badda (North Badda)','Badda (South Badda)','Bailey Road','Banani (Block A)','Banani (Block B to K)','Banani DOHS','Banga Bazar','Bangabandhu Avenue','Bangshal','Baridhara DOHS','Baridhara J-Block','Basabo','Bashundhara R/A (Block A-C)','Bashundhara R/A (Block D-I)','Bashundhara R/A (Block J-N)','Begum Bazar','Bijoynagar','Cantonment','Chawkbazar','Dakshinkhan','Darussalam','Demra','Dhamrai','Dhanmondi (Road 1 to 15)','Dhanmondi (Road 16 to 32)','Dohar','Elephant Road','Farmgate','Gabtoli','Gendaria','Gulshan 1','Gulshan 2','Gulistan','Hazaribagh','Ibrahimpur (Kafrul)','Jatrabari','Kafrul','Kalabagan','Kallayanpur','Kamalapur','Kawla','Keraniganj (Abdullahpur)','Keraniganj (Hasnabad)','Keraniganj (Jinjira)','Keraniganj (Rohitpur)','Khilgaon (Block A-C)','Khilkhet','Lalbagh','Lalmatia','Malibagh','Maniknagar','Matuail','Mirpur 1','Mirpur 2','Mirpur 6','Mirpur 7','Mirpur 10','Mirpur 11','Mirpur 12','Mirpur 13','Mirpur 14','Mirpur DOHS','Moghbazar','Mohammadpur (Asad Avenue)','Mohammadpur (Housing)','Motijheel','Mugda','Naya Paltan','New Market','Niketon','Nikunja 1','Nikunja 2','Pallabi','Panthapath','Purana Paltan','Rampura','Rupnagar (Mirpur)','Sabujbagh','Sadarghat','Sector 1 (Uttara)','Sector 3 (Uttara)','Sector 4 (Uttara)','Sector 5 (Uttara)','Sector 6 (Uttara)','Sector 7 (Uttara)','Sector 9 (Uttara)','Sector 10 (Uttara)','Sector 11 (Uttara)','Sector 12 (Uttara)','Sector 13 (Uttara)','Sector 14 (Uttara)','Shahbagh','Shantinagar','Shewrapara (East)','Shewrapara (West)','Tejgaon Industrial Area','Tejkunipara','Uttara Model Town','Uttarkhan','Wari','Ashulia','DEPZ (Savar)','Savar Sadar'],
  Faridpur: ['Alfadanga','Bhanga','Boalmari','Charbhadrasan','Faridpur Sadar','Madhukhali','Nagarkanda','Sadarpur','Saltha'],
  Gazipur: ['Board Bazar','Chandra','Chowrasta','Gazipur Sadar','Kaliakair','Kaliganj','Kapasia','Konabari','Mawna','Pubail','Safipur','Sreepur','Tongi (East)','Tongi (West)'],
  Gopalganj: ['Gopalganj Sadar','Kashiani','Kotalipara','Muksudpur','Tungipara'],
  Kishoreganj: ['Austagram','Bajitpur','Bhairab','Hossainpur','Itna','Karimganj','Katiadi','Kishoreganj Sadar','Kuliarchar','Mithamain','Nikli','Pakundia','Tarail'],
  Madaripur: ['Kalkini','Madaripur Sadar','Rajoir','Shibchar'],
  Manikganj: ['Daulatpur','Ghior','Harirampur','Manikganj Sadar','Saturia','Shibalaya','Singair'],
  Munshiganj: ['Gajaria','Louhajang','Mawa','Munshiganj Sadar','Sirajdikhan','Sreenagar','Tongibari'],
  Narayanganj: ['Araihazar','Bandar','Fatullah','Kanchpur','Narayanganj Sadar','Purbachal','Rupganj','Shiddhirganj','Sonargaon'],
  Narsingdi: ['Belabo','Ghorashal','Madhabdi','Monohardi','Narsingdi Sadar','Palash','Raipura','Shibpur'],
  Rajbari: ['Baliakandi','Goalanda','Kalukhali','Pangsha','Rajbari Sadar'],
  Shariatpur: ['Bhedarganj','Damudya','Gosairhat','Naria','Shariatpur Sadar','Zanjira'],
  Tangail: ['Basail','Bhuapur','Delduar','Dhanbari','Elenga','Ghatail','Gopalpur','Kalihati','Madhupur','Mirzapur','Nagarpur','Sakhipur','Tangail Sadar'],
  Bandarban: ['Alikadam','Bandarban Sadar','Lama'],
  Brahmanbaria: ['Akhaura','Ashuganj','Bancharampur','Brahmanbaria Sadar','Kasba','Nabinagar','Nasirnagar','Sarail'],
  Chandpur: ['Chandpur Sadar','Faridganj','Haimchar','Hajiganj','Kachua','Matlab North','Matlab South','Shahrasti'],
  Chattogram: ['Agrabad','Akbar Shah','Anwara','Baizid Bostami','Bakalia','Bandar','Banshkhali','Boalkhali','Chandanaish','Chandgaon','Chawkbazar','Dohazari','Double Mooring','EPZ','GEC Circle','Halishahar','Hathazari','Khulshi','Kotwali','Kumira','Lalkhan Bazar','Lohagara','Mirsharai','Nasirabad','Pahartali','Panchlaish','Patenga','Patiya','Rangunia','Raozan','Sandwip','Satkania','Sitakunda'],
  Cumilla: ['Barura','Brahmanpara','Burichang','Chandina','Chauddagram','Cumilla Sadar','Daudkandi','Debidwar','Homna','Kandirpar','Laksam','Meghna','Muradnagar','Nangalkot','Titas'],
  "Cox's Bazar": ['Chakaria',"Cox's Bazar Sadar",'Kolatoli','Kutubdia','Maheshkhali','Pekua','Ramu','Teknaf','Ukhia'],
  Feni: ['Chhagalnaiya','Daganbhuiyan','Feni Sadar','Fulgazi','Parshuram','Sonagazi'],
  Khagrachhari: ['Khagrachhari Sadar','Matiranga','Ramgarh'],
  Lakshmipur: ['Kamalnagar','Lakshmipur Sadar','Raipur','Ramganj','Ramgati'],
  Noakhali: ['Begumganj (Chowmuhani)','Bosurhat','Chatkhil','Companiganj','Hatiya','Kabirhat','Maijdee (Noakhali Sadar)','Senbagh','Sonaimuri','Subarnachar'],
  Rangamati: ['Kaptai','Kaukhali','Rangamati Sadar'],
  Bogra: ['Adamdighi','Bogra Sadar','Dhunat','Dupchanchia','Gabtali','Kahaloo','Nandigram','Santahar','Sariakandi','Shajahanpur','Sherpur','Shibganj','Sonatala'],
  Chapainawabganj: ['Bholahat','Chapainawabganj Sadar','Gomastapur','Kansat','Nachole','Shibganj'],
  Joypurhat: ['Akkelpur','Joypurhat Sadar','Kalai','Khetlal','Panchbibi'],
  Naogaon: ['Atrai','Badalgachhi','Dhamoirhat','Mahadevpur','Manda','Naogaon Sadar','Niamatpur','Patnitala','Porsha','Raninagar','Sapahar'],
  Natore: ['Bagatipara','Baraigram','Bonpara','Gurudaspur','Lalpur','Naldanga','Natore Sadar','Singra'],
  Pabna: ['Atgharia','Bera','Bhangoora','Chatmohar','Faridpur (Pabna)','Ishwardi','Pabna Sadar','Santhia','Sujanagar'],
  Rajshahi: ['Bagha','Bagmara','Charghat','Durgapur','Godagari','Kazla','Mohanpur','Paba','Puthia','Rajshahi City Center','Saheb Bazar','Tanore'],
  Sirajganj: ['Belkuchi','Chouhali','Enayetpur','Kamarkhanda','Kazipur','Raiganj','Shahjadpur','Sirajganj Sadar','Tarash','Ullahpara'],
  Bagerhat: ['Bagerhat Sadar','Chitalmari','Fakirhat','Kachua (Bagerhat)','Mollahat','Mongla','Morrelganj','Rampal','Sharankhola'],
  Chuadanga: ['Alamdanga','Chuadanga Sadar','Damurhuda','Darshana','Jibannagar'],
  Jashore: ['Abhaynagar (Nawapara)','Bagherpara','Benapole','Chaugachha','Jashore Sadar','Jhikargachha','Keshabpur','Manirampur','Sharsha'],
  Jhenaidah: ['Harinakunda','Jhenaidah Sadar','Kaliganj (Jhenaidah)','Kotchandpur','Maheshpur','Shailkupa'],
  Khulna: ['Batiaghata','Boyra','Chalna','Dacope','Daulatpur (Khulna)','Dighalia','Dumuria','Khalishpur','Khulna City Center','Koyra','Paikgachha','Phultala','Rupsha'],
  Kushtia: ['Bheramara','Daulatpur (Kushtia)','Khoksa','Kumarkhali','Kushtia Sadar','Mirpur (Kushtia)'],
  Magura: ['Magura Sadar','Mohammadpur (Magura)','Shalikha','Sreepur (Magura)'],
  Meherpur: ['Gangni','Meherpur Sadar','Mujibnagar'],
  Narail: ['Kalia','Lohagara (Narail)','Narail Sadar'],
  Satkhira: ['Assasuni','Debhata','Kalaroa','Kaliganj (Satkhira)','Satkhira Sadar','Shyamnagar','Tala'],
  Barguna: ['Amtali','Bamna','Barguna Sadar','Betagi','Patharghata','Taltali'],
  Barishal: ['Agailjhara','Babuganj','Bakerganj','Banaripara','Barishal City Center','Gournadi','Hijla','Mehendiganj','Muladi','Uzirpur'],
  Bhola: ['Baborhanuddin','Bhola Sadar','Char Fasson','Daulatkhan','Lalmohan','Manpura','Tazumuddin'],
  Jhalokathi: ['Jhalokathi Sadar','Kathalia','Nalchity','Rajapur'],
  Patuakhali: ['Bauphal','Dashmina','Dumki','Galachipa','Kalapara (Kuakata)','Mirzaganj','Patuakhali Sadar','Rangabali'],
  Pirojpur: ['Bhandaria','Kawkhali','Mathbaria','Nazirpur','Nesarabad (Swarupkathi)','Pirojpur Sadar','Zianagar'],
  Habiganj: ['Ajmiriganj','Bahubal','Baniyachong','Chunarughat','Habiganj Sadar','Lakhai','Madhabpur','Nabiganj','Shayestaganj'],
  Moulvibazar: ['Barlekha','Juri','Kamalganj','Kulaura','Moulvibazar Sadar','Rajnagar','Sreemangal'],
  Sunamganj: ['Chhatak','Dharmapasha','Dowarabazar','Jagannathpur','Jamalganj','South Sunamganj','Sunamganj Sadar','Tahirpur'],
  Sylhet: ['Balaganj','Beani Bazar','Bishwanath','Chowhatta','Companiganj (Sylhet)','Fenchuganj','Golapganj','Gowainghat','Jaintiapur','Kanaighat','Osmani Nagar','South Surma','Sylhet City Center','Zakiganj'],
  Dinajpur: ['Biral','Birampur','Birganj','Bochaganj','Chirirbandar','Dinajpur Sadar','Ghoraghat','Hakimpur (Hili)','Kaharole','Khansama','Nawabganj (Dinajpur)','Parbatipur','Phulbari (Dinajpur)'],
  Gaibandha: ['Fulchhari','Gaibandha Sadar','Gobindaganj','Palashbari','Sadullapur','Saghata','Sundarganj'],
  Kurigram: ['Bhurungamari','Char Rajibpur','Chilmari','Kurigram Sadar','Nageshwari','Phulbari (Kurigram)','Rajarhat','Roumari','Ulipur'],
  Lalmonirhat: ['Aditmari','Burimari','Hatibandha','Kaliganj (Lalmonirhat)','Lalmonirhat Sadar','Patgram'],
  Nilphamari: ['Dimla','Domar','Jaldhaka','Kishoreganj (Nilphamari)','Nilphamari Sadar','Saidpur'],
  Panchagarh: ['Atwari','Banglabandha','Boda','Debiganj','Panchagarh Sadar','Tetulia'],
  Rangpur: ['Badarganj','Gangachhara','Kaunia','Mithapukur','Pirgachha','Pirganj (Rangpur)','Rangpur City Center','Taraganj'],
  Thakurgaon: ['Baliadangi','Haripur','Pirganj (Thakurgaon)','Ranisankail','Thakurgaon Sadar'],
  Jamalpur: ['Baksiganj','Dewanganj','Islampur','Jamalpur Sadar','Madarganj','Melandohn','Sarishabari'],
  Mymensingh: ['Bhaluka','Dhobaura','Fulbaria','Gafargaon','Gauripur','Haluaghat','Ishwarganj','Muktagachha','Mymensingh Sadar','Nandail','Phulpur','Trishal'],
  Netrokona: ['Atpara','Barhatta','Durgapur (Netrokona)','Kalmakanda','Kendua','Khaliajuri','Madan','Mohanganj','Netrokona Sadar','Purbadhala'],
  Sherpur: ['Jhenaigati','Nakla','Nalitabari','Sherpur Sadar','Sreebardi'],
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Section = 'dashboard' | 'areas' | 'groups' | 'assign' | 'rates' | 'backup';

interface RateGroup {
  id: string;
  store?: string;
  name: string;
  base: number;
  additional: number;
  weightSlabs?: string;
}

interface Assignment {
  key: string;
  store?: string;
  areaId?: string;
  division: string;
  district: string;
  area: string;
  groupId: string;
  groupName?: string;
  baseOverride?: number | null;
  additionalOverride?: number | null;
  weightSlabsOverride?: string | null;
}

interface AreaStatus {
  key: string;
  status: 'Enable' | 'Disable';
}

interface CustomArea {
  key: string;
  division: string;
  district: string;
  area: string;
}

interface AreaEntry {
  division: string;
  district: string;
  area: string;
  key: string;
  isCustom: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_RATE_GROUPS = 17;
const VALID_SECTIONS: Section[] = ['dashboard','areas','groups','assign','rates','backup'];
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   Icon: LayoutDashboard },
  { id: 'areas',     label: 'Delivery Areas', Icon: MapPin },
  { id: 'groups',    label: 'Rate Groups',    Icon: Activity },
  { id: 'assign',    label: 'Area Assignment',Icon: Truck },
  { id: 'rates',     label: 'Zone Rates',     Icon: DollarSign },
  { id: 'backup',    label: 'Data Backup',    Icon: Database },
];

// Design tokens
const C = {
  primary:    '#5d0096',
  sidebar:    '#24152b',
  sidebarFg:  '#f7f2f9',
  sidebarMuted:'#cdc0d4',
  sidebarActive:'#392246',
  primaryLight:'#d9b2f0',
  bg:         '#faf9fb',
  card:       '#ffffff',
  border:     '#ded9e2',
  muted:      '#f3f1f4',
  mutedFg:    '#635d66',
  fg:         '#201d23',
  secondary:  '#f2eaf6',
  secondaryFg:'#4a1765',
  success:    '#5d0096',
  orange:     '#a5211c',
  orangeSoft: '#fce8e4',
  destructive:'#d31710',
  softBorder: 'rgba(255,255,255,0.09)',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function createId() { return Math.random().toString(36).slice(2, 10); }

function areaKey(div: string, dist: string, area: string) {
  return `${div}|${dist}|${area}`;
}

function allAreaEntries(customAreas: CustomArea[]): AreaEntry[] {
  const entries: AreaEntry[] = [];
  for (const div of BD_DIVISIONS) {
    const districts = BD_DISTRICTS[div] || [];
    for (const dist of districts) {
      const areas = BD_AREAS[dist] || [];
      for (const area of areas) {
        entries.push({ division: div, district: dist, area, key: areaKey(div, dist, area), isCustom: false });
      }
    }
  }
  for (const ca of customAreas) {
    entries.push({ division: ca.division, district: ca.district, area: ca.area, key: ca.key, isCustom: true });
  }
  return entries;
}

function statusFor(statuses: AreaStatus[], key: string): 'Enable' | 'Disable' {
  const found = statuses.find(s => s.key === key);
  return found ? found.status : 'Enable';
}

interface WeightSlab { upTo: number; charge: number; }
function parseSlabs(str?: string): WeightSlab[] {
  if (!str) return [];
  return str.split(',').map(s => {
    const [w, c] = s.split(':');
    return { upTo: parseFloat(w), charge: parseFloat(c) };
  }).filter(s => !isNaN(s.upTo) && !isNaN(s.charge));
}

function slabText(slabs: WeightSlab[]) {
  if (!slabs.length) return '';
  return slabs.map(s => `${s.upTo}kg→৳${s.charge}`).join(', ');
}

function rateForWeight(group: RateGroup, weightKg: number): number {
  const slabs = parseSlabs(group.weightSlabs);
  if (slabs.length) {
    const slab = slabs.find(s => weightKg <= s.upTo);
    if (slab) return slab.charge;
    return group.base + Math.max(0, weightKg - 1) * group.additional;
  }
  return group.base + Math.max(0, weightKg - 1) * group.additional;
}

function downloadText(content: string, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  a.download = filename;
  a.click();
}

function downloadCsv(rows: string[][], filename: string) {
  const content = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Shipping() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSec = searchParams.get('s') as Section;
  const section: Section = VALID_SECTIONS.includes(rawSec) ? rawSec : 'dashboard';
  const setSection = (s: Section) => setSearchParams({ s }, { replace: false });

  const [groups, setGroups] = useState<RateGroup[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [statuses, setStatuses] = useState<AreaStatus[]>([]);
  const [customAreas, setCustomAreas] = useState<CustomArea[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [areaModal, setAreaModal] = useState<{ mode: 'add' | 'edit'; area?: CustomArea } | null>(null);
  const [groupModal, setGroupModal] = useState<{ mode: 'add' | 'edit'; group?: RateGroup } | null>(null);
  const [overrideModal, setOverrideModal] = useState<Assignment | null>(null);
  const [switchGroupModal, setSwitchGroupModal] = useState<{ assignment: Assignment } | null>(null);

  const syncGRef = useRef<ReturnType<typeof setTimeout>>();
  const syncARef = useRef<ReturnType<typeof setTimeout>>();
  const syncSRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    (async () => {
      try {
        const [gRes, aRes, oRes] = await Promise.all([
          api.get('/delivery-rates/rate-groups'),
          api.get('/delivery-rates/assignments'),
          api.get('/delivery-rates/area-overrides'),
        ]);
        setGroups(Array.isArray(gRes.data) ? gRes.data : []);
        setAssignments(Array.isArray(aRes.data) ? aRes.data : []);
        const overrides: Array<{ key: string; division?: string; district?: string; area?: string; status: string; isCustom: boolean }> = Array.isArray(oRes.data) ? oRes.data : [];
        setStatuses(overrides.filter(r => !r.isCustom && r.status === 'Disable').map(r => ({ key: r.key, status: 'Disable' as const })));
        setCustomAreas(overrides.filter(r => r.isCustom).map(r => ({ key: r.key, division: r.division || '', district: r.district || '', area: r.area || '' })));
      } catch {
        toast.error('Failed to load delivery data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const syncGroups = useCallback((data: RateGroup[]) => {
    clearTimeout(syncGRef.current);
    syncGRef.current = setTimeout(() => {
      const payload = data.map(g => ({ ...g, store: g.store || 'Default' }));
      api.post('/delivery-rates/rate-groups/sync', payload).catch(() => toast.error('Failed to save rate groups'));
    }, 1000);
  }, []);

  const syncAssignments = useCallback((data: Assignment[]) => {
    clearTimeout(syncARef.current);
    syncARef.current = setTimeout(() => {
      api.post('/delivery-rates/assignments/sync', data).catch(() => toast.error('Failed to save assignments'));
    }, 1000);
  }, []);

  const syncStatuses = useCallback((data: AreaStatus[]) => {
    clearTimeout(syncSRef.current);
    syncSRef.current = setTimeout(() => {
      const statusMap: Record<string, string> = {};
      data.forEach(s => { statusMap[s.key] = s.status; });
      api.post('/delivery-rates/area-statuses/sync', statusMap).catch(() => toast.error('Failed to save area statuses'));
    }, 1000);
  }, []);

  const updateGroups = (next: RateGroup[]) => { setGroups(next); syncGroups(next); };
  const updateAssignments = (next: Assignment[]) => { setAssignments(next); syncAssignments(next); };
  const updateStatuses = (next: AreaStatus[]) => { setStatuses(next); syncStatuses(next); };

  const allEntries = useMemo(() => allAreaEntries(customAreas), [customAreas]);
  const totalAreas = allEntries.length;
  const assignedCount = assignments.length;
  const enabledCount = allEntries.filter(e => statusFor(statuses, e.key) === 'Enable').length;

  if (loading) {
    return (
      <div style={{ margin: '-24px', display: 'flex', minHeight: '100vh' }}>
        <nav style={{ position: 'fixed', left: 256, top: 0, bottom: 0, width: 192, background: C.sidebar, zIndex: 50 }} />
        <main style={{ marginLeft: 192, flex: 1, background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: C.mutedFg, display: 'flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Loading delivery data…
          </div>
        </main>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ margin: '-24px', display: 'flex', minHeight: '100vh' }}>
      {/* Secondary sidebar */}
      <nav style={{ position: 'fixed', left: 256, top: 0, bottom: 0, width: 192, background: C.sidebar, zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${C.softBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={18} color={C.primaryLight} />
          <span style={{ color: C.sidebarFg, fontWeight: 600, fontSize: 13 }}>Delivery Mgmt</span>
        </div>
        <div style={{ flex: 1, padding: '8px 0' }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id as Section)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: active ? C.sidebarActive : 'transparent', color: active ? C.sidebarFg : C.sidebarMuted, border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontWeight: active ? 600 : 400, transition: 'all .15s', borderLeft: active ? `3px solid ${C.primary}` : '3px solid transparent' }}>
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main style={{ marginLeft: 192, flex: 1, background: C.bg, minHeight: '100vh', padding: 0 }}>
        {section === 'dashboard' && (
          <DashboardSection
            totalAreas={totalAreas} assignedCount={assignedCount}
            groupCount={groups.length} enabledCount={enabledCount}
            disabledCount={totalAreas - enabledCount}
            setSection={setSection}
          />
        )}
        {section === 'areas' && (
          <AreasSection
            allEntries={allEntries} statuses={statuses} customAreas={customAreas}
            assignments={assignments}
            updateStatuses={updateStatuses}
            onAddCustom={() => setAreaModal({ mode: 'add' })}
            onEditCustom={(ca) => setAreaModal({ mode: 'edit', area: ca })}
            onDeleteCustom={async (key) => {
              try {
                await api.delete(`/delivery-rates/area-overrides/custom/${encodeURIComponent(key)}`);
                setCustomAreas(prev => prev.filter(a => a.key !== key));
                toast.success('Custom area removed');
              } catch { toast.error('Failed to remove custom area'); }
            }}
          />
        )}
        {section === 'groups' && (
          <GroupsSection
            groups={groups} updateGroups={updateGroups}
            onAdd={() => setGroupModal({ mode: 'add' })}
            onEdit={(g) => setGroupModal({ mode: 'edit', group: g })}
            onDelete={(id) => {
              const next = groups.filter(g => g.id !== id);
              updateGroups(next);
              toast.success('Rate group deleted');
            }}
          />
        )}
        {section === 'assign' && (
          <AssignSection
            allEntries={allEntries} groups={groups} assignments={assignments}
            statuses={statuses} updateAssignments={updateAssignments}
            onSwitchGroup={(a) => setSwitchGroupModal({ assignment: a })}
          />
        )}
        {section === 'rates' && (
          <RatesSection
            assignments={assignments} groups={groups}
            onOverride={(a) => setOverrideModal(a)}
            onRemoveOverride={async (key) => {
              try {
                await api.delete(`/delivery-rates/assignments/rate-override/${encodeURIComponent(key)}`);
                setAssignments(prev => prev.map(a => a.key === key ? { ...a, baseOverride: null, additionalOverride: null, weightSlabsOverride: null } : a));
                toast.success('Override removed');
              } catch { toast.error('Failed to remove override'); }
            }}
          />
        )}
        {section === 'backup' && (
          <BackupSection
            groups={groups} assignments={assignments}
            statuses={statuses} customAreas={customAreas}
            onImport={(data) => {
              if (data.groups) updateGroups(data.groups);
              if (data.assignments) updateAssignments(data.assignments);
              if (data.statuses) updateStatuses(data.statuses);
              if (data.customAreas) setCustomAreas(data.customAreas);
              toast.success('Data imported successfully');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {areaModal && (
        <AreaModal
          mode={areaModal.mode}
          initial={areaModal.area}
          onClose={() => setAreaModal(null)}
          onSave={async (div, dist, area) => {
            const key = areaKey(div, dist, area);
            const oldKey = areaModal.area?.key;
            if (areaModal.mode === 'edit' && oldKey) {
              // delete old + add new
              try {
                await api.delete(`/delivery-rates/area-overrides/custom/${encodeURIComponent(oldKey)}`);
                await api.post('/delivery-rates/area-overrides/custom', { key, division: div, district: dist, area });
                setCustomAreas(prev => prev.map(a => a.key === oldKey ? { key, division: div, district: dist, area } : a));
                setAreaModal(null);
                toast.success('Custom area updated');
              } catch { toast.error('Failed to update area'); }
            } else {
              if (customAreas.some(a => a.key === key)) { toast.error('Area already exists'); return; }
              try {
                await api.post('/delivery-rates/area-overrides/custom', { key, division: div, district: dist, area });
                setCustomAreas(prev => [...prev, { key, division: div, district: dist, area }]);
                setAreaModal(null);
                toast.success('Custom area added');
              } catch { toast.error('Failed to add custom area'); }
            }
          }}
        />
      )}
      {groupModal && (
        <GroupModal
          mode={groupModal.mode}
          initial={groupModal.group}
          onClose={() => setGroupModal(null)}
          onSave={(g) => {
            if (groupModal.mode === 'add') {
              if (groups.length >= MAX_RATE_GROUPS) { toast.error(`Max ${MAX_RATE_GROUPS} rate groups allowed`); return; }
              const newGroup: RateGroup = { ...g, id: createId() };
              updateGroups([...groups, newGroup]);
            } else {
              updateGroups(groups.map(x => x.id === g.id ? g : x));
            }
            setGroupModal(null);
            toast.success(groupModal.mode === 'add' ? 'Rate group created' : 'Rate group updated');
          }}
        />
      )}
      {overrideModal && (
        <OverrideModal
          assignment={overrideModal}
          groups={groups}
          onClose={() => setOverrideModal(null)}
          onSave={async (data) => {
            try {
              await api.put('/delivery-rates/assignments/rate-override', data);
              setAssignments(prev => prev.map(a => a.key === data.key ? { ...a, baseOverride: data.base, additionalOverride: data.additional, weightSlabsOverride: data.slabs || null } : a));
              setOverrideModal(null);
              toast.success('Rate override saved');
            } catch { toast.error('Failed to save override'); }
          }}
        />
      )}
      {switchGroupModal && (
        <SwitchGroupModal
          assignment={switchGroupModal.assignment}
          groups={groups}
          onClose={() => setSwitchGroupModal(null)}
          onSave={(newGroupId) => {
            const grp = groups.find(g => g.id === newGroupId);
            updateAssignments(assignments.map(a => a.key === switchGroupModal.assignment.key ? { ...a, groupId: newGroupId, groupName: grp?.name } : a));
            setSwitchGroupModal(null);
            toast.success('Group switched');
          }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dm-btn-primary { background: ${C.primary}; color: #fff; border: none; border-radius: 6px; padding: 7px 14px; font-size: 13px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .dm-btn-primary:hover { background: #4a0079; }
        .dm-btn-outline { background: transparent; color: ${C.fg}; border: 1px solid ${C.border}; border-radius: 6px; padding: 7px 14px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .dm-btn-outline:hover { background: ${C.muted}; }
        .dm-btn-ghost { background: transparent; color: ${C.mutedFg}; border: none; border-radius: 6px; padding: 6px 10px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
        .dm-btn-ghost:hover { background: ${C.muted}; color: ${C.fg}; }
        .dm-btn-danger { background: transparent; color: ${C.destructive}; border: 1px solid ${C.destructive}22; border-radius: 6px; padding: 6px 10px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
        .dm-btn-danger:hover { background: ${C.destructive}11; }
        .dm-input { border: 1px solid ${C.border}; border-radius: 6px; padding: 7px 11px; font-size: 13px; color: ${C.fg}; background: #fff; outline: none; width: 100%; }
        .dm-input:focus { border-color: ${C.primary}; box-shadow: 0 0 0 2px ${C.primary}22; }
        .dm-label { font-size: 12px; font-weight: 500; color: ${C.fg}; margin-bottom: 5px; display: block; }
        .dm-card { background: #fff; border: 1px solid ${C.border}; border-radius: 10px; }
        .dm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .dm-table th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: ${C.mutedFg}; border-bottom: 1px solid ${C.border}; background: ${C.muted}; }
        .dm-table td { padding: 10px 14px; border-bottom: 1px solid ${C.border}22; color: ${C.fg}; vertical-align: middle; }
        .dm-table tr:last-child td { border-bottom: none; }
        .dm-table tr:hover td { background: ${C.secondary}44; }
        .dm-badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; }
        .dm-badge-purple { background: ${C.secondary}; color: ${C.secondaryFg}; }
        .dm-badge-green { background: #e6f9ed; color: #0a6128; }
        .dm-badge-red { background: #fdeced; color: ${C.destructive}; }
        .dm-badge-gray { background: ${C.muted}; color: ${C.mutedFg}; }
        .dm-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .dm-modal { background: #fff; border-radius: 12px; padding: 24px; min-width: 360px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
        .dm-modal-title { font-size: 16px; font-weight: 600; color: ${C.fg}; margin-bottom: 20px; }
        .dm-section-header { padding: 24px 28px 20px; border-bottom: 1px solid ${C.border}; }
        .dm-section-title { font-size: 20px; font-weight: 700; color: ${C.fg}; }
        .dm-section-desc { font-size: 13px; color: ${C.mutedFg}; margin-top: 2px; }
        .dm-welcome { background: linear-gradient(135deg, ${C.primary} 0%, #8b00cc 100%); border-radius: 12px; padding: 24px 28px; color: #fff; margin: 24px 28px 0; }
        .dm-metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 20px 28px; }
        .dm-metric-card { background: #fff; border: 1px solid ${C.border}; border-radius: 10px; padding: 18px; }
        .dm-metric-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: ${C.mutedFg}; }
        .dm-metric-value { font-size: 28px; font-weight: 700; color: ${C.fg}; margin: 4px 0 2px; line-height: 1; }
        .dm-metric-sub { font-size: 12px; color: ${C.mutedFg}; }
        @media (max-width: 900px) { .dm-metric-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </div>
  );
}

// ── Dashboard Section ──────────────────────────────────────────────────────────
function MetricCard({ iconEl, label, value, sub }: { iconEl: React.ReactNode; label: string; value: string | number; sub: string }) {
  return (
    <div className="dm-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {iconEl}
      </div>
      <div>
        <div style={{ fontSize: 11, color: C.mutedFg, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.fg, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

function DashboardSection({ totalAreas, assignedCount, groupCount, enabledCount, disabledCount, setSection }: {
  totalAreas: number; assignedCount: number; groupCount: number; enabledCount: number; disabledCount: number;
  setSection: (s: Section) => void;
}) {
  const divisionCounts = useMemo(() => BD_DIVISIONS.map((div, i) => ({
    name: div,
    num: i + 1,
    count: (BD_DISTRICTS[div] || []).reduce((s, d) => s + (BD_AREAS[d] || []).length, 0),
  })), []);
  const maxCount = Math.max(...divisionCounts.map(d => d.count), 1);
  const unassignedCount = totalAreas - assignedCount;
  const coveragePct = totalAreas > 0 ? (assignedCount / totalAreas) * 100 : 0;
  const totalDistricts = Object.values(BD_DISTRICTS).reduce((s, arr) => s + arr.length, 0);

  return (
    <div>
      {/* Dark header banner */}
      <div style={{ background: C.sidebar, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ color: C.sidebarMuted, fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, marginBottom: 10 }}>
            DELIVERY OPERATIONS · BANGLADESH
          </div>
          <div style={{ color: C.sidebarFg, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Good day. Let's keep every route moving.
          </div>
          <div style={{ color: C.sidebarMuted, fontSize: 13 }}>
            Your area coverage and pricing controls, all in one place.
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '14px 22px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ color: C.sidebarMuted, fontSize: 10, letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>DATASET VERIFIED</div>
          <div style={{ color: C.sidebarFg, fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>08 / {totalDistricts} / {totalAreas}</div>
          <div style={{ color: C.sidebarMuted, fontSize: 11, marginTop: 2 }}>Divisions · districts · areas</div>
        </div>
      </div>

      {/* 4 Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '20px 24px 16px' }}>
        <MetricCard iconEl={<MapPin size={16} color={C.primary} />} label="Divisions" value="08" sub="Bangladesh regions" />
        <MetricCard iconEl={<LayoutDashboard size={16} color={C.primary} />} label="Districts" value={totalDistricts} sub="0 custom" />
        <MetricCard iconEl={<Truck size={16} color={C.primary} />} label="Delivery areas" value={totalAreas} sub={`${enabledCount} enabled`} />
        <MetricCard iconEl={<Activity size={16} color={C.primary} />} label="Rate groups" value={groupCount} sub={`of ${MAX_RATE_GROUPS} available`} />
      </div>

      {/* Network Health + Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14, padding: '0 24px 16px' }}>
        {/* Network Health */}
        <div className="dm-card" style={{ padding: 24 }}>
          <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10 }}>NETWORK HEALTH</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.fg }}>Assignment coverage</div>
              <div style={{ fontSize: 12, color: C.mutedFg, marginTop: 3 }}>Delivery areas with at least one active rate group.</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: C.primary }}>{coveragePct.toFixed(1)}%</span>
              <div style={{ fontSize: 11, color: C.mutedFg }}>covered</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background: C.muted, borderRadius: 999, height: 6, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ width: `${coveragePct}%`, background: C.primary, height: '100%', borderRadius: 999, transition: 'width .4s ease' }} />
          </div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Assigned',   value: assignedCount,   dot: C.primary },
              { label: 'Unassigned', value: unassignedCount, dot: C.destructive },
              { label: 'Enabled',    value: enabledCount,    dot: '#0a6128' },
              { label: 'Disabled',   value: disabledCount,   dot: C.mutedFg },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px', background: C.muted, borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
                  <span style={{ fontSize: 11, color: C.mutedFg }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C.fg }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* View unassigned button */}
          <button onClick={() => setSection('assign')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: 'transparent', color: C.fg, fontSize: 13, cursor: 'pointer' }}>
            <span>View unassigned areas</span>
            <ChevronRight size={15} color={C.mutedFg} />
          </button>
        </div>

        {/* Quick Access */}
        <div className="dm-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>QUICK ACCESS</div>
            <Activity size={14} color={C.mutedFg} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.fg, marginBottom: 14 }}>Work faster</div>
          {[
            { title: 'Manage delivery areas',  desc: 'Update zones and availability',    Icon: MapPin,   s: 'areas'  as Section },
            { title: 'Set up rate groups',      desc: 'Create your store pricing rules',  Icon: Activity, s: 'groups' as Section },
            { title: 'Assign delivery zones',   desc: 'Connect areas to a store rate',   Icon: Truck,    s: 'assign' as Section },
          ].map(({ title, desc, Icon, s }, idx, arr) => (
            <button key={s} onClick={() => setSection(s)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: `1px solid ${C.border}`, borderBottom: idx === arr.length - 1 ? `1px solid ${C.border}` : 'none', background: 'transparent', border: 'none', borderTop: `1px solid ${C.border}`, cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={C.primary} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.fg }}>{title}</div>
                <div style={{ fontSize: 11, color: C.mutedFg }}>{desc}</div>
              </div>
              <ChevronRight size={14} color={C.mutedFg} />
            </button>
          ))}
          {groupCount === 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fce8e4', border: '1px solid #f1b8b5', borderRadius: 6, fontSize: 12, color: C.orange, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              No rate groups are pre-created. Add your own before assigning zones.
            </div>
          )}
        </div>
      </div>

      {/* National Footprint */}
      <div className="dm-card" style={{ margin: '0 24px 24px', padding: 24 }}>
        <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>NATIONAL FOOTPRINT</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.fg }}>Delivery areas by division</div>
          <div style={{ fontSize: 12, color: C.mutedFg }}>{totalAreas} total zones</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 48px' }}>
          {divisionCounts.map(({ name, num, count }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: C.mutedFg, minWidth: 18 }}>{String(num).padStart(2, '0')}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.fg, minWidth: 92 }}>{name}</span>
              <div style={{ flex: 1, background: C.muted, borderRadius: 2, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${(count / maxCount) * 100}%`, background: C.primary, height: '100%', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.fg, minWidth: 30, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Areas Section ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;
type AreaSortCol = 'division' | 'district' | 'area' | 'status' | 'assignments';

function AreasSection({ allEntries, statuses, customAreas, assignments, updateStatuses, onAddCustom, onEditCustom, onDeleteCustom }: {
  allEntries: AreaEntry[]; statuses: AreaStatus[]; customAreas: CustomArea[];
  assignments: Assignment[];
  updateStatuses: (s: AreaStatus[]) => void;
  onAddCustom: () => void;
  onEditCustom: (ca: CustomArea) => void;
  onDeleteCustom: (key: string) => Promise<void>;
}) {
  const [filterDiv, setFilterDiv] = useState('');
  const [filterDist, setFilterDist] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<AreaSortCol>('division');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const cbRef = useRef<HTMLInputElement>(null);

  const asnMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of assignments) m[a.key] = (m[a.key] || 0) + 1;
    return m;
  }, [assignments]);

  const filtered = useMemo(() => {
    const list = allEntries.filter(e =>
      (!filterDiv || e.division === filterDiv) &&
      (!filterDist || e.district === filterDist) &&
      (!search || e.area.toLowerCase().includes(search.toLowerCase()) || e.district.toLowerCase().includes(search.toLowerCase()) || e.division.toLowerCase().includes(search.toLowerCase()))
    );
    list.sort((a, b) => {
      let va: string | number, vb: string | number;
      if (sortCol === 'division')    { va = a.division; vb = b.division; }
      else if (sortCol === 'district')   { va = a.district; vb = b.district; }
      else if (sortCol === 'area')       { va = a.area; vb = b.area; }
      else if (sortCol === 'status')     { va = statusFor(statuses, a.key); vb = statusFor(statuses, b.key); }
      else { va = asnMap[a.key] || 0; vb = asnMap[b.key] || 0; }
      const cmp = typeof va === 'number' ? va - vb : va.localeCompare(vb as string);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [allEntries, filterDiv, filterDist, search, sortCol, sortDir, statuses, asnMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageEntries = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageAllSelected = pageEntries.length > 0 && pageEntries.every(e => selected.has(e.key));
  const pagePartial = pageEntries.some(e => selected.has(e.key)) && !pageAllSelected;

  useEffect(() => {
    if (cbRef.current) cbRef.current.indeterminate = pagePartial;
  }, [pagePartial]);

  const toggleSelect = (key: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const selectPage = () =>
    setSelected(prev => { const n = new Set(prev); pageEntries.forEach(e => n.add(e.key)); return n; });
  const clearSel = () => setSelected(new Set());

  const toggleStatus = (key: string) => {
    const cur = statusFor(statuses, key);
    if (cur === 'Enable') {
      updateStatuses([...statuses.filter(s => s.key !== key), { key, status: 'Disable' }]);
    } else {
      updateStatuses(statuses.filter(s => s.key !== key));
    }
  };

  const bulkEnable = () => {
    updateStatuses(statuses.filter(s => !selected.has(s.key)));
    clearSel();
  };
  const bulkDisable = () => {
    const next = statuses.filter(s => !selected.has(s.key));
    selected.forEach(key => { if (!next.find(s => s.key === key)) next.push({ key, status: 'Disable' }); });
    updateStatuses(next);
    clearSel();
  };

  const toggleSort = (col: AreaSortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const exportCsv = () => {
    const rows: string[][] = [['Division','District','Delivery Area','Status','Assignments','Type']];
    for (const e of filtered) {
      rows.push([e.division, e.district, e.area, statusFor(statuses, e.key) === 'Enable' ? 'Enabled' : 'Disabled', String(asnMap[e.key] || 0), e.isCustom ? 'Custom' : 'Standard']);
    }
    downloadCsv(rows, 'delivery-areas.csv');
  };

  const SortIcon = ({ col }: { col: AreaSortCol }) => (
    <span style={{ marginLeft: 4, opacity: sortCol === col ? 1 : 0.35, fontSize: 10 }}>
      {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div>
      {/* Header */}
      <div className="dm-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>GEOGRAPHIC CATALOG</div>
          <div className="dm-section-title">Delivery areas</div>
          <div className="dm-section-desc">Manage the Bangladesh delivery hierarchy, custom zones, and area availability.</div>
        </div>
        <button className="dm-btn-primary" onClick={onAddCustom}><Plus size={14} /> Add delivery area</button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.mutedFg }} />
          <input className="dm-input" style={{ paddingLeft: 30 }} placeholder="Search district or area..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); setSelected(new Set()); }} />
        </div>
        <select className="dm-input" style={{ width: 160 }} value={filterDiv} onChange={e => { setFilterDiv(e.target.value); setFilterDist(''); setPage(1); setSelected(new Set()); }}>
          <option value="">All divisions</option>
          {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="dm-input" style={{ width: 160 }} value={filterDist} onChange={e => { setFilterDist(e.target.value); setPage(1); setSelected(new Set()); }} disabled={!filterDiv}>
          <option value="">All districts</option>
          {(filterDiv ? BD_DISTRICTS[filterDiv] || [] : []).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button className="dm-btn-outline" onClick={exportCsv}><Download size={13} /> Export CSV</button>
      </div>

      {/* Selection toolbar */}
      <div style={{ padding: '7px 24px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}`, background: selected.size > 0 ? C.secondary : 'transparent', fontSize: 13, flexWrap: 'wrap' }}>
        <span style={{ color: C.mutedFg }}>{selected.size > 0 ? <strong style={{ color: C.primary }}>{selected.size} selected</strong> : '0 selected'} · {filtered.length} matching areas</span>
        <div style={{ flex: 1 }} />
        <button className="dm-btn-ghost" style={{ fontSize: 12 }} onClick={selectPage}>Select page</button>
        {selected.size > 0 && <button className="dm-btn-ghost" style={{ fontSize: 12 }} onClick={clearSel}>Clear</button>}
        <button className="dm-btn-outline" style={{ fontSize: 12, opacity: selected.size === 0 ? .4 : 1 }} disabled={selected.size === 0} onClick={bulkEnable}>Enable</button>
        <button className="dm-btn-outline" style={{ fontSize: 12, opacity: selected.size === 0 ? .4 : 1 }} disabled={selected.size === 0} onClick={bulkDisable}>Disable</button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', padding: '0 24px 8px' }}>
        <table className="dm-table" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: 36, padding: '10px 8px 10px 14px' }}>
                <input ref={cbRef} type="checkbox" checked={pageAllSelected} style={{ cursor: 'pointer' }}
                  onChange={e => e.target.checked ? selectPage() : clearSel()} />
              </th>
              {([['division','Division'],['district','District'],['area','Delivery area'],['status','Status'],['assignments','Assignments']] as [AreaSortCol, string][]).map(([col, label]) => (
                <th key={col} onClick={() => toggleSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  {label}<SortIcon col={col} />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageEntries.map(e => {
              const enabled = statusFor(statuses, e.key) === 'Enable';
              const asnCount = asnMap[e.key] || 0;
              const isSel = selected.has(e.key);
              const ca = customAreas.find(c => c.key === e.key);
              return (
                <tr key={e.key} style={{ background: isSel ? `${C.secondary}88` : '' }}>
                  <td style={{ padding: '10px 8px 10px 14px' }}>
                    <input type="checkbox" checked={isSel} style={{ cursor: 'pointer' }} onChange={() => toggleSelect(e.key)} />
                  </td>
                  <td style={{ color: C.mutedFg }}>{e.division}</td>
                  <td style={{ color: C.primary, fontWeight: 400 }}>{e.district}</td>
                  <td style={{ fontWeight: 600 }}>{e.area}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: enabled ? C.primary : C.mutedFg, flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ color: enabled ? C.primary : C.mutedFg }}>{enabled ? 'Enabled' : 'Disabled'}</span>
                    </span>
                  </td>
                  <td style={{ color: C.mutedFg }}>{asnCount} assignment{asnCount !== 1 ? 's' : ''}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {e.isCustom && ca ? (
                        <button className="dm-btn-ghost" style={{ padding: '4px 7px' }} title="Edit area" onClick={() => onEditCustom(ca)}>
                          <Pencil size={13} />
                        </button>
                      ) : (
                        <button className="dm-btn-ghost" style={{ padding: '4px 7px', opacity: .4 }} title="Toggle status" onClick={() => toggleStatus(e.key)}>
                          <Pencil size={13} />
                        </button>
                      )}
                      <button className="dm-btn-ghost" style={{ padding: '4px 7px', color: C.mutedFg }}
                        title={e.isCustom ? 'Remove custom area' : (enabled ? 'Disable' : 'Enable')}
                        onClick={() => e.isCustom ? onDeleteCustom(e.key) : toggleStatus(e.key)}>
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pageEntries.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: C.mutedFg, padding: 36 }}>No areas found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: `1px solid ${C.border}` }}>
        <span style={{ fontSize: 12, color: C.mutedFg }}>
          {filtered.length > 0 ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} areas` : '0 areas'}
        </span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="dm-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 12, color: C.fg }}>Page {page} / {totalPages}</span>
            <button className="dm-btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Groups Section ─────────────────────────────────────────────────────────────
function GroupsSection({ groups, updateGroups, onAdd, onEdit, onDelete }: {
  groups: RateGroup[]; updateGroups: (g: RateGroup[]) => void;
  onAdd: () => void; onEdit: (g: RateGroup) => void; onDelete: (id: string) => void;
}) {
  const pct = Math.round((groups.length / MAX_RATE_GROUPS) * 100);
  const remaining = MAX_RATE_GROUPS - groups.length;

  return (
    <div>
      {/* Header */}
      <div className="dm-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>STORE PRICING</div>
          <div className="dm-section-title">Rate groups</div>
          <div className="dm-section-desc">Create reusable delivery charges for each store location. Groups are never created automatically.</div>
        </div>
        <button className="dm-btn-primary" onClick={onAdd} disabled={groups.length >= MAX_RATE_GROUPS}
          style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative', paddingRight: 42 }}>
          <Plus size={14} /> New rate group
          <span style={{ position: 'absolute', right: 10, background: 'rgba(255,255,255,0.25)', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '1px 7px', letterSpacing: '0.03em' }}>
            {groups.length}/{MAX_RATE_GROUPS}
          </span>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ margin: '0 24px 20px', border: `1px solid ${C.border}`, borderRadius: 8, padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: C.mutedFg, fontWeight: 500 }}>Rate groups created</span>
          <span style={{ fontSize: 12, color: C.mutedFg }}>{remaining} remaining</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.fg, minWidth: 24 }}>{groups.length}</span>
          <span style={{ fontSize: 14, color: C.mutedFg }}>/ {MAX_RATE_GROUPS}</span>
          <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: C.primary, borderRadius: 2, transition: 'width .3s' }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '0 24px 24px' }}>
        {groups.length === 0 ? (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: C.secondary }}>
              <Activity size={22} style={{ color: C.primary }} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.fg, marginBottom: 6 }}>No rate groups yet</div>
            <div style={{ fontSize: 13, color: C.mutedFg, marginBottom: 20 }}>
              Rate groups are created by your team and{' '}
              <span style={{ color: '#e07020', textDecoration: 'underline', cursor: 'default' }}>tied to a store location</span>.
            </div>
            <button className="dm-btn-primary" onClick={onAdd}><Plus size={14} /> Create your first group</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {groups.map(g => {
              const slabs = g.weightSlabs ? parseSlabs(g.weightSlabs) : [];
              return (
                <div key={g.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 18, background: C.bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: C.fg }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 2 }}>ID: {g.id}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="dm-btn-ghost" style={{ padding: '5px 8px' }} title="Edit" onClick={() => onEdit(g)}><Pencil size={13} /></button>
                      <button className="dm-btn-ghost" style={{ padding: '5px 8px', color: '#c0392b' }} title="Delete" onClick={() => onDelete(g.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {/* Rate formula summary */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.mutedFg, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Base rate</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: C.primary }}>৳{g.base}</div>
                    </div>
                    <div style={{ color: C.border, alignSelf: 'center', fontSize: 18 }}>+</div>
                    <div>
                      <div style={{ fontSize: 10, color: C.mutedFg, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Per kg</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: C.primary }}>৳{g.additional}</div>
                    </div>
                    <div style={{ color: C.border, alignSelf: 'center', fontSize: 18 }}>×</div>
                    <div style={{ alignSelf: 'flex-end', fontSize: 12, color: C.mutedFg, paddingBottom: 2 }}>(weight − 1)</div>
                  </div>
                  {/* Weight slabs */}
                  {slabs.length > 0 && (
                    <div style={{ background: C.secondary, borderRadius: 6, padding: '8px 12px', fontSize: 11 }}>
                      <div style={{ color: C.mutedFg, fontWeight: 500, marginBottom: 4 }}>Weight slabs override</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px' }}>
                        {slabs.map((sl, i) => (
                          <span key={i} style={{ color: C.fg }}>≤{sl.upTo}kg → ৳{sl.charge}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formula info */}
      <div style={{ margin: '0 24px 24px', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 18, flexShrink: 0, color: '#c0392b', fontWeight: 700 }}>৳</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.fg, marginBottom: 2 }}>How delivery charges are calculated</div>
          <div style={{ fontSize: 12, color: C.mutedFg }}>
            Base rate + Additional per KG × (weight − 1).{' '}
            <span style={{ color: '#e07020' }}>A matching weight slab takes precedence over the formula.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Assign Section ─────────────────────────────────────────────────────────────
function AssignSection({ allEntries, groups, assignments, statuses, updateAssignments, onSwitchGroup }: {
  allEntries: AreaEntry[]; groups: RateGroup[]; assignments: Assignment[];
  statuses: AreaStatus[];
  updateAssignments: (a: Assignment[]) => void;
  onSwitchGroup: (a: Assignment) => void;
}) {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [filterDist, setFilterDist] = useState('');
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const assignedMap = useMemo(() => {
    const m: Record<string, Assignment> = {};
    for (const a of assignments) m[a.key] = a;
    return m;
  }, [assignments]);

  // Show enabled areas only (status = 'Enable' or no entry = enabled by default)
  const viewList = useMemo(() => {
    return allEntries.filter(e => {
      const enabled = !(statuses.find(s => s.key === e.key)?.status === 'Disable');
      return enabled &&
        (!filterDiv || e.division === filterDiv) &&
        (!filterDist || e.district === filterDist) &&
        (!search || e.area.toLowerCase().includes(search.toLowerCase()) ||
          e.district.toLowerCase().includes(search.toLowerCase()));
    });
  }, [allEntries, statuses, filterDiv, filterDist, search]);

  // "unassigned" = not in any group at all
  const unassignedInView = viewList.filter(e => !assignedMap[e.key]);

  const toggleCheck = (key: string) =>
    setChecked(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const selectAvailable = () =>
    setChecked(prev => { const n = new Set(prev); unassignedInView.forEach(e => n.add(e.key)); return n; });
  const clearSel = () => setChecked(new Set());

  const assignSelected = () => {
    if (!selectedGroupId || checked.size === 0) return;
    const grp = groups.find(g => g.id === selectedGroupId);
    if (!grp) return;
    const toAdd: Assignment[] = [];
    for (const key of checked) {
      const e = allEntries.find(a => a.key === key);
      if (!e) continue;
      if (!assignedMap[key]) {
        toAdd.push({ key, store: grp.store || 'Default', division: e.division, district: e.district, area: e.area, areaId: e.key, groupId: grp.id, groupName: grp.name });
      } else if (assignedMap[key].groupId !== grp.id) {
        // re-assign: replace existing
        toAdd.push({ key, store: grp.store || 'Default', division: e.division, district: e.district, area: e.area, areaId: e.key, groupId: grp.id, groupName: grp.name });
      }
    }
    if (toAdd.length === 0) { clearSel(); return; }
    const replaced = new Set(toAdd.map(a => a.key));
    updateAssignments([...assignments.filter(a => !replaced.has(a.key)), ...toAdd]);
    clearSel();
  };

  const unassignArea = (key: string) =>
    updateAssignments(assignments.filter(a => a.key !== key));

  const hasGroups = groups.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div className="dm-section-header" style={{ paddingBottom: 16 }}>
        <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>ZONE CONFIGURATION</div>
        <div className="dm-section-title">Delivery area assignment</div>
        <div className="dm-section-desc">Choose a store and rate group, then assign eligible delivery zones.</div>
      </div>

      {/* Warning when no groups */}
      {!hasGroups && (
        <div style={{ margin: '0 24px 16px', border: '1px solid #f5c6cb', borderRadius: 8, padding: '12px 16px', background: '#fff5f5', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Activity size={16} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: C.primary, marginBottom: 2 }}>Create a rate group to get started</div>
            <div style={{ fontSize: 12, color: '#c0392b' }}>Only groups created for a store location can be selected here.</div>
          </div>
        </div>
      )}

      {/* Filter row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '0 24px 16px' }}>
        <div>
          <div style={{ fontSize: 11, color: C.mutedFg, fontWeight: 500, marginBottom: 5 }}>Store location</div>
          <select className="dm-input" value={filterDiv} onChange={e => { setFilterDiv(e.target.value); setFilterDist(''); setChecked(new Set()); }}>
            <option value="">Select a store</option>
            {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.mutedFg, fontWeight: 500, marginBottom: 5 }}>City / district</div>
          <select className="dm-input" value={filterDist} onChange={e => { setFilterDist(e.target.value); setChecked(new Set()); }}>
            <option value="">All districts</option>
            {filterDiv
              ? (BD_DISTRICTS[filterDiv] || []).map(d => <option key={d} value={d}>{d}</option>)
              : Object.entries(BD_DISTRICTS).flatMap(([div, dists]) =>
                  dists.map(d => <option key={`${div}-${d}`} value={d}>{d} · {div}</option>)
                )
            }
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.mutedFg, fontWeight: 500, marginBottom: 5 }}>Rate group</div>
          <select className="dm-input" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
            <option value="">Select a rate group</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid header */}
      <div style={{ padding: '0 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.fg }}>Available delivery areas</div>
          <div style={{ fontSize: 12, color: C.mutedFg }}>{unassignedInView.length} unassigned and enabled in this view</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.mutedFg }} />
            <input className="dm-input" style={{ paddingLeft: 28, width: 180 }} placeholder="Search areas..." value={search} onChange={e => { setSearch(e.target.value); setChecked(new Set()); }} />
          </div>
          <button className="dm-btn-outline" style={{ fontSize: 12 }} onClick={selectAvailable} disabled={unassignedInView.length === 0}>Select available</button>
          {checked.size > 0 && <button className="dm-btn-ghost" style={{ fontSize: 12 }} onClick={clearSel}>Clear</button>}
        </div>
      </div>

      {/* 3-column area grid in scrollable box */}
      <div style={{ margin: '0 24px', border: `1px solid ${C.border}`, borderRadius: 8, overflowY: 'auto', maxHeight: 400 }}>
        {viewList.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: C.mutedFg, fontSize: 13 }}>No areas found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {viewList.map((e, i) => {
              const existing = assignedMap[e.key];
              const isSel = checked.has(e.key);
              const isAssignedHere = existing && existing.groupId === selectedGroupId;
              const isAssignedElsewhere = existing && existing.groupId !== selectedGroupId;
              const col = i % 3;
              const row = Math.floor(i / 3);
              const totalRows = Math.ceil(viewList.length / 3);
              const isLastRow = row === totalRows - 1;
              return (
                <div key={e.key} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderBottom: !isLastRow ? `1px solid ${C.border}` : 'none',
                  borderRight: col < 2 ? `1px solid ${C.border}` : 'none',
                  background: isSel ? `${C.secondary}88` : 'transparent',
                  cursor: 'pointer',
                }} onClick={() => toggleCheck(e.key)}>
                  <input type="checkbox" checked={isSel} style={{ cursor: 'pointer', flexShrink: 0 }} onChange={() => toggleCheck(e.key)} onClick={ev => ev.stopPropagation()} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: C.fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.area}</div>
                    <div style={{ fontSize: 11, color: C.mutedFg }}>{e.division} · {e.district}</div>
                  </div>
                  {isAssignedHere ? (
                    <span style={{ fontSize: 11, color: C.mutedFg, flexShrink: 0 }}>Assigned</span>
                  ) : isAssignedElsewhere ? (
                    <span style={{ fontSize: 11, color: '#e07020', flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{existing.groupName}</span>
                  ) : (
                    <span style={{ fontSize: 11, color: C.mutedFg, flexShrink: 0 }}>Available</span>
                  )}
                  {existing && (
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.mutedFg, flexShrink: 0 }}
                      title="Remove assignment"
                      onClick={ev => { ev.stopPropagation(); unassignArea(e.key); setChecked(p => { const n = new Set(p); n.delete(e.key); return n; }); }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div style={{ margin: '12px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: C.mutedFg }}>{checked.size} area{checked.size !== 1 ? 's' : ''} selected</span>
        <button className="dm-btn-primary" style={{ gap: 8 }} disabled={checked.size === 0 || !selectedGroupId} onClick={assignSelected}>
          Assign selected zones <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Rates Section ──────────────────────────────────────────────────────────────
type RateSortCol = 'store' | 'group' | 'division' | 'district' | 'area' | 'base';
function RatesSection({ assignments, groups, onOverride, onRemoveOverride }: {
  assignments: Assignment[]; groups: RateGroup[];
  onOverride: (a: Assignment) => void;
  onRemoveOverride: (key: string) => void;
}) {
  const [filterGroup, setFilterGroup] = useState('');
  const [filterDiv, setFilterDiv] = useState('');
  const [filterDist, setFilterDist] = useState('');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<RateSortCol>('store');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const cbRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = assignments.filter(a =>
      (!filterGroup || a.groupId === filterGroup) &&
      (!filterDiv || a.division === filterDiv) &&
      (!filterDist || a.district === filterDist) &&
      (!q || a.area.toLowerCase().includes(q) || a.district.toLowerCase().includes(q) ||
        a.division.toLowerCase().includes(q) || (a.groupName || '').toLowerCase().includes(q))
    );
    list.sort((a, b) => {
      const ga = groups.find(g => g.id === a.groupId);
      const gb = groups.find(g => g.id === b.groupId);
      let va: string | number, vb: string | number;
      if (sortCol === 'store')    { va = ga?.name || ''; vb = gb?.name || ''; }
      else if (sortCol === 'group')    { va = ga?.name || ''; vb = gb?.name || ''; }
      else if (sortCol === 'division') { va = a.division; vb = b.division; }
      else if (sortCol === 'district') { va = a.district; vb = b.district; }
      else if (sortCol === 'area')     { va = a.area; vb = b.area; }
      else { va = a.baseOverride ?? ga?.base ?? 0; vb = b.baseOverride ?? gb?.base ?? 0; }
      const cmp = typeof va === 'number' ? va - vb : (va as string).localeCompare(vb as string);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [assignments, groups, filterGroup, filterDiv, filterDist, search, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const display = filtered.slice((page - 1) * pageSize, page * pageSize);

  const pageAllSel = display.length > 0 && display.every(a => selected.has(a.key));
  const pagePartial = display.some(a => selected.has(a.key)) && !pageAllSel;
  useEffect(() => { if (cbRef.current) cbRef.current.indeterminate = pagePartial; }, [pagePartial]);

  const toggleSel = (key: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const selectPage = () =>
    setSelected(prev => { const n = new Set(prev); display.forEach(a => n.add(a.key)); return n; });
  const clearSel = () => setSelected(new Set());

  const removeSelected = () => {
    for (const key of selected) onRemoveOverride(key);
    clearSel();
  };

  const toggleSort = (col: RateSortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const exportCsv = () => {
    const rows: string[][] = [['Store/Group','Group','Division','District','Delivery Area','Base·1KG','2KG','3KG']];
    for (const a of filtered) {
      const grp = groups.find(g => g.id === a.groupId);
      const base = a.baseOverride ?? grp?.base ?? 0;
      const add = a.additionalOverride ?? grp?.additional ?? 0;
      const r2 = Number(base) + Number(add);
      const r3 = Number(base) + Number(add) * 2;
      rows.push([grp?.name || a.groupId, grp?.name || '', a.division, a.district, a.area, String(base), String(r2), String(r3)]);
    }
    downloadCsv(rows, 'assigned-zone-rates.csv');
  };

  const SortIcon = ({ col }: { col: RateSortCol }) => (
    <span style={{ marginLeft: 3, opacity: sortCol === col ? 1 : 0.35, fontSize: 10 }}>
      {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const start = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, filtered.length);

  return (
    <div>
      {/* Header */}
      <div className="dm-section-header">
        <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>ACTIVE PRICING</div>
        <div className="dm-section-title">Assigned zone rates</div>
        <div className="dm-section-desc">Review store-area assignments, delivery charges, and individual rate overrides.</div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: '0 24px 12px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: 200 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.mutedFg }} />
          <input className="dm-input" style={{ paddingLeft: 30 }} placeholder="Search store, group, district, area..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); setSelected(new Set()); }} />
        </div>
        <select className="dm-input" style={{ flex: 1, minWidth: 140 }} value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setPage(1); setSelected(new Set()); }}>
          <option value="">All store locations</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="dm-input" style={{ flex: 1, minWidth: 130 }} value={filterDiv} onChange={e => { setFilterDiv(e.target.value); setFilterDist(''); setPage(1); setSelected(new Set()); }}>
          <option value="">All divisions</option>
          {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="dm-input" style={{ flex: 1, minWidth: 130 }} value={filterDist} onChange={e => { setFilterDist(e.target.value); setPage(1); setSelected(new Set()); }} disabled={!filterDiv}>
          <option value="">All districts</option>
          {(filterDiv ? BD_DISTRICTS[filterDiv] || [] : []).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="dm-input" style={{ flex: 1, minWidth: 130 }} value={filterGroup} onChange={e => { setFilterGroup(e.target.value); setPage(1); setSelected(new Set()); }}>
          <option value="">All rate groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <button className="dm-btn-outline" style={{ fontSize: 12, whiteSpace: 'nowrap' }} onClick={exportCsv}><Download size={13} /> Export CSV</button>
      </div>

      {/* Selection toolbar */}
      <div style={{ padding: '7px 24px', display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, fontSize: 13, flexWrap: 'wrap' }}>
        <span style={{ color: C.mutedFg }}><strong style={{ color: selected.size > 0 ? C.primary : C.fg }}>{selected.size} selected</strong> · {filtered.length} assignments</span>
        <div style={{ flex: 1 }} />
        <button className="dm-btn-ghost" style={{ fontSize: 12 }} onClick={selectPage} disabled={display.length === 0}>Select page</button>
        {selected.size > 0 && <button className="dm-btn-ghost" style={{ fontSize: 12 }} onClick={clearSel}>Clear</button>}
        <button className="dm-btn-ghost" style={{ fontSize: 12, opacity: selected.size === 0 ? .4 : 1, color: selected.size > 0 ? '#c0392b' : undefined }}
          disabled={selected.size === 0} onClick={removeSelected}>
          <Trash2 size={12} /> Remove selected
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', padding: '0 24px 8px' }}>
        <table className="dm-table" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: 36, padding: '10px 8px 10px 0' }}>
                <input ref={cbRef} type="checkbox" checked={pageAllSel} style={{ cursor: 'pointer' }}
                  onChange={e => e.target.checked ? selectPage() : clearSel()} />
              </th>
              {([['store','Store'],['group','Group'],['division','Division'],['district','District'],['area','Delivery area'],['base','Base · 1 KG']] as [RateSortCol, string][]).map(([col, label]) => (
                <th key={col} onClick={() => toggleSort(col)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  {label}<SortIcon col={col} />
                </th>
              ))}
              <th style={{ whiteSpace: 'nowrap' }}>2 KG</th>
              <th style={{ whiteSpace: 'nowrap' }}>3 KG</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {display.map(a => {
              const grp = groups.find(g => g.id === a.groupId);
              const hasOverride = a.baseOverride != null || a.additionalOverride != null;
              const base = Number(a.baseOverride ?? grp?.base ?? 0);
              const add = Number(a.additionalOverride ?? grp?.additional ?? 0);
              const r2 = base + add;
              const r3 = base + add * 2;
              const isSel = selected.has(a.key);
              return (
                <tr key={a.key} style={{ background: isSel ? `${C.secondary}88` : '' }}>
                  <td style={{ padding: '10px 8px 10px 0' }}>
                    <input type="checkbox" checked={isSel} style={{ cursor: 'pointer' }} onChange={() => toggleSel(a.key)} />
                  </td>
                  <td style={{ fontWeight: 500, color: C.fg }}>{grp?.name || a.groupId}</td>
                  <td><span className="dm-badge dm-badge-purple" style={{ fontSize: 11 }}>{grp?.name || a.groupId}</span></td>
                  <td style={{ color: C.mutedFg }}>{a.division}</td>
                  <td style={{ color: C.primary }}>{a.district}</td>
                  <td style={{ fontWeight: 600 }}>{a.area}</td>
                  <td>
                    <span style={{ color: hasOverride ? C.primary : C.fg, fontWeight: hasOverride ? 700 : 400 }}>৳{base}</span>
                    {hasOverride && <span style={{ marginLeft: 4, fontSize: 10, color: '#e07020' }}>override</span>}
                  </td>
                  <td style={{ color: C.mutedFg }}>৳{r2}</td>
                  <td style={{ color: C.mutedFg }}>৳{r3}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="dm-btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => onOverride(a)}>
                        <Pencil size={12} />
                      </button>
                      {hasOverride && (
                        <button className="dm-btn-ghost" style={{ padding: '4px 8px', color: '#c0392b' }} onClick={() => onRemoveOverride(a.key)}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {display.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: C.mutedFg, padding: 32, fontSize: 13 }}>No assigned zone rates match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderTop: `1px solid ${C.border}`, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 12, color: C.mutedFg }}>Showing <strong>{start}–{end}</strong> of <strong>{filtered.length}</strong></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: C.mutedFg }}>Rows</span>
          <select className="dm-input" style={{ width: 70, padding: '4px 8px' }} value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button className="dm-btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 12, color: C.fg, whiteSpace: 'nowrap' }}>Page {page} of {totalPages}</span>
          <button className="dm-btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ── Backup Section ─────────────────────────────────────────────────────────────
function BackupSection({ groups, assignments, statuses, customAreas, onImport }: {
  groups: RateGroup[]; assignments: Assignment[]; statuses: AreaStatus[]; customAreas: CustomArea[];
  onImport: (data: any) => void;
}) {
  const [importFileName, setImportFileName] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        onImport(data);
        toast.success('Backup imported successfully');
      } catch { toast.error('Invalid JSON file — make sure this is a Sholok backup'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportJson = () => {
    const data = { groups, assignments, statuses, customAreas, exportedAt: new Date().toISOString() };
    downloadText(JSON.stringify(data, null, 2), `sholok-delivery-backup-${Date.now()}.json`);
    toast.success('Backup exported');
  };

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    onImport({ groups: [], assignments: [], statuses: [], customAreas: [] });
    setConfirmReset(false);
    toast.success('Application data reset');
  };

  return (
    <div>
      {/* Header */}
      <div className="dm-section-header">
        <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>DATA SAFETY</div>
        <div className="dm-section-title">Backup &amp; restore</div>
        <div className="dm-section-desc" style={{ color: '#e07020' }}>
          Export a complete copy of your local settings or restore a previously exported backup.
        </div>
      </div>

      {/* Two-card row */}
      <div style={{ padding: '0 24px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Export card */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, background: C.secondary }}>
            <Download size={18} style={{ color: C.primary }} />
          </div>
          <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>SAVE A COPY</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.fg, marginBottom: 8 }}>Export backup</div>
          <p style={{ fontSize: 13, color: C.mutedFg, lineHeight: 1.6, marginBottom: 16 }}>
            Download your rate groups, custom areas and districts, assignments, status settings, and rate overrides as a JSON file.
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.mutedFg, marginBottom: 20 }}>
            <span><Check size={12} style={{ color: C.primary, display: 'inline', marginRight: 4 }} />{groups.length} rate groups</span>
            <span><Check size={12} style={{ color: C.primary, display: 'inline', marginRight: 4 }} />{customAreas.length} custom areas</span>
            <span><Check size={12} style={{ color: C.primary, display: 'inline', marginRight: 4 }} />{assignments.length} assignments</span>
          </div>
          <button className="dm-btn-primary" onClick={exportJson} style={{ gap: 8 }}>
            <Download size={14} /> Export JSON backup
          </button>
        </div>

        {/* Import card */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, background: C.secondary }}>
            <FileJson size={18} style={{ color: C.primary }} />
          </div>
          <div style={{ color: C.primary, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>RESTORE A COPY</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.fg, marginBottom: 8 }}>Import backup</div>
          <p style={{ fontSize: 13, color: C.mutedFg, lineHeight: 1.6, marginBottom: 16 }}>
            Choose a Sholok JSON backup. The file is checked before it replaces your current browser data.
          </p>
          {/* File drop zone */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer',
            background: C.secondary, marginBottom: 12,
          }}>
            <FileJson size={20} style={{ color: C.primary, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.fg }}>
                {importFileName || 'Select a backup file'}
              </div>
              <div style={{ fontSize: 11, color: C.mutedFg }}>JSON files exported from Sholok</div>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#c0392b' }}>
            <AlertTriangle size={12} />
            Importing replaces the current saved settings in this browser.
          </div>
        </div>
      </div>

      {/* Reset section */}
      <div style={{ margin: '0 24px 16px', border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #f5c6cb', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Trash2 size={16} style={{ color: '#c0392b' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.fg, marginBottom: 2 }}>Reset application data</div>
          <div style={{ fontSize: 12, color: C.mutedFg, lineHeight: 1.5 }}>
            Remove locally saved rate groups, custom areas, assignments, status changes, and overrides.{' '}
            <span style={{ color: C.fg }}>The built-in Bangladesh location list remains intact.</span>
          </div>
        </div>
        {confirmReset ? (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="dm-btn-ghost" style={{ fontSize: 12 }} onClick={() => setConfirmReset(false)}>Cancel</button>
            <button style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid #c0392b', background: '#c0392b', color: '#fff', cursor: 'pointer', fontWeight: 600 }} onClick={handleReset}>
              Confirm reset
            </button>
          </div>
        ) : (
          <button style={{ fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid #c0392b', background: 'transparent', color: '#c0392b', cursor: 'pointer', fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap' }} onClick={handleReset}>
            Reset local data
          </button>
        )}
      </div>

      {/* Footer note */}
      <div style={{ margin: '0 24px 24px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Shield size={15} style={{ color: C.primary, flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.primary, marginBottom: 1 }}>Local to this browser</div>
          <div style={{ fontSize: 12, color: C.mutedFg }}>
            Saved changes do not sync to other devices or browsers. Keep a backup if you need to transfer your{' '}
            <span style={{ color: '#e07020', textDecoration: 'underline', cursor: 'default' }}>settings</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────────────
function DialogFrame({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; }) {
  return (
    <div className="dm-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dm-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="dm-modal-title" style={{ marginBottom: 0 }}>{title}</div>
          <button className="dm-btn-ghost" style={{ padding: '4px 6px' }} onClick={onClose}><X size={16} /></button>
        </div>
        {children}
        {footer && <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>{footer}</div>}
      </div>
    </div>
  );
}

function AreaModal({ mode, initial, onClose, onSave }: {
  mode: 'add' | 'edit'; initial?: CustomArea;
  onClose: () => void;
  onSave: (div: string, dist: string, area: string) => void;
}) {
  const [div, setDiv] = useState(initial?.division || '');
  const [dist, setDist] = useState(initial?.district || '');
  const [area, setArea] = useState(initial?.area || '');
  const availDists = div ? (BD_DISTRICTS[div] || []) : [];
  return (
    <DialogFrame title={mode === 'add' ? 'Add Custom Area' : 'Edit Area'} onClose={onClose}
      footer={<><button className="dm-btn-outline" onClick={onClose}>Cancel</button><button className="dm-btn-primary" onClick={() => { if (div && dist && area.trim()) onSave(div, dist, area.trim()); }}>Save</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="dm-label">Division *</label>
          <select className="dm-input" value={div} onChange={e => { setDiv(e.target.value); setDist(''); }}>
            <option value="">Select division…</option>
            {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="dm-label">District *</label>
          <select className="dm-input" value={dist} onChange={e => setDist(e.target.value)} disabled={!div}>
            <option value="">Select district…</option>
            {availDists.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="dm-label">Area Name *</label>
          <input className="dm-input" value={area} onChange={e => setArea(e.target.value)} placeholder="Enter area name" />
        </div>
      </div>
    </DialogFrame>
  );
}

function GroupModal({ mode, initial, onClose, onSave }: {
  mode: 'add' | 'edit'; initial?: RateGroup;
  onClose: () => void; onSave: (g: RateGroup) => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [base, setBase] = useState(String(initial?.base ?? ''));
  const [additional, setAdditional] = useState(String(initial?.additional ?? ''));
  const [slabs, setSlabs] = useState(initial?.weightSlabs || '');

  const handleSave = () => {
    if (!name.trim() || isNaN(+base) || isNaN(+additional)) { toast.error('Fill all required fields'); return; }
    onSave({ id: initial?.id || createId(), store: initial?.store || 'Default', name: name.trim(), base: +base, additional: +additional, weightSlabs: slabs.trim() || undefined });
  };

  return (
    <DialogFrame title={mode === 'add' ? 'New Rate Group' : 'Edit Rate Group'} onClose={onClose}
      footer={<><button className="dm-btn-outline" onClick={onClose}>Cancel</button><button className="dm-btn-primary" onClick={handleSave}>Save</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="dm-label">Group Name *</label>
          <input className="dm-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dhaka City" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="dm-label">Base Charge (৳) *</label>
            <input className="dm-input" type="number" value={base} onChange={e => setBase(e.target.value)} placeholder="60" />
          </div>
          <div>
            <label className="dm-label">Extra per kg (৳) *</label>
            <input className="dm-input" type="number" value={additional} onChange={e => setAdditional(e.target.value)} placeholder="20" />
          </div>
        </div>
        <div>
          <label className="dm-label">Weight Slabs (optional)</label>
          <input className="dm-input" value={slabs} onChange={e => setSlabs(e.target.value)} placeholder="e.g. 1:60,3:100,5:150" />
          <div style={{ fontSize: 11, color: C.mutedFg, marginTop: 4 }}>Format: weight:charge, comma-separated</div>
        </div>
      </div>
    </DialogFrame>
  );
}

function OverrideModal({ assignment, groups, onClose, onSave }: {
  assignment: Assignment; groups: RateGroup[];
  onClose: () => void; onSave: (data: { key: string; base: number; additional: number; slabs?: string }) => void;
}) {
  const grp = groups.find(g => g.id === assignment.groupId);
  const [base, setBase] = useState(String(assignment.baseOverride ?? grp?.base ?? ''));
  const [additional, setAdditional] = useState(String(assignment.additionalOverride ?? grp?.additional ?? ''));
  const [slabs, setSlabs] = useState(assignment.weightSlabsOverride || '');

  const handleSave = () => {
    if (isNaN(+base) || isNaN(+additional)) { toast.error('Enter valid numbers'); return; }
    onSave({ key: assignment.key, base: +base, additional: +additional, slabs: slabs.trim() || undefined });
  };

  return (
    <DialogFrame title={`Override Rate — ${assignment.area}`} onClose={onClose}
      footer={<><button className="dm-btn-outline" onClick={onClose}>Cancel</button><button className="dm-btn-primary" onClick={handleSave}>Save Override</button></>}>
      <div style={{ marginBottom: 16, padding: '10px 12px', background: C.secondary, borderRadius: 8, fontSize: 12, color: C.secondaryFg }}>
        Group: <strong>{grp?.name || assignment.groupId}</strong> · Default: ৳{grp?.base}/{grp?.additional}/kg
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="dm-label">Override Base (৳)</label>
            <input className="dm-input" type="number" value={base} onChange={e => setBase(e.target.value)} />
          </div>
          <div>
            <label className="dm-label">Override Extra/kg (৳)</label>
            <input className="dm-input" type="number" value={additional} onChange={e => setAdditional(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="dm-label">Override Slabs (optional)</label>
          <input className="dm-input" value={slabs} onChange={e => setSlabs(e.target.value)} placeholder="e.g. 1:60,3:100" />
        </div>
      </div>
    </DialogFrame>
  );
}

function SwitchGroupModal({ assignment, groups, onClose, onSave }: {
  assignment: Assignment; groups: RateGroup[];
  onClose: () => void; onSave: (newGroupId: string) => void;
}) {
  const [sel, setSel] = useState(assignment.groupId);
  return (
    <DialogFrame title={`Switch Group — ${assignment.area}`} onClose={onClose}
      footer={<><button className="dm-btn-outline" onClick={onClose}>Cancel</button><button className="dm-btn-primary" onClick={() => { if (sel) onSave(sel); }}>Switch</button></>}>
      <div>
        <label className="dm-label">Select Rate Group</label>
        <select className="dm-input" value={sel} onChange={e => setSel(e.target.value)}>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name} — ৳{g.base} base, ৳{g.additional}/kg</option>)}
        </select>
      </div>
    </DialogFrame>
  );
}
