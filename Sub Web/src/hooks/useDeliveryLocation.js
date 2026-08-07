import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'delivery_location';
const AUTO_KEY = 'delivery_location_auto_tried';
const EVENT = 'delivery-location-changed';

// ─── AI-powered auto-detection ───────────────────────────────────────────────
// Uses multiple signals in parallel: browser GPS → BigDataCloud ML geocoding,
// competing IP services, and timezone as a validation signal.

/** Build a clean readable label from BigDataCloud ML response */
const buildLabelBDC = (d = {}) => {
    const parts = [
        d.locality,
        d.city !== d.locality ? d.city : null,
        d.principalSubdivision,
    ].filter(Boolean);
    const seen = new Set();
    return parts
        .filter((p) => { const k = p.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
        .join(', ') || d.countryName || 'Bangladesh';
};

/**
 * BigDataCloud ML reverse-geocoding — free, no API key, uses ML models
 * to identify locality/neighbourhood with high accuracy.
 */
const reverseGeocodeML = async (lat, lng) => {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('BDC failed');
    const d = await res.json();
    if ((d.countryCode || '').toUpperCase() !== 'BD') throw new Error('outside-bd');
    return {
        label: buildLabelBDC(d),
        lat: Number(lat),
        lng: Number(lng),
        district: d.city || d.principalSubdivision || '',
        area: d.locality || '',
        auto: true,
        confidence: 'high',
    };
};

/** Fallback: Nominatim OSM reverse geocode */
const reverseGeocodeNominatim = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (!res.ok) throw new Error('nominatim failed');
    const data = await res.json();
    if ((data?.address?.country_code || '').toLowerCase() !== 'bd') throw new Error('outside-bd');
    const a = data?.address || {};
    const parts = [
        a.road,
        a.suburb || a.neighbourhood || a.village,
        a.city || a.town || a.municipality || a.county,
        a.state,
    ].filter(Boolean);
    const seen = new Set();
    const label = parts.filter((p) => { const k = p.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).join(', ')
        || data?.display_name || 'Bangladesh';
    return {
        label,
        lat: Number(lat),
        lng: Number(lng),
        district: a.state_district || a.county || a.city || a.state || '',
        area: a.suburb || a.neighbourhood || a.village || a.town || '',
        auto: true,
        confidence: 'medium',
    };
};

/** Best-effort reverse geocode — tries ML first, falls back to OSM */
const reverseGeocodeBest = async (lat, lng) => {
    try { return await reverseGeocodeML(lat, lng); } catch (_) {}
    try { return await reverseGeocodeNominatim(lat, lng); } catch (_) {}
    return null;
};

/** Race multiple IP geolocation services, return first BD result */
const ipGeolocate = () => {
    const parse = (city, region, lat, lng) => {
        if (!city && !region) return null;
        return {
            label: [city, region].filter(Boolean).join(', ') || 'Bangladesh',
            lat: Number(lat) || 23.7806,
            lng: Number(lng) || 90.4054,
            district: region || '',
            area: city || '',
            auto: true,
            ip: true,
            confidence: 'low',
        };
    };

    const apis = [
        // ipwho.is — fast, reliable, no key
        fetch('https://ipwho.is/')
            .then((r) => r.json())
            .then((d) => (d.success && (d.country_code || '').toUpperCase() === 'BD'
                ? parse(d.city, d.region, d.latitude, d.longitude)
                : null))
            .catch(() => null),
        // ipapi.co
        fetch('https://ipapi.co/json/')
            .then((r) => r.json())
            .then((d) => ((d.country_code || '').toUpperCase() === 'BD'
                ? parse(d.city, d.region, d.latitude, d.longitude)
                : null))
            .catch(() => null),
        // freeipapi.com
        fetch('https://freeipapi.com/api/json')
            .then((r) => r.json())
            .then((d) => ((d.countryCode || '').toUpperCase() === 'BD'
                ? parse(d.cityName, d.regionName, d.latitude, d.longitude)
                : null))
            .catch(() => null),
    ];

    // Return first non-null result among all three
    return Promise.all(apis).then((results) => results.find(Boolean) || null);
};

/**
 * AI-powered delivery location auto-detection.
 * Fires GPS + all IP services simultaneously; GPS always wins over IP
 * when available. Timezone used as a confidence signal.
 */
export const autoDetectDeliveryLocation = async ({ force = false } = {}) => {
    if (!force) {
        if (localStorage.getItem(STORAGE_KEY)) return null;
        if (sessionStorage.getItem(AUTO_KEY)) return null;
    }
    sessionStorage.setItem(AUTO_KEY, '1');

    // Timezone signal — if Asia/Dhaka, we're almost certainly in Bangladesh
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isBdTimezone = tz === 'Asia/Dhaka' || tz === 'Asia/Calcutta';

    // GPS promise — resolves with coords or null (doesn't block IP)
    const gpsPromise = new Promise((resolve) => {
        if (!('geolocation' in navigator)) return resolve(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 5 * 60 * 1000 }
        );
    }).then((coords) => coords ? reverseGeocodeBest(coords.lat, coords.lng) : null)
      .catch(() => null);

    // Fire GPS + all IP APIs at the same time
    const [gpsResult, ipResult] = await Promise.all([gpsPromise, ipGeolocate()]);

    // GPS is most accurate; IP is fallback; timezone-based default is last resort
    const result =
        gpsResult ||
        ipResult ||
        (isBdTimezone ? { label: 'Bangladesh', district: '', area: '', lat: null, lng: null, auto: true, confidence: 'timezone' } : null);

    if (result) setDeliveryLocation(result);
    return result;
};

const read = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.label) return parsed;
        return null;
    } catch (_) {
        return null;
    }
};

export const setDeliveryLocation = (loc) => {
    if (loc) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: loc || null }));
};

export const useDeliveryLocation = () => {
    const [location, setLocation] = useState(read);

    useEffect(() => {
        // Always re-read from localStorage to guarantee we have the freshest
        // committed value (avoids any stale event payloads).
        const refresh = () => setLocation(read());
        const eventHandler = () => refresh();
        const storageHandler = (e) => {
            if (!e || e.key === STORAGE_KEY || e.key === null) refresh();
        };
        const focusHandler = () => refresh();

        window.addEventListener(EVENT, eventHandler);
        window.addEventListener('storage', storageHandler);
        window.addEventListener('focus', focusHandler);
        document.addEventListener('visibilitychange', focusHandler);

        // Sync once on mount in case storage was modified before listener attached
        refresh();

        return () => {
            window.removeEventListener(EVENT, eventHandler);
            window.removeEventListener('storage', storageHandler);
            window.removeEventListener('focus', focusHandler);
            document.removeEventListener('visibilitychange', focusHandler);
        };
    }, []);

    const update = useCallback((loc) => setDeliveryLocation(loc), []);
    const clear = useCallback(() => setDeliveryLocation(null), []);

    return { location, setLocation: update, clearLocation: clear };
};

export default useDeliveryLocation;
