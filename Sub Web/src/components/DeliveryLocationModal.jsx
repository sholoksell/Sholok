import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Search, Crosshair, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { setDeliveryLocation, useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import { toast } from 'sonner';

// Lightweight loader for Leaflet from CDN — avoids new npm dep.
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
let leafletPromise = null;

const loadLeaflet = () => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (window.L) return Promise.resolve(window.L);
    if (leafletPromise) return leafletPromise;

    leafletPromise = new Promise((resolve, reject) => {
        if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = LEAFLET_CSS;
            link.crossOrigin = '';
            document.head.appendChild(link);
        }
        if (window.L) return resolve(window.L);
        const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(window.L));
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.src = LEAFLET_JS;
        script.async = true;
        script.crossOrigin = '';
        script.onload = () => resolve(window.L);
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
    return leafletPromise;
};

// Static district → areas (Bangladesh) for the OR fallback
const DISTRICT_AREAS = {
    Dhaka: ['Banani', 'Gulshan', 'Dhanmondi', 'Mirpur', 'Mohammadpur', 'Uttara', 'Bashundhara', 'Motijheel'],
    Chittagong: ['Agrabad', 'Halishahar', 'Khulshi', 'Pahartali', 'Panchlaish'],
    Sylhet: ['Zindabazar', 'Ambarkhana', 'Subhanighat', 'Tilagor'],
    Rajshahi: ['Shaheb Bazar', 'Boalia', 'Motihar'],
    Khulna: ['Khalishpur', 'Sonadanga', 'Daulatpur'],
    Barisal: ['Sadar', 'Banaripara', 'Gournadi'],
    Rangpur: ['Sadar', 'Mithapukur'],
    Mymensingh: ['Sadar', 'Trishal'],
};

const DEFAULT_CENTER = [23.7806, 90.4054]; // Dhaka

const DeliveryLocationModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { location: savedLocation } = useDeliveryLocation();

    const mapElRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [reverseLoading, setReverseLoading] = useState(false);
    const [pinned, setPinned] = useState(null); // { lat, lng, label }
    const [district, setDistrict] = useState('');
    const [area, setArea] = useState('');
    const [locating, setLocating] = useState(false);

    // Reset / preload state on open ONLY (not when savedLocation changes mid-modal,
    // otherwise the user's in-progress map click can be overwritten right after Done).
    useEffect(() => {
        if (!isOpen) return;
        // Read fresh from localStorage so we always reflect the latest saved value.
        let stored = null;
        try {
            const raw = localStorage.getItem('delivery_location');
            if (raw) stored = JSON.parse(raw);
        } catch (_) {}
        if (stored && stored.label) {
            setPinned(
                stored.lat != null && stored.lng != null
                    ? { lat: stored.lat, lng: stored.lng, label: stored.label }
                    : null
            );
            setSearchQuery(stored.label || '');
            setDistrict(stored.district || '');
            setArea(stored.area || '');
        } else {
            setPinned(null);
            setSearchQuery('');
            setDistrict('');
            setArea('');
        }
    }, [isOpen]);

    // Init Leaflet map
    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;

        loadLeaflet()
            .then((L) => {
                if (cancelled || !mapElRef.current || mapRef.current) return;

                // Read savedLocation directly — avoids stale `pinned` state
                // since both useEffects fire simultaneously on open.
                let stored = null;
                try {
                    const raw = localStorage.getItem('delivery_location');
                    if (raw) stored = JSON.parse(raw);
                } catch (_) {}
                const hasCoords = stored?.lat != null && stored?.lng != null;
                const initial = hasCoords ? [stored.lat, stored.lng] : DEFAULT_CENTER;

                const map = L.map(mapElRef.current, {
                    center: initial,
                    zoom: hasCoords ? 15 : 13,
                    zoomControl: true,
                    scrollWheelZoom: true,
                });
                mapRef.current = map;

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap',
                    maxZoom: 19,
                }).addTo(map);

                const icon = L.divIcon({
                    className: 'delivery-marker',
                    html: `<div style="
                        background:#E31E24;width:34px;height:34px;border-radius:50%;
                        display:flex;align-items:center;justify-content:center;color:#fff;
                        box-shadow:0 4px 12px rgba(0,0,0,0.25);border:3px solid #fff;
                    "><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z'/><circle cx='12' cy='10' r='3'/></svg></div>`,
                    iconSize: [34, 34],
                    iconAnchor: [17, 34],
                });

                const marker = L.marker(initial, { draggable: true, icon }).addTo(map);
                // If opening with a saved location, pre-set pinned state
                if (hasCoords && stored?.label) {
                    setPinned({ lat: stored.lat, lng: stored.lng, label: stored.label });
                    setSearchQuery(stored.label);
                }
                markerRef.current = marker;

                const updateFromLatLng = async (latlng) => {
                    setReverseLoading(true);
                    // User is choosing a precise spot via map — dropdowns no longer
                    // describe this location, so clear them to avoid stale data being saved.
                    setDistrict('');
                    setArea('');
                    try {
                        const res = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const data = await res.json();
                        const label = data?.display_name || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
                        setPinned({ lat: latlng.lat, lng: latlng.lng, label });
                        setSearchQuery(label);
                    } catch (_) {
                        const label = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
                        setPinned({ lat: latlng.lat, lng: latlng.lng, label });
                        setSearchQuery(label);
                    } finally {
                        setReverseLoading(false);
                    }
                };

                map.on('click', (e) => {
                    // Move pin to exact click point — do NOT panTo so the
                    // pin visually jumps to where the user tapped.
                    markerRef.current?.setLatLng(e.latlng);
                    updateFromLatLng(e.latlng);
                });
                marker.on('dragend', () => {
                    const ll = markerRef.current?.getLatLng();
                    if (ll) updateFromLatLng(ll);
                });

                setTimeout(() => map.invalidateSize(), 200);
            })
            .catch(() => toast.error('Failed to load map'));

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Tear down on close
    useEffect(() => {
        if (isOpen) return;
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
            markerRef.current = null;
        }
    }, [isOpen]);

    const handleSearch = async () => {
        const q = searchQuery.trim();
        if (!q) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=bd&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            if (Array.isArray(data) && data[0]) {
                const { lat, lon, display_name } = data[0];
                const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([latlng.lat, latlng.lng], 16);
                    markerRef.current.setLatLng([latlng.lat, latlng.lng]);
                }
                setPinned({ lat: latlng.lat, lng: latlng.lng, label: display_name });
                setSearchQuery(display_name);
                // search overrides any prior dropdown selection
                setDistrict('');
                setArea('');
            } else {
                toast.error('No matching location found');
            }
        } catch (_) {
            toast.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    /** Move the map + pin to a textual place query (used by dropdowns) */
    const flyToQuery = async (query, zoom = 14) => {
        if (!query || !mapRef.current || !markerRef.current) return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=bd&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            if (Array.isArray(data) && data[0]) {
                const { lat, lon, display_name } = data[0];
                const latlng = [parseFloat(lat), parseFloat(lon)];
                mapRef.current.setView(latlng, zoom, { animate: true });
                markerRef.current.setLatLng(latlng);
                setPinned({ lat: latlng[0], lng: latlng[1], label: display_name });
                setSearchQuery(display_name);
            }
        } catch (_) {
            /* silent — dropdown selection still saved on Done */
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported in this browser');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([latlng.lat, latlng.lng], 17);
                    markerRef.current.setLatLng([latlng.lat, latlng.lng]);
                    mapRef.current.invalidateSize();
                }
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const label = data?.display_name || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
                    setPinned({ lat: latlng.lat, lng: latlng.lng, label });
                    setSearchQuery(label);
                } catch {
                    setPinned({
                        lat: latlng.lat,
                        lng: latlng.lng,
                        label: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
                    });
                }
                setLocating(false);
            },
            (err) => {
                setLocating(false);
                if (err.code === 1) {
                    toast.error('Location permission denied. Please allow location access in your browser settings.');
                } else if (err.code === 3) {
                    toast.error('Location request timed out. Try again or search manually.');
                } else {
                    toast.error('Unable to retrieve your location. Try searching manually.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleDone = () => {
        let payload = null;
        if (pinned) {
            payload = {
                label: pinned.label,
                lat: pinned.lat,
                lng: pinned.lng,
                district,
                area,
            };
        } else if (district && area) {
            payload = { label: `${area}, ${district}`, district, area, lat: null, lng: null };
        } else if (district) {
            payload = { label: district, district, area: '', lat: null, lng: null };
        } else {
            toast.error('Please select a location');
            return;
        }
        setDeliveryLocation(payload);
        toast.success('Delivery location saved');
        onClose?.();
    };

    if (!isOpen) return null;

    const areaOptions = DISTRICT_AREAS[district] || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-[560px] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-center relative py-4 border-b">
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                        <MapPin className="h-6 w-6 text-[#E31E24]" />
                        <span>{t('locationHeader') || 'Delivery Location'}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">

                    {/* Map Area */}
                    <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 mb-4">
                        {/* Search Overlay */}
                        <div className="absolute top-3 left-3 right-3 z-[500] flex shadow-md">
                            <div className="flex-1 bg-white flex items-center px-3 h-10 rounded-l-md border-r">
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    title="Search"
                                    className="mr-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                                >
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </button>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={t('searchLocation') || 'Search address (e.g. Road 6, Block C)'}
                                    className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0"
                                />
                                {searchQuery && (
                                    <X
                                        className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 flex-shrink-0"
                                        onClick={() => setSearchQuery('')}
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleUseMyLocation}
                                disabled={locating}
                                title="Use my current location"
                                className="bg-[#E31E24] hover:bg-red-700 disabled:opacity-70 text-white h-10 w-10 flex items-center justify-center rounded-r-md transition-colors"
                            >
                                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* The map */}
                        <div ref={mapElRef} className="w-full h-64 bg-gray-100" />

                        {reverseLoading && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[500] bg-white/95 px-3 py-1 rounded-full shadow text-xs text-gray-600 flex items-center gap-1.5">
                                <Loader2 className="h-3 w-3 animate-spin" /> Finding address…
                            </div>
                        )}
                    </div>

                    {/* Selected location preview */}
                    {pinned && (
                        <div className="flex items-start gap-2 mb-4 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                            <MapPin className="h-4 w-4 text-green-700 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-green-800 leading-snug line-clamp-2">{pinned.label}</p>
                        </div>
                    )}

                    {/* OR Divider */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-[1px] bg-gray-200 flex-1" />
                        <div className="h-8 px-3 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 bg-white">
                            {t('or') || 'OR'}
                        </div>
                        <div className="h-[1px] bg-gray-200 flex-1" />
                    </div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <select
                            value={district}
                            onChange={(e) => {
                                const d = e.target.value;
                                setDistrict(d);
                                setArea('');
                                if (d) flyToQuery(`${d}, Bangladesh`, 12);
                            }}
                            className="w-full h-11 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#E31E24] cursor-pointer"
                        >
                            <option value="">{t('selectDistrict') || 'Select district'}</option>
                            {Object.keys(DISTRICT_AREAS).map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <select
                            value={area}
                            onChange={(e) => {
                                const a = e.target.value;
                                setArea(a);
                                if (a && district) flyToQuery(`${a}, ${district}, Bangladesh`, 15);
                            }}
                            disabled={!district}
                            className="w-full h-11 px-3 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:border-[#E31E24] cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                        >
                            <option value="">{t('selectArea') || 'Select area'}</option>
                            {areaOptions.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>

                    {/* Done */}
                    <button
                        onClick={handleDone}
                        className="w-full bg-[#fec400] hover:bg-[#eebb00] text-black font-bold py-3 rounded-md transition-colors uppercase tracking-wide text-sm shadow-sm"
                    >
                        {t('done') || 'Done'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLocationModal;
