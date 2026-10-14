import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { shippingApi, DeliveryArea, ShippingStats, ShippingOrder, ShippingMethod } from '@/services/shippingService';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Truck, MapPin, Package, CheckCircle, Clock, Plus, Pencil, Trash2,
  Search, Settings, Eye, Edit, RefreshCw, ChevronDown, Save, Globe,
} from 'lucide-react';

// ── Bangladesh location data (8 Divisions · 64 Districts · 763 Areas) ─────────
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
  // Dhaka Division
  Dhaka:          ['Adabor','Agargaon','Ainusbag (Dakshinkhan)','Ashkona','Askona Airport Road','Azimpur','Badda (Middle Badda)','Badda (Merul Badda)','Badda (North Badda)','Badda (South Badda)','Baigertek (Mirpur)','Bailey Road','Banani (Block A)','Banani (Block B to K)','Banani DOHS','Banga Bazar','Bangabandhu Avenue','Bangshal','Baridhara DOHS','Baridhara J-Block','Basabo','Bashundhara R/A (Block A-C)','Bashundhara R/A (Block D-I)','Bashundhara R/A (Block J-N)','Begum Bazar','Bijoynagar','Bongo Bhaban Area','Bosila (Mohammadpur)','Cantonment','Chawkbazar','Chankarpul','Dakshinkhan','Darussalam','Dayaganj','Demra','Dhamrai','Dhania','Dhanmondi (Road 1 to 15)','Dhanmondi (Road 16 to 32)','Dhakeshwari','Dholaikhal','Dholaipar','Dohar','Elephant Road','Eskaton (New Eskaton)','Eskaton (Old Eskaton)','Fakirapul','Farmgate','Fayedabad','Gabtoli','Gendaria','Golartek (Mirpur)','Gudaraghat (Badda)','Gulshan 1','Gulshan 2','Gulistan','Hajipara (Rampura)','Hatirjheel Area','Hazaribagh','High Court Area','Ibrahimpur (Kafrul)','Imamganj','Islampur','Jatrabari','Jhilpar (Shahjadpur)','Jigatola','Jurain','Kafrul','Kajla','Kakrail','Kalabagan','Kallayanpur','Kalshi (Mirpur)','Kamalapur','Kaptan Bazar','Kawla','Kellar Mor (Lalbagh)','Keraniganj (Abdullahpur)','Keraniganj (Hasnabad)','Keraniganj (Jinjira)','Keraniganj (Kadamtoli)','Keraniganj (Rohitpur)','Khilgaon (Block A-C)','Khilgaon (Tazmahal Road)','Khilkhet','Kochukhet','Kotwali','Kuril','Lalbagh','Lalmatia','Laxmibazar','Madartek','Malibagh','Maniknagar','Matuail','Midford','Middle Para (Khilkhet)','Mirpur 1','Mirpur 2','Mirpur 6','Mirpur 7','Mirpur 10','Mirpur 11','Mirpur 12','Mirpur 13','Mirpur 14','Mirpur DOHS','Mirpur Section 11.5','Mirpur Zoo Road','Moghbazar','Mohammadpur (Asad Avenue)','Mohammadpur (Housing)','Mohammadpur (Japan Garden)','Mohammadpur (Town Hall)','Monipur (60-Feet)','Monipuripara','Motijheel','Mouchak','Mugda','Naddapara','Narinda','Naya Bazar','Naya Paltan','Nawabganj','Nawabpur','New Market','Niketon','Nikunja 1','Nikunja 2','Nilkhet','Paikpara (Mirpur)','Palashi','Pallabi','Panthapath','Postogola','Press Club','Purana Paltan','Puran Dhaka (General)','Rajarbagh','Rajendrapur (Keraniganj)','Rampura','Rayer Bazar','Rayerbagh','Rupnagar (Mirpur)','Sabujbagh','Sadarghat','Sayedabad','Sector 1 (Uttara)','Sector 3 (Uttara)','Sector 4 (Uttara)','Sector 5 (Uttara)','Sector 6 (Uttara)','Sector 7 (Uttara)','Sector 9 (Uttara)','Sector 10 (Uttara)','Sector 11 (Uttara)','Sector 12 (Uttara)','Sector 13 (Uttara)','Sector 14 (Uttara)','Shahbagh','Shahjahanpur','Shantinagar','Shere Bangla Nagar','Shewra (Kuril)','Shewrapara (East)','Shewrapara (West)','Shiddheswari','Shonir Akhra','Shyampur','Siddique Bazar','Subidbazar','Sutrapur','Taltola (Agargaon)','Tatibazar','Tejgaon Industrial Area','Tejkunipara','Tikatuly','Tipu Sultan Road','Tolna (Khilkhet)','Uttara Model Town','Uttarkhan','Uttar Para (Khilkhet)','Vasantek','Wari','Zigatola','Ashulia','Birulia','DEPZ (Savar)','Jirabo','Nabinagar','Savar Sadar','Savar Cantonment'],
  Faridpur:       ['Alfadanga','Bhanga','Boalmari','Charbhadrasan','Faridpur Sadar','Madhukhali','Nagarkanda','Sadarpur','Saltha'],
  Gazipur:        ['Board Bazar','Chandra','Cherag Ali','Chowrasta','Gacha','Gazipur Sadar','Kaliakair','Kaliganj','Kapasia','Konabari','Mawna','Mouchak','Pubail','Safipur','Shibbari','Sreepur','Tongi (East)','Tongi (West)'],
  Gopalganj:      ['Gopalganj Sadar','Kashiani','Kotalipara','Muksudpur','Tungipara'],
  Kishoreganj:    ['Austagram','Bajitpur','Bhairab','Hossainpur','Itna','Karimganj','Katiadi','Kishoreganj Sadar','Kuliarchar','Mithamain','Nikli','Pakundia','Tarail'],
  Madaripur:      ['Kalkini','Madaripur Sadar','Rajoir','Shibchar'],
  Manikganj:      ['Daulatpur','Ghior','Harirampur','Manikganj Sadar','Saturia','Shibalaya','Singair'],
  Munshiganj:     ['Gajaria','Hasara','Louhajang','Mawa','Muktarpur','Munshiganj Sadar','Sirajdikhan','Sreenagar','Tongibari'],
  Narayanganj:    ['Araihazar','Bandar','Chashara','Fatullah','Gauchhia','Gopaldi','Kanchpur','Madanpur','Mandalpara','Narayanganj Sadar','Nitaiaganj','Purbachal','Rupganj','Shiddhirganj','Sonargaon'],
  Narsingdi:      ['Belabo','Ghorashal','Madhabdi','Monohardi','Narsingdi Sadar','Palash','Raipura','Shekherchar','Shibpur'],
  Rajbari:        ['Baliakandi','Goalanda','Kalukhali','Pangsha','Rajbari Sadar'],
  Shariatpur:     ['Bhedarganj','Damudya','Gosairhat','Naria','Shariatpur Sadar','Zanjira'],
  Tangail:        ['Basail','Bhuapur','Delduar','Dhanbari','Elenga','Ghatail','Gopalpur','Gorai','Kalihati','Madhupur','Mirzapur','Nagarpur','Sakhipur','Tangail Sadar'],
  // Chattogram Division
  Bandarban:      ['Alikadam','Bandarban Sadar','Lama'],
  Brahmanbaria:   ['Akhaura','Ashuganj','Bancharampur','Bijoynagar','Brahmanbaria Sadar','Kasba','Nabinagar','Nasirnagar','Sarail'],
  Chandpur:       ['Chandpur Sadar','Faridganj','Haimchar','Hajiganj','Kachua','Matlab North','Matlab South','Puranbazar','Shahrasti'],
  Chattogram:     ['Agrabad','Akbar Shah','Anwara','Baizid Bostami','Bakalia','Bandar','Banshkhali','Baraiyarhat','Bhatiari','Boalkhali','Chandanaish','Chandgaon','Chawkbazar','Choudhury Hat','Dewanhart','Dohazari','Double Mooring','EPZ','GEC Circle','Halishahar','Hathazari','Khulshi','Kotwali','Kumira','Lalkhan Bazar','Lohagara','Madarbari','Mirsharai','Nasirabad','Pahartali','Panchlaish','Patenga','Patiya','Rangunia','Raozan','Sandwip','Satkania','Sitakunda'],
  Cumilla:        ['Barura','Brahmanpara','Burichang','Chandina','Chauddagram','Cumilla EPZ','Cumilla Sadar','Cumilla Sadar South','Daudkandi','Debidwar','Homna','Kandirpar','Laksam','Meghna','Monohargonj','Muradnagar','Nangalkot','Paduar Bazar','Shasongachha','Titas'],
  "Cox's Bazar":  ['Chakaria',"Cox's Bazar Sadar",'Kolatoli','Kutubdia','Link Road','Maheshkhali','Pekua','Ramu','Teknaf','Ukhia'],
  Feni:           ['Chhagalnaiya','Daganbhuiyan','Feni Sadar','Fulgazi','Parshuram','Sonagazi','Trunk Road'],
  Khagrachhari:   ['Khagrachhari Sadar','Matiranga','Ramgarh'],
  Lakshmipur:     ['Kamalnagar','Lakshmipur Sadar','Raipur','Ramganj','Ramgati'],
  Noakhali:       ['Begumganj (Chowmuhani)','Bosurhat','Chatkhil','Companiganj','Hatiya','Kabirhat','Maijdee (Noakhali Sadar)','Senbagh','Sonaimuri','Subarnachar'],
  Rangamati:      ['Kaptai','Kaukhali','Rangamati Sadar'],
  // Rajshahi Division
  Bogra:          ['Adamdighi','Banani (Bogra)','Bogra Sadar','Dhunat','Dupchanchia','Gabtali','Joleshoritola','Kahaloo','Nandigram','Santahar','Sariakandi','Satmatha','Shajahanpur','Sherpur','Shibganj','Sonatala'],
  Chapainawabganj:['Bholahat','Chapainawabganj Sadar','Gomastapur','Kansat','Nachole','Shibganj'],
  Joypurhat:      ['Akkelpur','Joypurhat Sadar','Kalai','Khetlal','Panchbibi'],
  Naogaon:        ['Atrai','Badalgachhi','Dhamoirhat','Mahadevpur','Manda','Naogaon Sadar','Niamatpur','Patnitala','Porsha','Raninagar','Sapahar'],
  Natore:         ['Bagatipara','Baraigram','Bonpara','Gurudaspur','Lalpur','Naldanga','Natore Sadar','Singra'],
  Pabna:          ['Atgharia','Bera','Bhangoora','Chatmohar','Faridpur','Ishwardi','Pabna Sadar','Rooppur','Santhia','Sujanagar'],
  Rajshahi:       ['Bagha','Bagmara','Bhabaniganj','Binodpur','Charghat','Durgapur','Godagari','Kazla','Mohanpur','New Market (Rajshahi)','Paba','Puthia','Rajshahi City Center','Saheb Bazar','Tanore','Uposhahar'],
  Sirajganj:      ['Belkuchi','Chouhali','Enayetpur','Kamarkhanda','Kazipur','Raiganj','Shahjadpur','Sirajganj Sadar','Tarash','Ullahpara'],
  // Khulna Division
  Bagerhat:       ['Bagerhat Sadar','Chitalmari','Fakirhat','Kachua','Mollahat','Mongla','Morrelganj','Rampal','Sharankhola'],
  Chuadanga:      ['Alamdanga','Chuadanga Sadar','Damurhuda','Darshana','Jibannagar'],
  Jashore:        ['Abhaynagar (Nawapara)','Bagherpara','Benapole','Chanchra','Chaugachha','Jashore Sadar','Jhikargachha','Keshabpur','Manirampur','Palbari','Sharsha'],
  Jhenaidah:      ['Harinakunda','Jhenaidah Sadar','Kaliganj','Kotchandpur','Maheshpur','Shailkupa'],
  Khulna:         ['Batiaghata','Boyra','Chalna','Dacope','Daulatpur','Dighalia','Dumuria','Khalishpur','Khulna City Center','Koyra','Paikgachha','Phultala','Rupsha','Shibbari','Terokhada'],
  Kushtia:        ['Bheramara','Chourhas','Daulatpur','Khoksa','Kumarkhali','Kushtia Sadar','Mirpur'],
  Magura:         ['Magura Sadar','Mohammadpur','Shalikha','Sreepur'],
  Meherpur:       ['Gangni','Meherpur Sadar','Mujibnagar'],
  Narail:         ['Kalia','Lohagara','Narail Sadar'],
  Satkhira:       ['Assasuni','Debhata','Kalaroa','Kaliganj','Satkhira Sadar','Shyamnagar','Tala'],
  // Barishal Division
  Barguna:        ['Amtali','Bamna','Barguna Sadar','Betagi','Patharghata','Taltali'],
  Barishal:       ['Agailjhara','Babuganj','Bakerganj','Banaripara','Barishal City Center','Gournadi','Hijla','Mehendiganj','Muladi','Nathullabad','Rupatali','Uzirpur'],
  Bhola:          ['Baborhanuddin','Bhola Sadar','Char Fasson','Daulatkhan','Lalmohan','Manpura','Tazumuddin'],
  Jhalokathi:     ['Jhalokathi Sadar','Kathalia','Nalchity','Rajapur'],
  Patuakhali:     ['Bauphal','Dashmina','Dumki','Galachipa','Kalapara (Kuakata)','Mirzaganj','Patuakhali Sadar','Rangabali'],
  Pirojpur:       ['Bhandaria','Kawkhali','Mathbaria','Nazirpur','Nesarabad (Swarupkathi)','Pirojpur Sadar','Zianagar'],
  // Sylhet Division
  Habiganj:       ['Ajmiriganj','Bahubal','Baniyachong','Chunarughat','Habiganj Sadar','Lakhai','Madhabpur','Nabiganj','Shayestaganj'],
  Moulvibazar:    ['Barlekha','Juri','Kamalganj','Kulaura','Moulvibazar Sadar','Rajnagar','Sreemangal'],
  Sunamganj:      ['Chhatak','Dharmapasha','Dowarabazar','Jagannathpur','Jamalganj','Shalai','South Sunamganj','Sunamganj Sadar','Tahirpur'],
  Sylhet:         ['Balaganj','Beani Bazar','Bishwanath','Chowhatta','Companiganj','Fenchuganj','Golapganj','Gowainghat','Jaintiapur','Jindabazar','Kanaighat','Osmani Nagar','South Surma','Sylhet City Center','Tilagarh','Uposhahar','Zakiganj'],
  // Rangpur Division
  Dinajpur:       ['Biral','Birampur','Birganj','Bochaganj','Chirirbandar','Dinajpur Sadar','Ghoraghat','Hakimpur (Hili)','Kaharole','Khansama','Nawabganj','Parbatipur','Phulbari'],
  Gaibandha:      ['Fulchhari','Gaibandha Sadar','Gobindaganj','Palashbari','Sadullapur','Saghata','Sundarganj'],
  Kurigram:       ['Bhurungamari','Char Rajibpur','Chilmari','Kurigram Sadar','Nageshwari','Phulbari','Rajarhat','Roumari','Ulipur'],
  Lalmonirhat:    ['Aditmari','Burimari','Hatibandha','Kaliganj','Lalmonirhat Sadar','Patgram'],
  Nilphamari:     ['Dimla','Domar','Jaldhaka','Kishoreganj','Nilphamari Sadar','Saidpur'],
  Panchagarh:     ['Atwari','Banglabandha','Boda','Debiganj','Panchagarh Sadar','Tetulia'],
  Rangpur:        ['Badarganj','Gangachhara','Kaunia','Lalbagh (Rangpur)','Mithapukur','Pirgachha','Pirganj','Rangpur City Center','Shapla Chottor','Taraganj'],
  Thakurgaon:     ['Baliadangi','Haripur','Pirganj','Ranisankail','Thakurgaon Sadar'],
  // Mymensingh Division
  Jamalpur:       ['Baksiganj','Dewanganj','Islampur','Jamalpur Sadar','Madarganj','Melandohn','Sarishabari'],
  Mymensingh:     ['Bhaluka','Dhobaura','Fulbaria','Gafargaon','Ganginar Paar','Gauripur','Haluaghat','Ishwarganj','Maskanda','Muktagachha','Mymensingh Sadar','Nandail','Phulpur','Seedstore','Square Masterbari','Tarakanda','Town Hall Area','Trishal'],
  Netrokona:      ['Atpara','Barhatta','Durgapur','Kalmakanda','Kendua','Khaliajuri','Madan','Mohanganj','Netrokona Sadar','Purbadhala'],
  Sherpur:        ['Jhenaigati','Nakla','Nalitabari','Sherpur Sadar','Sreebardi'],
};

