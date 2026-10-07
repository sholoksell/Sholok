import { useEffect, useState } from 'react';
import { Truck, Clock, MapPin, ChevronRight, Leaf } from 'lucide-react';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function DeliveryInfoCard({ product, onChangeLocation }) {
    const { location } = useDeliveryLocation();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const isGrocery = product?.product_type === 'perishable' || product?.category?.slug?.includes('grocery');

    useEffect(() => {
        calculateDelivery();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location?.district, location?.area, product?._id, isGrocery]);

    const calculateDelivery = async () => {
        setLoading(true);
        try {
            if (isGrocery) {
                setInfo({ charge: 60, deliveryType: 'grocery', estimatedDaysMin: 0, estimatedDaysMax: 0 });
                setLoading(false);
                return;
            }
            const weightKg = product?.weight_kg || 0.5;
            const params = new URLSearchParams({ weight: weightKg.toFixed(2) });
            if (location?.district) params.set('district', location.district);
            if (location?.area) params.set('area', location.area);

            const res = await fetch(`${API_BASE}/delivery-rates/charge?${params}`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            if (data.matched) {
                setInfo({
                    charge: data.charge,
                    deliveryType: 'standard',
                    estimatedDaysMin: 1,
                    estimatedDaysMax: 3,
                    groupName: data.groupName || '',
                });
            } else {
                setInfo({ charge: 100, deliveryType: 'nationwide', estimatedDaysMin: 3, estimatedDaysMax: 7 });
            }
        } catch {
            setInfo({ charge: 100, deliveryType: 'inside_city', estimatedDaysMin: 1, estimatedDaysMax: 3 });
        } finally {
            setLoading(false);
        }
    };

    const etaLabel = () => {
        if (!info) return '...';
        if (info.deliveryType === 'grocery') return 'আজই ডেলিভারি (Within 1-2 hours)';
        if (info.deliveryType === 'free') return `Free · ${info.estimatedDaysMin}-${info.estimatedDaysMax} days`;
        if (info.estimatedDaysMin === 0) return 'Same day';
        if (info.estimatedDaysMin === 1 && info.estimatedDaysMax <= 3) return `${info.estimatedDaysMin}-${info.estimatedDaysMax} business days`;
        return `${info.estimatedDaysMin}-${info.estimatedDaysMax} business days`;
    };

    const chargeLabel = () => {
        if (!info) return '...';
        if (info.charge === 0 || info.deliveryType === 'free') return 'Free';
        return `৳${info.charge}`;
    };

    return (
        <div className="rounded-lg border border-border bg-card p-3 space-y-2.5 text-sm">
            {/* Delivery ETA */}
            <div className="flex items-start gap-2.5">
                {isGrocery
                    ? <Leaf className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    : <Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">Delivery: </span>
                    <span className="font-semibold text-foreground">
                        {loading ? <span className="text-muted-foreground">Calculating...</span> : etaLabel()}
                    </span>
                </div>
                <span className={`font-semibold shrink-0 ${info?.deliveryType === 'free' ? 'text-green-600' : 'text-foreground'}`}>
                    {loading ? '' : chargeLabel()}
                </span>
            </div>

            {/* Grocery time slots notice */}
            {isGrocery && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 rounded px-2 py-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>সময় স্লট বেছে নিন চেকআউটে (Select time slot at checkout)</span>
                </div>
            )}

            {/* Location row */}
            <button
                onClick={onChangeLocation}
                className="flex items-center gap-2 w-full text-left hover:text-primary transition-colors group"
            >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Deliver to: </span>
                <span className={`truncate flex-1 text-xs ${location ? 'text-foreground font-medium' : 'text-primary underline'}`}>
                    {location?.label || 'Select your location'}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
            </button>

            {/* Coverage warning for grocery */}
            {isGrocery && location && !['Dhaka', 'dhaka'].some(d => (location.district || location.label || '').toLowerCase().includes(d.toLowerCase())) && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <span>⚠</span>
                    <span>Grocery delivery is only available in Dhaka city. Your location may not be covered.</span>
                </p>
            )}
        </div>
    );
}
