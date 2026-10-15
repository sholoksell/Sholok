import { useEffect, useState } from 'react';
import { Truck, MapPin, RefreshCw, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-BD', { month: 'short', day: 'numeric' });
}

export default function DeliveryInfoCard({ product, onChangeLocation }) {
    const { location } = useDeliveryLocation();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const isGrocery = product?.product_type === 'perishable' || product?.category?.slug?.includes('grocery');

    useEffect(() => {
        calculateDelivery();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location?.district_id, location?.district, product?._id, isGrocery]);

    const calculateDelivery = async () => {
        setLoading(true);
        try {
            if (isGrocery) {
                setInfo({ charge: 60, deliveryType: 'grocery', estimatedDaysMin: 0, estimatedDaysMax: 0 });
                setLoading(false);
                return;
            }

            const weightKg = product?.weight_kg || 0.5;

            // Prefer numeric district_id (from new location modal with DB districts)
            if (location?.district_id) {
                const res = await fetch(`${API_BASE}/delivery-coverage/calculate-charge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        district_id: location.district_id,
                        weight_kg: weightKg,
                        is_grocery: false,
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setInfo(data);
                    setLoading(false);
                    return;
                }
            }

            // Fallback: old delivery-rates API (district/area name strings)
            const params = new URLSearchParams({ weight: weightKg.toFixed(2) });
            if (location?.district) params.set('district', location.district);
            if (location?.area) params.set('area', location.area);
            const res2 = await fetch(`${API_BASE}/delivery-rates/charge?${params}`);
            if (res2.ok) {
                const data = await res2.json();
                if (data.matched) {
                    setInfo({ charge: data.charge, deliveryType: 'standard', estimatedDaysMin: 1, estimatedDaysMax: 3 });
                } else {
                    setInfo({ charge: 100, deliveryType: 'nationwide', estimatedDaysMin: 3, estimatedDaysMax: 7 });
                }
            } else {
                setInfo({ charge: 100, deliveryType: 'nationwide', estimatedDaysMin: 3, estimatedDaysMax: 7 });
            }
        } catch {
            setInfo({ charge: 100, deliveryType: 'inside_city', estimatedDaysMin: 1, estimatedDaysMax: 3 });
        } finally {
            setLoading(false);
        }
    };

    const locationLabel = () => {
        if (!location) return null;
        const parts = [];
        if (location.division_name) parts.push(location.division_name);
        if (location.district_name || location.district) parts.push(location.district_name || location.district);
        if (location.area) parts.push(location.area);
        return parts.join(', ') || location.label;
    };

    const etaText = () => {
        if (!info) return null;
        if (info.deliveryType === 'grocery') return 'Same day';
        const min = info.estimatedDaysMin ?? 1;
        const max = info.estimatedDaysMax ?? 3;
        return `Guaranteed by ${addDays(min)}-${addDays(max)}`;
    };

    const chargeText = () => {
        if (!info) return '...';
        if (info.charge === 0 || info.deliveryType === 'free') return 'Free';
        return `৳${info.charge}`;
    };

    return (
        <div className="space-y-3 text-sm">
            {/* ── Delivery Options Header ── */}
            <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Delivery Options</span>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>

            {/* ── Location row ── */}
            <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    {locationLabel() ? (
                        <p className="text-foreground text-xs leading-snug line-clamp-2">{locationLabel()}</p>
                    ) : (
                        <p className="text-muted-foreground text-xs">Select your location</p>
                    )}
                </div>
                <button
                    onClick={onChangeLocation}
                    className="flex-shrink-0 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide"
                >
                    Change
                </button>
            </div>

            {/* ── Standard Delivery row ── */}
            <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">Standard Delivery</p>
                    {!loading && info && (
                        <p className="text-xs text-muted-foreground mt-0.5">{etaText()}</p>
                    )}
                    {loading && <p className="text-xs text-muted-foreground mt-0.5">Calculating…</p>}
                </div>
                <span className={`flex-shrink-0 font-semibold text-sm ${info?.charge === 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {loading ? '—' : chargeText()}
                </span>
            </div>

            {/* ── COD row ── */}
            <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">Cash on Delivery Available</span>
            </div>

            {/* ── Return & Warranty ── */}
            <div className="border-t pt-3 mt-1">
                <p className="font-semibold text-foreground mb-2">Return & Warranty</p>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>Change of Mind allowed within 7 days</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>14 days easy return</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span>Warranty not available</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