// Count total areas
const BD_TOTAL_AREAS = Object.values(BD_AREAS).reduce((s, a) => s + a.length, 0);

// ── Types ─────────────────────────────────────────────────────────────────────
interface RateGroup { id: string; store: string; name: string; base: number; additional: number; weightSlabs?: string; }
interface Assignment { key: string; store: string; division: string; district: string; area: string; areaId: string; groupId: string; groupName?: string; }
interface Shipment {
  _id: string; shipmentNumber: string; orderId: string | number; sourceType: string; sourceLabel: string;
  status: string; courierName: string; trackingNumber: string; estimatedDaysMin: number; estimatedDaysMax: number;
  deliveryCharge: number; totalWeightKg: number; deliveredAt: string; createdAt: string; items?: any[]; trackingEvents?: any[];
}
interface Courier { _id: string; name: string; }
interface GroceryArea { _id: string; name: string; nameBn: string; isActive: boolean; }
interface GroceryDistrict { _id: string; name: string; nameBn: string; isActive: boolean; areas: GroceryArea[]; }
interface ShippingPolicy {
  _id: string; sourceType: string; divisionId: number; districtId: number; areaName: string;
  isInsideCity: boolean; baseWeightKg: number; baseCharge: number; extraChargePerKg: number;
  estimatedDaysMin: number; estimatedDaysMax: number; freeDeliveryThreshold: number | null; isActive: boolean;
}

