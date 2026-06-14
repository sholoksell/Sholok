import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
  ScaleControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import Header from "@/components/portal/Header";
import axios from "axios";
import {
  Search,
  MapPin,
  Navigation,
  Plus,
  Crosshair,
  Sun,
  Moon,
  Layers,
  X,
  Loader2,
  Coffee,
  Utensils,
  Building,
  Hotel,
  Heart,
  GraduationCap,
  ShoppingBag,
  TreePine,
  MoreHorizontal,
} from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const BANGLADESH_CENTER: [number, number] = [23.685, 90.3563];
const DEFAULT_ZOOM = 7;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface SavedLocation {
  _id: string;
  name: string;
  nameBn: string;
  lat: number;
  lng: number;
  category: string;
  address: string;
  description: string;
}

interface CategoryPlace {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  type: string;
}

const CATEGORIES = [
  { key: "all", label: "All", icon: Layers, query: "" },
  { key: "restaurant", label: "Restaurant", icon: Utensils, query: "restaurant" },
  { key: "cafe", label: "Cafe", icon: Coffee, query: "cafe" },
  { key: "bank", label: "Bank", icon: Building, query: "bank" },
  { key: "hotel", label: "Hotel", icon: Hotel, query: "hotel" },
  { key: "hospital", label: "Hospital", icon: Heart, query: "hospital" },
  { key: "school", label: "School", icon: GraduationCap, query: "school" },
  { key: "market", label: "Market", icon: ShoppingBag, query: "market bazar" },
  { key: "park", label: "Park", icon: TreePine, query: "park" },
  { key: "mosque", label: "Mosque", icon: MoreHorizontal, query: "mosque" },
];

const TILE_LAYERS = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
};

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:white;border-radius:50%;transform:rotate(45deg);"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const searchIcon = createColoredIcon("#ef4444");
const savedIcon = createColoredIcon("#3b82f6");
const userIcon = createColoredIcon("#22c55e");
const categoryIcon = createColoredIcon("#f97316");

// FlyTo helper component
function FlyToLocation({ position, zoom }: { position: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 1.5 });
    }
  }, [position, zoom, map]);
  return null;
}

// Marker cluster component
function MarkerClusterGroup({ locations }: { locations: SavedLocation[] }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current);
    }
    const cluster = (L as any).markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });

    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], { icon: savedIcon });
      marker.bindPopup(
        `<div style="min-width:160px">
          <strong>${loc.name}</strong>${loc.nameBn ? ` <span style="color:#666">(${loc.nameBn})</span>` : ""}
          <br/><small style="color:#888">${loc.category}</small>
          ${loc.address ? `<br/><small>📍 ${loc.address}</small>` : ""}
          ${loc.description ? `<br/><small>${loc.description}</small>` : ""}
        </div>`
      );
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
      }
    };
  }, [locations, map]);

  return null;
}

