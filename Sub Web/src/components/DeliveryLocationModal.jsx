import React, { useEffect, useState, useCallback } from 'react';
import { X, MapPin, ChevronDown, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { setDeliveryLocation, useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import { useAuth } from '@/contexts/AuthContext';
import axios from '@/lib/axios';
import { toast } from 'sonner';

const DeliveryLocationModal = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { location: savedLocation } = useDeliveryLocation();
    const { isAuthenticated, customer } = useAuth();

    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [areas, setAreas] = useState([]);

    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedArea, setSelectedArea] = useState('');

    const [loadingDivisions, setLoadingDivisions] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load divisions on mount (once)
    useEffect(() => {
        setLoadingDivisions(true);
        fetch('/api/delivery-coverage/areas/divisions')
            .then(r => r.ok ? r.json() : [])
            .then(data => setDivisions(Array.isArray(data) ? data : []))
            .catch(() => setDivisions([]))
            .finally(() => setLoadingDivisions(false));
    }, []);

    // Preload saved location when modal opens
    useEffect(() => {
        if (!isOpen) return;
        try {
            const raw = localStorage.getItem('delivery_location');
            if (raw) {
                const loc = JSON.parse(raw);
                if (loc?.division_name) setSelectedDivision(loc.division_name);
                if (loc?.district_name || loc?.district) setSelectedDistrict(loc.district_name || loc.district);
                if (loc?.area) setSelectedArea(loc.area);
            }
        } catch (_) {}
    }, [isOpen]);

    // Fetch districts when division changes
    useEffect(() => {
        if (!selectedDivision) { setDistricts([]); setSelectedDistrict(''); setAreas([]); setSelectedArea(''); return; }
        setLoadingDistricts(true);
        setDistricts([]);
        setSelectedDistrict('');
        setAreas([]);
        setSelectedArea('');
        fetch(`/api/delivery-coverage/areas/districts?division=${encodeURIComponent(selectedDivision)}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setDistricts(Array.isArray(data) ? data : []))
            .catch(() => setDistricts([]))
            .finally(() => setLoadingDistricts(false));
    }, [selectedDivision]);

    // Fetch areas when district changes
    useEffect(() => {
        if (!selectedDistrict) { setAreas([]); setSelectedArea(''); return; }
        setLoadingAreas(true);
        setAreas([]);
        setSelectedArea('');
        fetch(`/api/delivery-coverage/areas/areas?district=${encodeURIComponent(selectedDistrict)}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setAreas(Array.isArray(data) ? data : []))
            .catch(() => setAreas([]))
            .finally(() => setLoadingAreas(false));
    }, [selectedDistrict]);

    const handleDone = async () => {
        if (!selectedDistrict) {
            toast.error('Please select at least a district');
            return;
        }

        setSaving(true);
        try {
            const labelParts = [selectedArea, selectedDistrict, selectedDivision].filter(Boolean);
            const payload = {
                label: labelParts.join(', '),
                division_name: selectedDivision,
                district_name: selectedDistrict,
                district: selectedDistrict,
                area: selectedArea,
                lat: null,
                lng: null,
            };

            setDeliveryLocation(payload);

            if (isAuthenticated) {
                await axios.post('/customer-auth/delivery-location', {
                    division: selectedDivision,
                    district: selectedDistrict,
                    area: selectedArea || null,
                }).catch(() => {});
            }

            toast.success('Delivery location saved');
            onClose?.();
        } catch (_) {
            toast.error('Failed to save location');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    if (!isOpen) return null;

    const isComplete = !!selectedDistrict;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-200 flex flex-col">

                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ background: 'linear-gradient(135deg, #5D0096 0%, #7a00c4 100%)' }}
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-white" />
                        <span className="text-white font-bold text-base">
                            {t('deliveryLocation') || 'Set Delivery Location'}
                        </span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <p className="text-sm text-gray-500">
                        Select your delivery area to see available products and estimated delivery.
                    </p>

                    {/* Division */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Division
                        </label>
                        <div className="relative">
                            <select
                                value={selectedDivision}
                                onChange={e => setSelectedDivision(e.target.value)}
                                disabled={loadingDivisions}
                                className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D0096]/30 focus:border-[#5D0096] cursor-pointer appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">
                                    {loadingDivisions ? 'Loading…' : 'Select Division'}
                                </option>
                                {divisions.map(d => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {loadingDivisions
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <ChevronDown className="h-4 w-4" />}
                            </div>
                        </div>
                    </div>

                    {/* District */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            District
                        </label>
                        <div className="relative">
                            <select
                                value={selectedDistrict}
                                onChange={e => setSelectedDistrict(e.target.value)}
                                disabled={!selectedDivision || loadingDistricts}
                                className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D0096]/30 focus:border-[#5D0096] cursor-pointer appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">
                                    {!selectedDivision
                                        ? 'Select Division first'
                                        : loadingDistricts ? 'Loading…'
                                        : 'Select District'}
                                </option>
                                {districts.map(d => (
                                    <option key={d.name} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {loadingDistricts
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <ChevronDown className="h-4 w-4" />}
                            </div>
                        </div>
                    </div>

                    {/* Area / Upazila */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            Area / Upazila
                        </label>
                        <div className="relative">
                            <select
                                value={selectedArea}
                                onChange={e => setSelectedArea(e.target.value)}
                                disabled={!selectedDistrict || loadingAreas}
                                className="w-full h-11 pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D0096]/30 focus:border-[#5D0096] cursor-pointer appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <option value="">
                                    {!selectedDistrict
                                        ? 'Select District first'
                                        : loadingAreas ? 'Loading…'
                                        : areas.length === 0 ? 'No areas listed'
                                        : 'Select Area (optional)'}
                                </option>
                                {areas.map(a => (
                                    <option key={a.name} value={a.name}>{a.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {loadingAreas
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <ChevronDown className="h-4 w-4" />}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {isComplete && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-purple-50 border border-purple-100 rounded-lg">
                            <CheckCircle2 className="h-4 w-4 text-[#5D0096] flex-shrink-0" />
                            <p className="text-sm font-medium text-[#5D0096] leading-snug">
                                {[selectedArea, selectedDistrict, selectedDivision].filter(Boolean).join(', ')}
                            </p>
                        </div>
                    )}

                    {/* Done button */}
                    <button
                        onClick={handleDone}
                        disabled={!isComplete || saving}
                        className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                            background: isComplete ? 'linear-gradient(135deg, #5D0096 0%, #7a00c4 100%)' : undefined,
                            backgroundColor: isComplete ? undefined : '#e5e7eb',
                            color: isComplete ? '#fff' : '#9ca3af',
                        }}
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {saving ? 'Saving…' : 'Confirm Location'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLocationModal;