// ── Status configs ─────────────────────────────────────────────────────────────
const SHIPPING_STATUS: Record<string, { label: string; className: string }> = {
  confirmed:        { label: 'Confirmed',        className: 'bg-blue-500/20 text-blue-400' },
  processing:       { label: 'Processing',       className: 'bg-primary/20 text-primary' },
  shipped:          { label: 'Shipped',          className: 'bg-chart-4/20 text-chart-4' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-cyan-500/20 text-cyan-400' },
  delivered:        { label: 'Delivered',        className: 'bg-success/20 text-success' },
};
const SHIPMENT_STATUS: Record<string, { label: string; className: string }> = {
  pending:          { label: 'Pending',          className: 'bg-warning/20 text-warning' },
  confirmed:        { label: 'Confirmed',        className: 'bg-blue-500/20 text-blue-400' },
  processing:       { label: 'Processing',       className: 'bg-chart-1/20 text-chart-1' },
  ready_for_pickup: { label: 'Ready for Pickup', className: 'bg-chart-4/20 text-chart-4' },
  picked_up:        { label: 'Picked Up',        className: 'bg-chart-3/20 text-chart-3' },
  in_transit:       { label: 'In Transit',       className: 'bg-chart-2/20 text-chart-2' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-cyan-500/20 text-cyan-400' },
  delivered:        { label: 'Delivered',        className: 'bg-success/20 text-success' },
  failed_delivery:  { label: 'Failed Delivery',  className: 'bg-destructive/20 text-destructive' },
  returned:         { label: 'Returned',         className: 'bg-muted text-muted-foreground' },
  cancelled:        { label: 'Cancelled',        className: 'bg-muted text-muted-foreground' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const mkGroupId  = (name: string) => `${slugify('main')}_${slugify(name)}_${Date.now()}`;
const mkAssignKey = (div: string, dist: string, area: string) =>
  `main|${div}|${dist}|${area}`.replace(/\s+/g, '_');

type Tab = 'shipments' | 'orders' | 'rate-groups' | 'assignments' | 'areas' | 'assigned-rates' | 'methods' | 'grocery' | 'policies';

export default function Shipping() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('shipments');

  // ── Shipping Orders (old system) ──────────────────────────────────────────
  const [stats, setStats]       = useState<ShippingStats | null>(null);
  const [orders, setOrders]     = useState<ShippingOrder[]>([]);
  const [areas, setAreas]       = useState<DeliveryArea[]>([]);
  const [methods, setMethods]   = useState<ShippingMethod[]>([]);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaDialogOpen, setAreaDialogOpen]     = useState(false);
  const [editingArea, setEditingArea]           = useState<DeliveryArea | null>(null);
  const [areaForm, setAreaForm] = useState({ name: '', city: '', deliveryCharge: 0, freeDeliveryThreshold: 0, estimatedDeliveryDays: 1, postalCodes: '' });
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod]       = useState<ShippingMethod | null>(null);
  const [methodForm, setMethodForm] = useState({ name: '', type: 'flat' as ShippingMethod['type'], baseCharge: 0, freeThreshold: 0, isActive: true });

  // ── Shipments (full tracking) ──────────────────────────────────────────────
  const [shipments, setShipments]   = useState<Shipment[]>([]);
  const [couriers, setCouriers]     = useState<Courier[]>([]);
  const [shipSearch, setShipSearch] = useState('');
  const [shipStatus, setShipStatus] = useState('all');
  const [shipPage, setShipPage]     = useState(1);
  const [shipTotal, setShipTotal]   = useState(0);
  const [viewShipment, setViewShipment] = useState<Shipment | null>(null);
  const [viewOpen, setViewOpen]         = useState(false);
  const [updateOpen, setUpdateOpen]     = useState(false);
  const [updateShipment, setUpdateShipment] = useState<Shipment | null>(null);
  const [updateForm, setUpdateForm] = useState({ status: '', courier_id: '', courier_name: '', tracking_number: '', description: '' });

  // ── Rate Groups ────────────────────────────────────────────────────────────
  const [groups, setGroups]         = useState<RateGroup[]>([]);
  const [groupsSaving, setGroupsSaving] = useState(false);
  const [newGroup, setNewGroup]     = useState({ name: '', base: '', additional: '', slabs: '', store: 'Dhaka' });

  // ── Fee Preview ────────────────────────────────────────────────────────────
  const [prevDiv, setPrevDiv]   = useState('');
  const [prevDist, setPrevDist] = useState('');
  const [prevArea, setPrevArea] = useState('');
  const [prevResult, setPrevResult] = useState<{ charge: number; matched: boolean; groupName?: string } | null>(null);
  const [prevLoading, setPrevLoading] = useState(false);

  // ── Area Assignments ───────────────────────────────────────────────────────
  const [assignments, setAssignments]   = useState<Assignment[]>([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [selDiv, setSelDiv]   = useState('');
  const [selDist, setSelDist] = useState('');
  const [selArea, setSelArea] = useState('');
  const [selGroup, setSelGroup] = useState('');

  // ── Grocery Coverage ───────────────────────────────────────────────────────
  const [groceryDistricts, setGroceryDistricts] = useState<GroceryDistrict[]>([]);
  const [gAreaDialogOpen, setGAreaDialogOpen]   = useState(false);
  const [gAreaForm, setGAreaForm] = useState({ district_id: '', name: '', name_bn: '' });
  const [gEditArea, setGEditArea] = useState<(GroceryArea & { districtId: string }) | null>(null);

  // ── Shipping Policies ──────────────────────────────────────────────────────
  const [policies, setPolicies]             = useState<ShippingPolicy[]>([]);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({ area_name: '', is_inside_city: false, base_weight_kg: '1', base_charge: '100', extra_charge_per_kg: '30', estimated_days_min: '1', estimated_days_max: '3', free_delivery_threshold: '' });
  const [editPolicy, setEditPolicy] = useState<ShippingPolicy | null>(null);

  const [loading, setLoading] = useState(false);

  // ── BD Area Management (Delivery Areas tab) ────────────────────────────────
  const [areaStatuses, setAreaStatuses]       = useState<Record<string, 'Enable' | 'Disable'>>({});
  const [selBdAreas, setSelBdAreas]           = useState<Set<string>>(new Set());
  const [areasPage, setAreasPage]             = useState(1);
  const [areasPageSize, setAreasPageSize]     = useState(25);
  const [areasSearch, setAreasSearch]         = useState('');
  const [areasFilterDiv, setAreasFilterDiv]   = useState('');
  const [areasFilterDist, setAreasFilterDist] = useState('');
  const [bdAreaFormOpen, setBdAreaFormOpen]   = useState(false);
  const [bdAreaForm, setBdAreaForm]           = useState({ division: 'Dhaka', district: '', districtNew: '', area: '', editKey: '' });

  // ── Assignment checkbox view state ─────────────────────────────────────────
  const [assignStore2, setAssignStore2]   = useState('Dhaka');
  const [assignDiv2, setAssignDiv2]       = useState('');
  const [assignDist2, setAssignDist2]     = useState('');
  const [assignGroup2, setAssignGroup2]   = useState('');
  const [assignSearch2, setAssignSearch2] = useState('');

  // ── Assigned Rates tab filters ─────────────────────────────────────────────
  const [arStore, setArStore]   = useState('');
  const [arGroup, setArGroup]   = useState('');
  const [arSearch, setArSearch] = useState('');
  const [arPage, setArPage]     = useState(1);
  const [arSelKeys, setArSelKeys] = useState<Set<string>>(new Set());

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadShippingOrders = useCallback(async () => {
    const [sRes, aRes, oRes, mRes] = await Promise.allSettled([
      shippingApi.getStats(), shippingApi.getAreas(), shippingApi.getOrders(), shippingApi.getMethods(),
    ]);
    if (sRes.status === 'fulfilled') setStats(sRes.value);
    if (aRes.status === 'fulfilled') setAreas(aRes.value);
    if (oRes.status === 'fulfilled') setOrders(oRes.value);
    if (mRes.status === 'fulfilled') setMethods(mRes.value);
  }, []);

  const loadShipments = useCallback(async () => {
    const params: any = { page: shipPage, limit: 20 };
    if (shipStatus !== 'all') params.status = shipStatus;
    const [sRes, cRes] = await Promise.allSettled([
      api.get('/shipments', { params }), api.get('/couriers'),
    ]);
    if (sRes.status === 'fulfilled') { setShipments(sRes.value.data.shipments || []); setShipTotal(sRes.value.data.total || 0); }
    if (cRes.status === 'fulfilled') setCouriers(cRes.value.data || []);
  }, [shipPage, shipStatus]);

  const loadRates = useCallback(async () => {
    const [gRes, aRes] = await Promise.allSettled([
      api.get('/delivery-rates/rate-groups'), api.get('/delivery-rates/assignments'),
    ]);
    if (gRes.status === 'fulfilled') setGroups(gRes.value.data);
    if (aRes.status === 'fulfilled') setAssignments(aRes.value.data);
  }, []);

  const loadCoverage = useCallback(async () => {
    const [gRes, pRes] = await Promise.allSettled([
      api.get('/delivery-coverage/grocery/districts'),
      api.get('/delivery-coverage/shipping-policies'),
    ]);
    if (gRes.status === 'fulfilled') setGroceryDistricts(gRes.value.data || []);
    if (pRes.status === 'fulfilled') setPolicies(pRes.value.data || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([loadShippingOrders(), loadShipments(), loadRates(), loadCoverage()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadShipments(); }, [shipPage, shipStatus]);

  // ── Orders ──────────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const name = (o.customerId && typeof o.customerId === 'object') ? (o.customerId as any).name : '';
    return (!search || name.toLowerCase().includes(search.toLowerCase()) || o.orderNumber?.toLowerCase().includes(search.toLowerCase()))
      && (statusFilter === 'all' || o.status === statusFilter);
  });
  const updateOrderStatus = async (id: string, status: string) => {
    try { await shippingApi.updateOrderStatus(id, status); toast.success('Status updated'); loadShippingOrders(); }
    catch { toast.error('Failed'); }
  };

  // ── Areas ───────────────────────────────────────────────────────────────────
  const saveArea = async () => {
    try {
      const data = { ...areaForm, postalCodes: areaForm.postalCodes.split(',').map(s => s.trim()).filter(Boolean) };
      if (editingArea) { await shippingApi.updateArea(editingArea._id, data); toast.success('Area updated'); }
      else { await shippingApi.createArea(data); toast.success('Area created'); }
      setAreaDialogOpen(false); setEditingArea(null); loadShippingOrders();
    } catch { toast.error('Failed to save area'); }
  };
  const deleteArea = async (id: string) => {
    if (!confirm('Delete this delivery area?')) return;
    try { await shippingApi.deleteArea(id); toast.success('Deleted'); loadShippingOrders(); } catch { toast.error('Failed'); }
  };
  const openEditArea = (a: DeliveryArea) => {
    setEditingArea(a);
    setAreaForm({ name: a.name, city: a.city, deliveryCharge: a.deliveryCharge, freeDeliveryThreshold: a.freeDeliveryThreshold, estimatedDeliveryDays: a.estimatedDeliveryDays, postalCodes: a.postalCodes.join(', ') });
    setAreaDialogOpen(true);
  };

  // ── Methods ─────────────────────────────────────────────────────────────────
  const saveMethod = async () => {
    try {
      if (editingMethod) { await shippingApi.updateMethod(editingMethod._id, methodForm); toast.success('Method updated'); }
      else { await shippingApi.createMethod(methodForm); toast.success('Method created'); }
      setMethodDialogOpen(false); loadShippingOrders();
    } catch { toast.error('Failed to save method'); }
  };
  const deleteMethod = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await shippingApi.deleteMethod(id); toast.success('Deleted'); loadShippingOrders(); } catch { toast.error('Failed'); }
  };
  const openEditMethod = (m: ShippingMethod) => {
    setEditingMethod(m);
    setMethodForm({ name: m.name, type: m.type, baseCharge: m.baseCharge, freeThreshold: m.freeThreshold || 0, isActive: m.isActive });
    setMethodDialogOpen(true);
  };

  // ── Shipments ───────────────────────────────────────────────────────────────
  const openViewShipment = async (s: Shipment) => {
    try { const { data } = await api.get(`/shipments/${s._id}`); setViewShipment(data); setViewOpen(true); }
    catch { toast.error('Failed to load details'); }
  };
  const openUpdateShipment = (s: Shipment) => {
    setUpdateShipment(s);
    setUpdateForm({ status: s.status, courier_id: '', courier_name: s.courierName || '', tracking_number: s.trackingNumber || '', description: '' });
    setUpdateOpen(true);
  };
  const submitShipmentUpdate = async () => {
    if (!updateShipment) return;
    try { await api.put(`/shipments/${updateShipment._id}/status`, updateForm); toast.success('Shipment updated'); setUpdateOpen(false); loadShipments(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const filteredShipments = shipments.filter(s =>
    !shipSearch || s.shipmentNumber?.toLowerCase().includes(shipSearch.toLowerCase()) ||
    String(s.orderId).includes(shipSearch) || s.trackingNumber?.toLowerCase().includes(shipSearch.toLowerCase())
  );

  // ── Rate Groups ──────────────────────────────────────────────────────────────
  const addGroup = () => {
    const name = newGroup.name.trim();
    if (!name) return toast.error('Group name required');
    setGroups(g => [...g, { id: mkGroupId(name), store: newGroup.store || 'Dhaka', name, base: parseFloat(newGroup.base) || 0, additional: parseFloat(newGroup.additional) || 0, weightSlabs: newGroup.slabs.trim() || undefined }]);
    setNewGroup({ name: '', base: '', additional: '', slabs: '', store: newGroup.store });
  };
  const saveGroups = async () => {
    setGroupsSaving(true);
    try { await api.post('/delivery-rates/rate-groups/sync', groups); toast.success('Rate groups saved'); loadRates(); }
    catch { toast.error('Failed to save'); } finally { setGroupsSaving(false); }
  };
  const previewFee = async () => {
    if (!prevDist) return toast.error('Select a district first');
    setPrevLoading(true); setPrevResult(null);
    try {
      const params = new URLSearchParams({ district: prevDist });
      if (prevArea) params.append('area', prevArea);
      const { data } = await api.get(`/delivery-rates/charge?${params}`);
      setPrevResult(data);
    } catch { setPrevResult({ charge: 0, matched: false }); }
    finally { setPrevLoading(false); }
  };

  // ── Area Assignments ─────────────────────────────────────────────────────────
  const addAssignment = () => {
    if (!selDist) return toast.error('Select a district');
    if (!selGroup) return toast.error('Select a rate group');
    const key = mkAssignKey(selDiv, selDist, selArea);
    if (assignments.find(a => a.key === key)) return toast.error('Already assigned');
    const group = groups.find(g => g.id === selGroup);
    setAssignments(a => [...a, { key, store: 'main', division: selDiv, district: selDist, area: selArea, areaId: selArea || selDist, groupId: selGroup, groupName: group?.name }]);
    setSelArea('');
  };
  const saveAssignments = async () => {
    setAssignSaving(true);
    try { await api.post('/delivery-rates/assignments/sync', assignments); toast.success('Assignments saved'); loadRates(); }
    catch { toast.error('Failed'); } finally { setAssignSaving(false); }
  };
  const districtList  = selDiv  ? (BD_DISTRICTS[selDiv]  || []) : [];
  const areaList      = selDist ? (BD_AREAS[selDist]     || []) : [];

  // ── Grocery Coverage ─────────────────────────────────────────────────────────
  const toggleGroceryArea = async (area: GroceryArea) => {
    try { await api.put(`/delivery-coverage/grocery/areas/${area._id}`, { is_active: area.isActive ? 0 : 1 }); toast.success('Updated'); loadCoverage(); }
    catch { toast.error('Failed'); }
  };
  const saveGroceryArea = async () => {
    try {
      if (gEditArea) { await api.put(`/delivery-coverage/grocery/areas/${gEditArea._id}`, { name: gAreaForm.name, name_bn: gAreaForm.name_bn }); toast.success('Area updated'); }
      else { await api.post('/delivery-coverage/grocery/areas', gAreaForm); toast.success('Area added'); }
      setGAreaDialogOpen(false); loadCoverage();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  // ── Shipping Policies ─────────────────────────────────────────────────────────
  const savePolicy = async () => {
    try {
      const payload = { ...policyForm, base_weight_kg: Number(policyForm.base_weight_kg), base_charge: Number(policyForm.base_charge), extra_charge_per_kg: Number(policyForm.extra_charge_per_kg), estimated_days_min: Number(policyForm.estimated_days_min), estimated_days_max: Number(policyForm.estimated_days_max), free_delivery_threshold: policyForm.free_delivery_threshold ? Number(policyForm.free_delivery_threshold) : null, is_inside_city: policyForm.is_inside_city ? 1 : 0 };
      if (editPolicy) { await api.put(`/delivery-coverage/shipping-policies/${editPolicy._id}`, payload); toast.success('Policy updated'); }
      else { await api.post('/delivery-coverage/shipping-policies', { source_type: 'sholok', source_id: 1, ...payload }); toast.success('Policy created'); }
      setPolicyDialogOpen(false); loadCoverage();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const openEditPolicy = (p: ShippingPolicy) => {
    setEditPolicy(p);
    setPolicyForm({ area_name: p.areaName || '', is_inside_city: p.isInsideCity, base_weight_kg: String(p.baseWeightKg), base_charge: String(p.baseCharge), extra_charge_per_kg: String(p.extraChargePerKg), estimated_days_min: String(p.estimatedDaysMin), estimated_days_max: String(p.estimatedDaysMax), free_delivery_threshold: p.freeDeliveryThreshold ? String(p.freeDeliveryThreshold) : '' });
    setPolicyDialogOpen(true);
  };

  // ── BD Area flat list (memoized) ──────────────────────────────────────────
  const allBdAreas = useMemo(() => {
    const list: { div: string; dist: string; area: string; key: string }[] = [];
    BD_DIVISIONS.forEach(div => {
      (BD_DISTRICTS[div] || []).forEach(dist => {
        (BD_AREAS[dist] || []).forEach(area => {
          list.push({ div, dist, area, key: `D-${div}-${dist}-${area}` });
        });
      });
    });
    return list;
  }, []);

  const filteredBdAreas = useMemo(() => allBdAreas.filter(a => {
    if (areasFilterDiv && a.div !== areasFilterDiv) return false;
    if (areasFilterDist && a.dist !== areasFilterDist) return false;
    if (areasSearch) { const q = areasSearch.toLowerCase(); if (!a.dist.toLowerCase().includes(q) && !a.area.toLowerCase().includes(q)) return false; }
    return true;
  }), [allBdAreas, areasFilterDiv, areasFilterDist, areasSearch]);

  const areasTotalPages = Math.ceil(filteredBdAreas.length / areasPageSize) || 1;
  const pagedBdAreas    = filteredBdAreas.slice((areasPage - 1) * areasPageSize, areasPage * areasPageSize);

  const toggleBdArea = (key: string) => setSelBdAreas(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const bulkSetStatus = (status: 'Enable' | 'Disable') => {
    setAreaStatuses(prev => { const n = { ...prev }; selBdAreas.forEach(k => { n[k] = status; }); return n; });
  };
  const exportAreasCsv = () => {
    const rows = [['Division','District','Area','Status']];
    filteredBdAreas.forEach(a => rows.push([a.div, a.dist, a.area, areaStatuses[a.key] || 'Enable']));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'delivery_areas.csv'; link.click();
    URL.revokeObjectURL(url);
  };

  const calcCharge = (g: RateGroup, kg: number) => {
    if (g.weightSlabs) {
      const slabs = g.weightSlabs.split(',').map(s => { const [m, p] = s.trim().split(':'); return { maxKg: parseFloat(m), price: parseFloat(p) }; }).filter(s => !isNaN(s.maxKg) && !isNaN(s.price));
      const slab = slabs.find(s => kg <= s.maxKg);
      if (slab) return slab.price;
    }
    return g.base + g.additional * Math.max(0, kg - 1);
  };

  const assignFilteredAreas = useMemo(() => allBdAreas.filter(a => {
    if (assignDiv2 && a.div !== assignDiv2) return false;
    if (assignDist2 && a.dist !== assignDist2) return false;
    if (assignSearch2) { const q = assignSearch2.toLowerCase(); if (!a.area.toLowerCase().includes(q) && !a.dist.toLowerCase().includes(q)) return false; }
    return true;
  }), [allBdAreas, assignDiv2, assignDist2, assignSearch2]);

  const isAreaAssigned = (key: string) => assignments.some(a => a.key === key && a.store === assignStore2 && a.groupId === assignGroup2);
  const toggleAreaAssign = (item: { div: string; dist: string; area: string; key: string }) => {
    const existing = assignments.find(a => a.key === item.key && a.store === assignStore2 && a.groupId === assignGroup2);
    if (existing) {
      setAssignments(as => as.filter(a => !(a.key === item.key && a.store === assignStore2 && a.groupId === assignGroup2)));
    } else {
      if (!assignGroup2) return toast.error('Select a Rate Group first');
      const group = groups.find(g => g.id === assignGroup2);
      setAssignments(as => [...as, { key: item.key, store: assignStore2, division: item.div, district: item.dist, area: item.area, areaId: item.key, groupId: assignGroup2, groupName: group?.name }]);
    }
  };

  const filteredAssignments = useMemo(() => assignments.filter(a => {
    if (arStore && a.store !== arStore) return false;
    if (arGroup && a.groupId !== arGroup) return false;
    if (arSearch) { const q = arSearch.toLowerCase(); if (!a.district.toLowerCase().includes(q) && !a.area.toLowerCase().includes(q) && !(a.groupName || '').toLowerCase().includes(q)) return false; }
    return true;
  }), [assignments, arStore, arGroup, arSearch]);

  const arTotalPages = Math.ceil(filteredAssignments.length / 25) || 1;
  const pagedAssignments = filteredAssignments.slice((arPage - 1) * 25, arPage * 25);

  // ── Tab button helper ─────────────────────────────────────────────────────────
  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${tab === id ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('shippingManagement')}</h1>
          <p className="text-muted-foreground">{t('manageDeliveryAreas')}</p>
        </div>
        <Button variant="outline" onClick={() => { loadShippingOrders(); loadShipments(); loadRates(); loadCoverage(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />{t('refresh')}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('pendingShipment')}</p><p className="text-2xl font-bold">{stats.pendingShipment}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Truck className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">{t('shippedInTransit')}</p><p className="text-2xl font-bold">{stats.shippedOrders + stats.outForDelivery}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">{t('delivered')}</p><p className="text-2xl font-bold">{stats.deliveredOrders}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">{t('activeAreas')}</p><p className="text-2xl font-bold">{stats.activeAreas}</p></div></CardContent></Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        <TabBtn id="shipments"     label="Shipments" />
        <TabBtn id="orders"        label="Orders" />
        <TabBtn id="areas"         label="⌖ Delivery Areas" />
        <TabBtn id="rate-groups"   label="৳ Rate Groups" />
        <TabBtn id="assignments"   label="⇄ Area Assignment" />
        <TabBtn id="assigned-rates" label="▤ Assigned Zone Rates" />
        <TabBtn id="methods"       label="Methods" />
        <TabBtn id="grocery"       label="Grocery" />
        <TabBtn id="policies"      label="Policies" />
      </div>

      {/* ════ SHIPMENTS TAB ════════════════════════════════════════════════ */}
      {tab === 'shipments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[{ label: 'Total', count: shipTotal, icon: Package, color: 'text-primary' }, { label: 'Pending', count: shipments.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-warning' }, { label: 'In Transit', count: shipments.filter(s => s.status === 'in_transit').length, icon: Truck, color: 'text-chart-2' }, { label: 'Delivered', count: shipments.filter(s => s.status === 'delivered').length, icon: CheckCircle, color: 'text-success' }].map(({ label, count, icon: Icon, color }) => (
              <Card key={label}><CardContent className="pt-4 pb-4"><div className="flex items-center gap-3"><Icon className={`w-7 h-7 ${color}`} /><div><p className="text-xl font-bold">{count}</p><p className="text-muted-foreground text-xs">{label}</p></div></div></CardContent></Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search shipments..." className="pl-9" value={shipSearch} onChange={e => setShipSearch(e.target.value)} /></div>
                <Select value={shipStatus} onValueChange={v => { setShipStatus(v); setShipPage(1); }}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem>{Object.keys(SHIPMENT_STATUS).map(s => <SelectItem key={s} value={s}>{SHIPMENT_STATUS[s].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Shipment #</TableHead><TableHead>Order</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Courier</TableHead><TableHead>Tracking</TableHead><TableHead>Charge</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredShipments.map(s => (
                    <TableRow key={s._id}>
                      <TableCell className="font-mono text-sm font-medium">{s.shipmentNumber}</TableCell>
                      <TableCell>#{s.orderId}</TableCell>
                      <TableCell><Badge variant="outline">{s.sourceType}{s.sourceLabel ? ` · ${s.sourceLabel}` : ''}</Badge></TableCell>
                      <TableCell><Badge className={SHIPMENT_STATUS[s.status]?.className || 'bg-muted text-muted-foreground'}>{SHIPMENT_STATUS[s.status]?.label || s.status}</Badge></TableCell>
                      <TableCell className="text-sm">{s.courierName || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{s.trackingNumber || '—'}</TableCell>
                      <TableCell>৳{s.deliveryCharge?.toLocaleString()}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Button size="sm" variant="outline" onClick={() => openViewShipment(s)}><Eye className="w-3 h-3" /></Button><Button size="sm" variant="outline" onClick={() => openUpdateShipment(s)}><Edit className="w-3 h-3" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                  {filteredShipments.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No shipments found</TableCell></TableRow>}
                </TableBody>
              </Table>
              {shipTotal > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={shipPage === 1} onClick={() => setShipPage(p => p - 1)}>Previous</Button>
                  <span className="py-2 text-sm text-muted-foreground">Page {shipPage} of {Math.ceil(shipTotal / 20)}</span>
                  <Button variant="outline" size="sm" disabled={shipPage * 20 >= shipTotal} onClick={() => setShipPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ ORDERS TAB ════════════════════════════════════════════════════ */}
      {tab === 'orders' && (
        <Card className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>{t('shipmentOrders')}</CardTitle>
              <div className="flex gap-2">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={t('searchOrders')} className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} /></div>
                <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  {Object.keys(SHIPPING_STATUS).map(s => <option key={s} value={s}>{SHIPPING_STATUS[s].label}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('order')}</TableHead><TableHead>{t('customer')}</TableHead><TableHead>{t('total')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('date')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const customerName = (order.customerId && typeof order.customerId === 'object') ? (order.customerId as any).name : 'N/A';
                  const cfg = SHIPPING_STATUS[order.status] || { label: order.status, className: 'bg-muted text-muted-foreground' };
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>৳{Number(order.total || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge className={cfg.className}>{cfg.label}</Badge></TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <select className="bg-background border border-border rounded px-2 py-1 text-xs" value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)}>
                          {Object.entries(SHIPPING_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('noShipmentOrders')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ════ RATE GROUPS TAB ══════════════════════════════════════════════ */}
      {tab === 'rate-groups' && (
        <div className="space-y-4">

          {/* Coverage Summary */}
          {(() => {
            const totalAreas = BD_TOTAL_AREAS;
            const assigned = new Set(assignments.map(a => a.key)).size;
            const pct = totalAreas ? Math.round(assigned / totalAreas * 100) : 0;
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Areas (BD)', val: totalAreas, color: 'text-muted-foreground' },
                  { label: 'Assigned', val: assigned, color: 'text-primary' },
                  { label: 'Unassigned', val: totalAreas - assigned, color: 'text-warning' },
                  { label: 'Coverage', val: `${pct}%`, color: pct === 100 ? 'text-success' : pct > 50 ? 'text-primary' : 'text-warning' },
                ].map(({ label, val, color }) => (
                  <Card key={label}><CardContent className="pt-4 pb-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{val}</p>
                  </CardContent></Card>
                ))}
              </div>
            );
          })()}

          {/* Add Group form */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4">Add New Rate Group</h2>
            <p className="text-xs text-muted-foreground mb-3">Create up to 17 reusable delivery charge groups by store location. Only groups you create can be assigned.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Store Location</label>
                <select value={newGroup.store || 'Dhaka'} onChange={e => setNewGroup(g => ({ ...g, store: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                  {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Group Name *</label><Input value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} placeholder="e.g. Inside Dhaka" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Base Rate — First 1kg (৳) *</label><Input type="number" min="0" value={newGroup.base} onChange={e => setNewGroup(g => ({ ...g, base: e.target.value }))} placeholder="60" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Additional / kg (৳)</label><Input type="number" min="0" value={newGroup.additional} onChange={e => setNewGroup(g => ({ ...g, additional: e.target.value }))} placeholder="20" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Weight Slabs <span className="font-normal">(optional)</span></label><Input value={newGroup.slabs} onChange={e => setNewGroup(g => ({ ...g, slabs: e.target.value }))} placeholder="1:60, 2:80, 5:120" /></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Formula: <code className="bg-muted px-1 rounded text-xs">Base + Additional × (KG − 1)</code>. Weight Slabs format: <code className="bg-muted px-1 rounded text-xs">maxKg:price, maxKg:price</code> — overrides formula when set.</p>
            <Button onClick={addGroup} className="mt-3"><Plus className="w-4 h-4 mr-2" />Add Group</Button>
          </div>

          {/* Groups table */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">{groups.length} Rate Groups · {BD_TOTAL_AREAS} areas · connects to checkout automatically</CardTitle>
              <Button size="sm" onClick={saveGroups} disabled={groupsSaving}><Save className="w-4 h-4 mr-1" />{groupsSaving ? 'Saving…' : 'Save All'}</Button>
            </CardHeader>
            <CardContent className="pt-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Base / 1kg (৳)</TableHead><TableHead>Extra/kg (৳)</TableHead><TableHead>Weight Slabs</TableHead><TableHead>Assigned Areas</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {groups.map(g => {
                    const assignedCount = assignments.filter(a => a.groupId === g.id).length;
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.name}</TableCell>
                        <TableCell><Input type="number" min="0" value={g.base} className="w-24 h-8 text-sm" onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, base: parseFloat(e.target.value) || 0 } : x))} /></TableCell>
                        <TableCell><Input type="number" min="0" value={g.additional} className="w-24 h-8 text-sm" onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, additional: parseFloat(e.target.value) || 0 } : x))} /></TableCell>
                        <TableCell><Input value={g.weightSlabs || ''} className="w-40 h-8 text-xs font-mono" placeholder="1:60, 2:80…" onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, weightSlabs: e.target.value } : x))} /></TableCell>
                        <TableCell><Badge variant="outline">{assignedCount} area{assignedCount !== 1 ? 's' : ''}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => setGroups(gs => gs.filter(x => x.id !== g.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                  {groups.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No rate groups yet. Add one above.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fee Preview */}
          <Card className="border-border border-dashed">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
                Checkout Fee Preview — Test what a customer will pay
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">Select a location below to see exactly which Rate Group matches and what delivery fee the customer will see at checkout.</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Division</label>
                  <div className="relative">
                    <select value={prevDiv} onChange={e => { setPrevDiv(e.target.value); setPrevDist(''); setPrevArea(''); setPrevResult(null); }} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8">
                      <option value="">All</option>
                      {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">District *</label>
                  <div className="relative">
                    <select value={prevDist} onChange={e => { setPrevDist(e.target.value); setPrevArea(''); setPrevResult(null); }} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8">
                      <option value="">Select</option>
                      {(prevDiv ? BD_DISTRICTS[prevDiv] || [] : Object.values(BD_DISTRICTS).flat()).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Area (optional)</label>
                  <div className="relative">
                    <select value={prevArea} onChange={e => { setPrevArea(e.target.value); setPrevResult(null); }} disabled={!prevDist} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8 disabled:opacity-50">
                      <option value="">All areas</option>
                      {(BD_AREAS[prevDist] || []).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <Button onClick={previewFee} disabled={prevLoading || !prevDist} className="w-full">
                  {prevLoading ? 'Calculating…' : 'Check Fee'}
                </Button>
              </div>
              {prevResult && (
                <div className={`mt-3 p-4 rounded-lg border flex items-center gap-4 ${prevResult.matched ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{prevResult.matched ? `৳${prevResult.charge} delivery fee` : 'No matching rate group — default fee applies'}</p>
                    {prevResult.matched && prevResult.groupName && <p className="text-xs text-muted-foreground mt-0.5">Matched group: <strong>{prevResult.groupName}</strong></p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Location: {[prevDiv, prevDist, prevArea].filter(Boolean).join(' › ')}</p>
                  </div>
                  <div className={`text-3xl font-bold ${prevResult.matched ? 'text-success' : 'text-warning'}`}>
                    {prevResult.matched ? `৳${prevResult.charge}` : '—'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ AREA ASSIGNMENTS TAB ══════════════════════════════════════════ */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4">Delivery Area Assignment</h2>
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">First create rate groups in the "৳ Rate Groups" tab.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Store Location</label>
                    <select value={assignStore2} onChange={e => setAssignStore2(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Division / Region</label>
                    <select value={assignDiv2} onChange={e => { setAssignDiv2(e.target.value); setAssignDist2(''); }} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      <option value="">All Divisions</option>
                      {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">City / District</label>
                    <select value={assignDist2} onChange={e => setAssignDist2(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      <option value="">All Districts</option>
                      {(assignDiv2 ? BD_DISTRICTS[assignDiv2] || [] : Object.values(BD_DISTRICTS).flat()).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Rate Group *</label>
                    <select value={assignGroup2} onChange={e => setAssignGroup2(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                      <option value="">Select Rate Group</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name} (৳{g.base})</option>)}
                    </select>
                  </div>
                </div>

                {/* Area checkbox list */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border flex-wrap gap-2">
                    <span className="text-sm font-medium">Saved Delivery Areas ({assignFilteredAreas.length})</span>
                    <div className="flex gap-2 flex-wrap">
                      <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input className="pl-8 h-7 text-xs w-48" placeholder="Search areas…" value={assignSearch2} onChange={e => setAssignSearch2(e.target.value)} /></div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { if (!assignGroup2) return toast.error('Select a Rate Group first'); assignFilteredAreas.forEach(item => { if (!isAreaAssigned(item.key)) toggleAreaAssign(item); }); }}>Select All</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { assignFilteredAreas.forEach(item => { if (isAreaAssigned(item.key)) toggleAreaAssign(item); }); }}>Clear</Button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {assignFilteredAreas.length === 0 ? (
                      <p className="text-center py-6 text-sm text-muted-foreground">No areas match the current filters.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {assignFilteredAreas.map(item => (
                          <label key={item.key} className="flex items-center gap-2 px-4 py-2 hover:bg-muted/20 cursor-pointer border-b border-border/30 last:border-0">
                            <input type="checkbox" checked={isAreaAssigned(item.key)} onChange={() => toggleAreaAssign(item)} className="w-4 h-4 rounded" />
                            <span className="text-sm">{item.area}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{item.dist}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">{assignments.filter(a => a.store === assignStore2 && a.groupId === assignGroup2).length} areas assigned to this group</span>
                  <Button size="sm" onClick={saveAssignments} disabled={assignSaving}><Save className="w-4 h-4 mr-1" />{assignSaving ? 'Saving…' : 'Save Assignments'}</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════ DELIVERY AREAS TAB ════════════════════════════════════════════ */}
      {tab === 'areas' && (
        <div className="space-y-4">
          {/* Header + Add button */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold">Delivery Areas</h2>
              <p className="text-sm text-muted-foreground">{BD_TOTAL_AREAS} saved Bangladesh delivery areas. Custom districts are also supported.</p>
            </div>
            <Button onClick={() => { setBdAreaForm({ division: 'Dhaka', district: '', districtNew: '', area: '', editKey: '' }); setBdAreaFormOpen(v => !v); }}>
              <Plus className="w-4 h-4 mr-2" />Add Delivery Area
            </Button>
          </div>

          {/* Add area inline form */}
          {bdAreaFormOpen && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Division / Region</label>
                  <select value={bdAreaForm.division} onChange={e => setBdAreaForm(f => ({ ...f, division: e.target.value, district: '' }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                    {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">City / District</label>
                  <select value={bdAreaForm.district} onChange={e => setBdAreaForm(f => ({ ...f, district: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background mb-1">
                    <option value="">Select existing…</option>
                    {(BD_DISTRICTS[bdAreaForm.division] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <Input value={bdAreaForm.districtNew} onChange={e => setBdAreaForm(f => ({ ...f, districtNew: e.target.value }))} placeholder="…or enter new district" className="text-sm h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Zone / Area</label>
                  <Input value={bdAreaForm.area} onChange={e => setBdAreaForm(f => ({ ...f, area: e.target.value }))} placeholder="Enter delivery area" />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => { if (!bdAreaForm.area.trim()) return toast.error('Area name required'); setBdAreaFormOpen(false); toast.success('Area saved (local)'); }} className="flex-1">Save</Button>
                  <Button variant="outline" onClick={() => setBdAreaFormOpen(false)}>Cancel</Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">For a new Delivery Area, choose an existing City / District or enter a new one.</p>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Search</label>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search district or area..." className="pl-9" value={areasSearch} onChange={e => { setAreasSearch(e.target.value); setAreasPage(1); }} /></div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Division</label>
              <select value={areasFilterDiv} onChange={e => { setAreasFilterDiv(e.target.value); setAreasFilterDist(''); setAreasPage(1); }} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">All Divisions</option>
                {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">District</label>
              <select value={areasFilterDist} onChange={e => { setAreasFilterDist(e.target.value); setAreasPage(1); }} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">All Districts</option>
                {(areasFilterDiv ? BD_DISTRICTS[areasFilterDiv] || [] : Object.values(BD_DISTRICTS).flat()).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Bulk toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <span className="text-sm font-medium text-muted-foreground">{selBdAreas.size} selected</span>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => setSelBdAreas(new Set(pagedBdAreas.map(a => a.key)))}>Select All</Button>
              <Button size="sm" variant="outline" onClick={() => setSelBdAreas(new Set())}>Clear</Button>
              <Button size="sm" onClick={() => bulkSetStatus('Enable')} disabled={selBdAreas.size === 0}>Enable Selected</Button>
              <Button size="sm" variant="destructive" onClick={() => bulkSetStatus('Disable')} disabled={selBdAreas.size === 0}>Disable Selected</Button>
              <Button size="sm" variant="outline" onClick={exportAreasCsv}>Export CSV</Button>
            </div>
          </div>

          {/* Table */}
          <Card className="border-border">
            <CardContent className="pt-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"><input type="checkbox" checked={selBdAreas.size === pagedBdAreas.length && pagedBdAreas.length > 0} onChange={e => e.target.checked ? setSelBdAreas(new Set(pagedBdAreas.map(a => a.key))) : setSelBdAreas(new Set())} /></TableHead>
                    <TableHead>Region / Division</TableHead>
                    <TableHead>City / District</TableHead>
                    <TableHead>Zone / Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedBdAreas.map(a => {
                    const status = areaStatuses[a.key] || 'Enable';
                    const assignCount = assignments.filter(x => x.key === a.key).length;
                    return (
                      <TableRow key={a.key}>
                        <TableCell><input type="checkbox" checked={selBdAreas.has(a.key)} onChange={() => toggleBdArea(a.key)} /></TableCell>
                        <TableCell className="text-sm">{a.div}</TableCell>
                        <TableCell className="text-sm">{a.dist}</TableCell>
                        <TableCell className="text-sm font-medium">{a.area}</TableCell>
                        <TableCell>
                          <select value={status} onChange={e => setAreaStatuses(prev => ({ ...prev, [a.key]: e.target.value as 'Enable' | 'Disable' }))} className={`border rounded px-2 py-1 text-xs bg-background ${status === 'Enable' ? 'border-success/50 text-success' : 'border-destructive/50 text-destructive'}`}>
                            <option value="Enable">Enable</option>
                            <option value="Disable">Disable</option>
                          </select>
                        </TableCell>
                        <TableCell><span className="text-xs text-muted-foreground">Assignments: {assignCount}</span></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setBdAreaForm({ division: a.div, district: a.dist, districtNew: '', area: a.area, editKey: a.key }); setBdAreaFormOpen(true); }}>Edit Area</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info(`Edit District: ${a.dist}`)}>Edit District</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pagedBdAreas.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No areas match the current filters.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm text-muted-foreground">Showing page {areasPage} of {areasTotalPages} · {filteredBdAreas.length} records</span>
            <div className="flex items-center gap-3">
              <label className="text-sm text-muted-foreground flex items-center gap-2">Per page
                <select value={areasPageSize} onChange={e => { setAreasPageSize(Number(e.target.value)); setAreasPage(1); }} className="border border-border rounded px-2 py-1 text-sm bg-background ml-1">
                  <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
                </select>
              </label>
              <Button size="sm" variant="outline" disabled={areasPage === 1} onClick={() => setAreasPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={areasPage >= areasTotalPages} onClick={() => setAreasPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {/* ════ ASSIGNED ZONE RATES TAB ═══════════════════════════════════════ */}
      {tab === 'assigned-rates' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Store Location</label>
              <select value={arStore} onChange={e => { setArStore(e.target.value); setArPage(1); }} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">All Stores</option>
                {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Rate Group Filter</label>
              <select value={arGroup} onChange={e => { setArGroup(e.target.value); setArPage(1); }} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background">
                <option value="">All Rate Groups</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Search</label>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search store, group, district, area..." className="pl-9" value={arSearch} onChange={e => { setArSearch(e.target.value); setArPage(1); }} /></div>
            </div>
          </div>

          {/* Bulk toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">{arSelKeys.size} selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setArSelKeys(new Set(pagedAssignments.map(a => a.key)))}>Select All</Button>
              <Button size="sm" variant="outline" onClick={() => setArSelKeys(new Set())}>Clear</Button>
              <Button size="sm" variant="destructive" disabled={arSelKeys.size === 0} onClick={() => { setAssignments(as => as.filter(a => !arSelKeys.has(a.key))); setArSelKeys(new Set()); }}>Remove Selected</Button>
              <Button size="sm" onClick={saveAssignments} disabled={assignSaving}><Save className="w-4 h-4 mr-1" />{assignSaving ? 'Saving…' : 'Save All'}</Button>
            </div>
          </div>

          {/* Table */}
          <Card className="border-border">
            <CardContent className="pt-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"><input type="checkbox" checked={arSelKeys.size === pagedAssignments.length && pagedAssignments.length > 0} onChange={e => e.target.checked ? setArSelKeys(new Set(pagedAssignments.map(a => a.key))) : setArSelKeys(new Set())} /></TableHead>
                    <TableHead>Store Location</TableHead>
                    <TableHead>Rate Group</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>City / District</TableHead>
                    <TableHead>Zone / Area</TableHead>
                    <TableHead>Base Charge (1kg)</TableHead>
                    <TableHead>Charge (2kg)</TableHead>
                    <TableHead>Charge (3kg)</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedAssignments.map(a => {
                    const group = groups.find(g => g.id === a.groupId);
                    const c1 = group ? calcCharge(group, 1) : 0;
                    const c2 = group ? calcCharge(group, 2) : 0;
                    const c3 = group ? calcCharge(group, 3) : 0;
                    return (
                      <TableRow key={a.key}>
                        <TableCell><input type="checkbox" checked={arSelKeys.has(a.key)} onChange={() => setArSelKeys(prev => { const n = new Set(prev); n.has(a.key) ? n.delete(a.key) : n.add(a.key); return n; })} /></TableCell>
                        <TableCell className="text-sm">{a.store}</TableCell>
                        <TableCell><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{a.groupName || a.groupId}</span></TableCell>
                        <TableCell className="text-sm">{a.division || '—'}</TableCell>
                        <TableCell className="text-sm">{a.district}</TableCell>
                        <TableCell className="text-sm font-medium">{a.area || <span className="italic text-muted-foreground text-xs">All areas</span>}</TableCell>
                        <TableCell className="font-mono text-sm">৳{c1}</TableCell>
                        <TableCell className="font-mono text-sm">৳{c2}</TableCell>
                        <TableCell className="font-mono text-sm">৳{c3}</TableCell>
                        <TableCell><Button size="sm" variant="ghost" onClick={() => setAssignments(as => as.filter(x => x.key !== a.key))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                  {pagedAssignments.length === 0 && (
                    <TableRow><TableCell colSpan={10} className="text-center py-10 text-muted-foreground">No assigned Zone Rates yet. Assign areas in the "⇄ Area Assignment" tab.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm text-muted-foreground">Showing page {arPage} of {arTotalPages} · {filteredAssignments.length} records</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={arPage === 1} onClick={() => setArPage(p => p - 1)}>Previous</Button>
              <Button size="sm" variant="outline" disabled={arPage >= arTotalPages} onClick={() => setArPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {/* ════ SHIPPING METHODS TAB ══════════════════════════════════════════ */}
      {tab === 'methods' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('shippingMethods')}</CardTitle><Button onClick={() => { setEditingMethod(null); setMethodForm({ name: '', type: 'flat', baseCharge: 0, freeThreshold: 0, isActive: true }); setMethodDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />{t('addMethod')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('name')}</TableHead><TableHead>{t('type')}</TableHead><TableHead>{t('baseCharge')}</TableHead><TableHead>{t('freeAbove')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {methods.map(m => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>৳{m.baseCharge}</TableCell>
                    <TableCell>{m.freeThreshold ? `৳${m.freeThreshold}` : '—'}</TableCell>
                    <TableCell><Badge className={m.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{m.isActive ? t('active') : t('inactive')}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditMethod(m)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMethod(m._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {methods.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('noShippingMethods')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ════ GROCERY COVERAGE TAB ══════════════════════════════════════════ */}
      {tab === 'grocery' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Grocery delivery is limited to specific districts and areas. Toggle to enable/disable.</p>
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading…</p> : groceryDistricts.map(district => (
            <Card key={district._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{district.name}</CardTitle>
                  <Button size="sm" onClick={() => { setGEditArea(null); setGAreaForm({ district_id: String(district._id), name: '', name_bn: '' }); setGAreaDialogOpen(true); }}>
                    <Plus className="w-3 h-3 mr-1" />{t('addArea')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {district.areas.map(area => (
                    <div key={area._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="text-sm truncate mr-2">{area.name}</span>
                      <Switch checked={area.isActive} onCheckedChange={() => toggleGroceryArea(area)} />
                    </div>
                  ))}
                  {district.areas.length === 0 && <p className="text-sm text-muted-foreground col-span-4">No areas added yet.</p>}
                </div>
              </CardContent>
            </Card>
          ))}
          {groceryDistricts.length === 0 && !loading && <div className="text-center py-12 text-muted-foreground">No grocery districts found.</div>}
        </div>
      )}

      {/* ════ SHIPPING POLICIES TAB ═════════════════════════════════════════ */}
      {tab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Weight-based shipping policies for different zones.</p>
            <Button onClick={() => { setEditPolicy(null); setPolicyForm({ area_name: '', is_inside_city: false, base_weight_kg: '1', base_charge: '100', extra_charge_per_kg: '30', estimated_days_min: '1', estimated_days_max: '3', free_delivery_threshold: '' }); setPolicyDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add Policy</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Zone / Area</TableHead><TableHead>Type</TableHead><TableHead>Base Charge</TableHead><TableHead>Extra/kg</TableHead><TableHead>ETA</TableHead><TableHead>Free Above</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {policies.map(p => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.areaName || `District #${p.districtId}` || 'Default'}</TableCell>
                      <TableCell><Badge className={p.isInsideCity ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>{p.isInsideCity ? 'Inside City' : 'Nationwide'}</Badge></TableCell>
                      <TableCell>৳{p.baseCharge} / {p.baseWeightKg}kg</TableCell>
                      <TableCell>৳{p.extraChargePerKg}</TableCell>
                      <TableCell>{p.estimatedDaysMin}–{p.estimatedDaysMax} days</TableCell>
                      <TableCell>{p.freeDeliveryThreshold ? `৳${p.freeDeliveryThreshold}` : '—'}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => openEditPolicy(p)}><Edit className="w-3 h-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {policies.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No policies found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ DIALOGS ════════════════════════════════════════════════════════ */}

      {/* Area Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingArea ? t('editDeliveryArea') : t('addDeliveryArea')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('areaName')}</label><Input value={areaForm.name} onChange={e => setAreaForm({ ...areaForm, name: e.target.value })} placeholder="e.g. Dhaka Metro" /></div>
            <div><label className="text-sm font-medium">{t('city')}</label><Input value={areaForm.city} onChange={e => setAreaForm({ ...areaForm, city: e.target.value })} placeholder="e.g. Dhaka" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('deliveryCharge')} (৳)</label><Input type="number" value={areaForm.deliveryCharge} onChange={e => setAreaForm({ ...areaForm, deliveryCharge: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">{t('freeDeliveryAbove')}</label><Input type="number" value={areaForm.freeDeliveryThreshold} onChange={e => setAreaForm({ ...areaForm, freeDeliveryThreshold: Number(e.target.value) })} /></div>
            </div>
            <div><label className="text-sm font-medium">{t('estDeliveryDays')}</label><Input type="number" value={areaForm.estimatedDeliveryDays} onChange={e => setAreaForm({ ...areaForm, estimatedDeliveryDays: Number(e.target.value) })} /></div>
            <div><label className="text-sm font-medium">{t('postalCodes')}</label><Input value={areaForm.postalCodes} onChange={e => setAreaForm({ ...areaForm, postalCodes: e.target.value })} placeholder="1200, 1205" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAreaDialogOpen(false)}>Cancel</Button><Button onClick={saveArea}>{editingArea ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Method Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingMethod ? t('editShippingMethod') : t('addShippingMethod')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('name')}</label><Input value={methodForm.name} onChange={e => setMethodForm({ ...methodForm, name: e.target.value })} placeholder="Standard Delivery" /></div>
            <div><label className="text-sm font-medium">{t('type')}</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" value={methodForm.type} onChange={e => setMethodForm({ ...methodForm, type: e.target.value as ShippingMethod['type'] })}>
                <option value="flat">Flat Rate</option><option value="weight">Weight Based</option><option value="free">Free Shipping</option><option value="cod">Cash on Delivery</option><option value="express">Express</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('baseCharge')} (৳)</label><Input type="number" value={methodForm.baseCharge} onChange={e => setMethodForm({ ...methodForm, baseCharge: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">{t('freeThreshold')} (৳)</label><Input type="number" value={methodForm.freeThreshold} onChange={e => setMethodForm({ ...methodForm, freeThreshold: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={methodForm.isActive} onChange={e => setMethodForm({ ...methodForm, isActive: e.target.checked })} /><label className="text-sm">{t('active')}</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMethodDialogOpen(false)}>Cancel</Button><Button onClick={saveMethod}>{editingMethod ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Shipment Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Shipment Details — {viewShipment?.shipmentNumber}</DialogTitle></DialogHeader>
          {viewShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Order:</span> <span className="font-medium">#{viewShipment.orderId}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={SHIPMENT_STATUS[viewShipment.status]?.className}>{SHIPMENT_STATUS[viewShipment.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Courier:</span> <span>{viewShipment.courierName || '—'}</span></div>
                <div><span className="text-muted-foreground">Tracking:</span> <span className="font-mono">{viewShipment.trackingNumber || '—'}</span></div>
                <div><span className="text-muted-foreground">Weight:</span> <span>{viewShipment.totalWeightKg ? `${viewShipment.totalWeightKg} kg` : '—'}</span></div>
                <div><span className="text-muted-foreground">Charge:</span> <span>৳{viewShipment.deliveryCharge}</span></div>
                <div><span className="text-muted-foreground">ETA:</span> <span>{viewShipment.estimatedDaysMin}–{viewShipment.estimatedDaysMax} days</span></div>
              </div>
              {viewShipment.items && viewShipment.items.length > 0 && (
                <div><p className="font-medium mb-2">Items ({viewShipment.items.length})</p>
                  <div className="space-y-1">{viewShipment.items.map((item: any, i: number) => <div key={i} className="flex justify-between text-sm py-1 border-b"><span>{item.product_name || `Product #${item.product_id}`}</span><span>x{item.quantity}</span></div>)}</div>
                </div>
              )}
              {viewShipment.trackingEvents && viewShipment.trackingEvents.length > 0 && (
                <div><p className="font-medium mb-2">Tracking History</p>
                  <div className="space-y-2">{viewShipment.trackingEvents.map((ev: any, i: number) => <div key={i} className="flex gap-3 text-sm"><span className="text-muted-foreground whitespace-nowrap">{new Date(ev.created_at).toLocaleDateString()}</span><Badge className={SHIPMENT_STATUS[ev.status]?.className || 'bg-muted text-muted-foreground'} variant="outline">{SHIPMENT_STATUS[ev.status]?.label || ev.status}</Badge>{ev.description && <span className="text-muted-foreground">{ev.description}</span>}</div>)}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Shipment Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Shipment — {updateShipment?.shipmentNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Status *</label>
              <Select value={updateForm.status} onValueChange={v => setUpdateForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(SHIPMENT_STATUS).map(s => <SelectItem key={s} value={s}>{SHIPMENT_STATUS[s].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Courier</label>
              <Select value={updateForm.courier_id} onValueChange={v => { const c = couriers.find(c => c._id === v); setUpdateForm(p => ({ ...p, courier_id: v, courier_name: c?.name || '' })); }}>
                <SelectTrigger><SelectValue placeholder="Select Courier" /></SelectTrigger>
                <SelectContent>{couriers.map(c => <SelectItem key={c._id} value={String(c._id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Tracking Number</label><Input value={updateForm.tracking_number} onChange={e => setUpdateForm(p => ({ ...p, tracking_number: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Note</label><Input value={updateForm.description} onChange={e => setUpdateForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button><Button onClick={submitShipmentUpdate}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grocery Area Dialog */}
      <Dialog open={gAreaDialogOpen} onOpenChange={setGAreaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{gEditArea ? 'Edit Area' : 'Add Grocery Area'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Area Name (English)</label><Input value={gAreaForm.name} onChange={e => setGAreaForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Area Name (Bengali)</label><Input value={gAreaForm.name_bn} onChange={e => setGAreaForm(p => ({ ...p, name_bn: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setGAreaDialogOpen(false)}>Cancel</Button><Button onClick={saveGroceryArea}>{gEditArea ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Policy Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editPolicy ? 'Edit Shipping Policy' : 'Add Shipping Policy'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Zone / Area Name</label><Input value={policyForm.area_name} onChange={e => setPolicyForm(p => ({ ...p, area_name: e.target.value }))} placeholder="e.g. Dhaka City" /></div>
            <div className="col-span-2 flex items-center gap-3"><Switch checked={policyForm.is_inside_city} onCheckedChange={v => setPolicyForm(p => ({ ...p, is_inside_city: v }))} /><label className="text-sm">Inside City (faster delivery)</label></div>
            <div><label className="text-sm font-medium mb-1 block">Base Weight (kg)</label><Input type="number" value={policyForm.base_weight_kg} onChange={e => setPolicyForm(p => ({ ...p, base_weight_kg: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Base Charge (৳)</label><Input type="number" value={policyForm.base_charge} onChange={e => setPolicyForm(p => ({ ...p, base_charge: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Extra/kg (৳)</label><Input type="number" value={policyForm.extra_charge_per_kg} onChange={e => setPolicyForm(p => ({ ...p, extra_charge_per_kg: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Free Threshold (৳)</label><Input type="number" value={policyForm.free_delivery_threshold} onChange={e => setPolicyForm(p => ({ ...p, free_delivery_threshold: e.target.value }))} placeholder="Optional" /></div>
            <div><label className="text-sm font-medium mb-1 block">ETA Min (days)</label><Input type="number" value={policyForm.estimated_days_min} onChange={e => setPolicyForm(p => ({ ...p, estimated_days_min: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">ETA Max (days)</label><Input type="number" value={policyForm.estimated_days_max} onChange={e => setPolicyForm(p => ({ ...p, estimated_days_max: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Cancel</Button><Button onClick={savePolicy}>{editPolicy ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