// Click handler for add-location mode
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const Maps = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [flyZoom, setFlyZoom] = useState(14);

  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categoryPlaces, setCategoryPlaces] = useState<CategoryPlace[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const [mapStyle, setMapStyle] = useState<"light" | "dark" | "satellite">("light");
  const [showLayerPicker, setShowLayerPicker] = useState(false);

  const [addMode, setAddMode] = useState(false);
  const [newLocForm, setNewLocForm] = useState({
    name: "",
    nameBn: "",
    lat: 0,
    lng: 0,
    category: "other",
    address: "",
    description: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch saved locations from backend
  const fetchLocations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/locations`, {
        params: activeCategory !== "all" ? { category: activeCategory } : {},
      });
      if (data.success) setSavedLocations(data.locations);
    } catch {
      // silent
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Fetch places by category from Nominatim
  const fetchCategoryPlaces = useCallback(async (catKey: string) => {
    if (catKey === "all") {
      setCategoryPlaces([]);
      return;
    }
    const cat = CATEGORIES.find((c) => c.key === catKey);
    if (!cat || !cat.query) return;
    setLoadingCategory(true);
    try {
      const { data } = await axios.get(NOMINATIM_URL, {
        params: {
          q: `${cat.query} in Bangladesh`,
          format: "json",
          countrycodes: "bd",
          limit: 30,
          addressdetails: 1,
        },
      });
      const places: CategoryPlace[] = data.map((item: any) => ({
        id: item.place_id,
        name: item.display_name.split(",")[0],
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        type: cat.label,
      }));
      setCategoryPlaces(places);
      if (places.length > 0) {
        setFlyTarget([places[0].lat, places[0].lng]);
        setFlyZoom(10);
      }
    } catch {
      setCategoryPlaces([]);
    }
    setLoadingCategory(false);
  }, []);

  const handleCategoryClick = (catKey: string) => {
    setActiveCategory(catKey);
    setSearchResults([]);
    setSearchQuery("");
    setSelectedResult(null);
    fetchCategoryPlaces(catKey);
  };

  // Debounced search via Nominatim (Bangladesh only)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await axios.get(NOMINATIM_URL, {
          params: {
            q: query,
            format: "json",
            countrycodes: "bd",
            limit: 8,
            addressdetails: 1,
          },
        });
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
  };

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    setSelectedResult({ lat, lng: lon, name: result.display_name });
    setFlyTarget([lat, lon]);
    setFlyZoom(15);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",")[0]);
  };

  // Geolocation
  const locateUser = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(coords);
        setFlyTarget(coords);
        setFlyZoom(16);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!addMode) return;
    setNewLocForm((f) => ({ ...f, lat, lng }));
    setShowAddForm(true);
  };

  const saveLocation = async () => {
    if (!newLocForm.name.trim()) return;
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/locations`, newLocForm);
      setShowAddForm(false);
      setAddMode(false);
      setNewLocForm({ name: "", nameBn: "", lat: 0, lng: 0, category: "other", address: "", description: "" });
      fetchLocations();
    } catch {
      // silent
    }
    setSaving(false);
  };

  const tile = TILE_LAYERS[mapStyle];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row w-full h-[calc(100vh-64px)] relative">
        {/* Sidebar */}
        <div className="w-full md:w-[380px] bg-card border-r border-border flex flex-col z-10 shrink-0 max-h-[40vh] md:max-h-full">
          {/* Search */}
          <div className="p-3 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search Bangladesh..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-secondary rounded-lg border-none focus:ring-2 focus:ring-primary outline-none text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-3"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto">
            {(searching || loadingCategory) && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {loadingCategory ? "Finding places..." : "Searching..."}
                </span>
              </div>
            )}

            {/* Text search results */}
            {searchResults.length > 0 && !loadingCategory && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 pb-2">Search Results</p>
                {searchResults.map((r) => (
                  <button
                    key={r.place_id}
                    onClick={() => selectSearchResult(r)}
                    className="w-full text-left px-3 py-2.5 hover:bg-secondary/60 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {r.display_name.split(",")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {r.display_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Category places */}
            {categoryPlaces.length > 0 && activeCategory !== "all" && searchResults.length === 0 && !loadingCategory && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 pb-2">
                  {CATEGORIES.find(c => c.key === activeCategory)?.label} in Bangladesh ({categoryPlaces.length})
                </p>
                {categoryPlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedResult({ lat: place.lat, lng: place.lng, name: place.address });
                      setFlyTarget([place.lat, place.lng]);
                      setFlyZoom(16);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-secondary/60 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{place.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{place.address}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Saved locations (show when "All" is selected and no search) */}
            {activeCategory === "all" && searchResults.length === 0 && !searching && !loadingCategory && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 pb-2">
                  Saved Locations ({savedLocations.length})
                </p>
                {savedLocations.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No saved locations yet. Click <strong>+</strong> to add.
                  </p>
                )}
                {savedLocations.map((loc) => (
                  <button
                    key={loc._id}
                    onClick={() => {
                      setFlyTarget([loc.lat, loc.lng]);
                      setFlyZoom(16);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-secondary/60 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{loc.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{loc.category}</span>
                          {loc.address && <span>• {loc.address}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={BANGLADESH_CENTER}
            zoom={DEFAULT_ZOOM}
            zoomControl={false}
            attributionControl={false}
            className="w-full h-full"
            style={{ background: mapStyle === "dark" ? "#1a1a2e" : "#f0f0f0" }}
          >
            <TileLayer url={tile.url} attribution="" />
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" />
            <FlyToLocation position={flyTarget} zoom={flyZoom} />
            <MarkerClusterGroup locations={savedLocations} />

            {/* Category place markers */}
            {categoryPlaces.map((place) => (
              <Marker key={place.id} position={[place.lat, place.lng]} icon={categoryIcon}>
                <Popup>
                  <div className="min-w-[160px]">
                    <strong>{place.name}</strong>
                    <br />
                    <small style={{ color: "#888" }}>{place.type}</small>
                    <br />
                    <small style={{ color: "#666" }}>{place.address}</small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {selectedResult && (
              <Marker position={[selectedResult.lat, selectedResult.lng]} icon={searchIcon}>
                <Popup>
                  <div className="min-w-[180px]">
                    <strong>{selectedResult.name.split(",")[0]}</strong>
                    <br />
                    <small className="text-gray-500">{selectedResult.name}</small>
                  </div>
                </Popup>
              </Marker>
            )}

            {userPosition && (
              <Marker position={userPosition} icon={userIcon}>
                <Popup>
                  <strong>📍 Your Location</strong>
                </Popup>
              </Marker>
            )}

            {addMode && newLocForm.lat !== 0 && (
              <Marker position={[newLocForm.lat, newLocForm.lng]} icon={searchIcon}>
                <Popup>New Pin</Popup>
              </Marker>
            )}

            {addMode && <MapClickHandler onMapClick={handleMapClick} />}
          </MapContainer>

          {/* Map controls (top-right) */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <button
              onClick={locateUser}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="My Location"
            >
              {locating ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <Crosshair className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowLayerPicker(!showLayerPicker)}
                className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Map Style"
              >
                <Layers className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              {showLayerPicker && (
                <div className="absolute right-12 top-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2 flex gap-2 min-w-max">
                  {(["light", "dark", "satellite"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setMapStyle(s);
                        setShowLayerPicker(false);
                      }}
                      className={`px-3 py-2 rounded-md text-xs font-medium capitalize transition-colors ${
                        mapStyle === s
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {s === "light" && <Sun className="w-3 h-3 inline mr-1" />}
                      {s === "dark" && <Moon className="w-3 h-3 inline mr-1" />}
                      {s === "satellite" && <Layers className="w-3 h-3 inline mr-1" />}
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setAddMode(!addMode);
                if (addMode) {
                  setShowAddForm(false);
                  setNewLocForm({ name: "", nameBn: "", lat: 0, lng: 0, category: "other", address: "", description: "" });
                }
              }}
              className={`w-10 h-10 rounded-lg shadow-lg flex items-center justify-center transition-colors ${
                addMode
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={addMode ? "Cancel Add" : "Add Location"}
            >
              {addMode ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <button
              onClick={() => {
                setFlyTarget(BANGLADESH_CENTER);
                setFlyZoom(DEFAULT_ZOOM);
                setSelectedResult(null);
              }}
              className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Reset View"
            >
              <Navigation className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Add-mode banner */}
          {addMode && !showAddForm && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-pulse">
              Click on the map to place a pin
            </div>
          )}

          {/* Add location form */}
          {showAddForm && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 w-[90%] max-w-md border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Add Location</h3>
                <button onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Location name *"
                  value={newLocForm.name}
                  onChange={(e) => setNewLocForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="Name in Bengali (optional)"
                  value={newLocForm.nameBn}
                  onChange={(e) => setNewLocForm((f) => ({ ...f, nameBn: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={newLocForm.category}
                  onChange={(e) => setNewLocForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Address"
                  value={newLocForm.address}
                  onChange={(e) => setNewLocForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newLocForm.description}
                  onChange={(e) => setNewLocForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="text-xs text-muted-foreground">
                  📍 {newLocForm.lat.toFixed(5)}, {newLocForm.lng.toFixed(5)}
                </div>
                <button
                  onClick={saveLocation}
                  disabled={saving || !newLocForm.name.trim()}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Location"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Maps;
