import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, ChevronDown, Loader2, CheckCircle } from 'lucide-react';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = '/api';

export default function DeliveryLocationModal({ isOpen, onClose }) {
  const { setLocation } = useDeliveryLocation();
  const { isAuthenticated, customer } = useAuth();

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);

  const [selDivision, setSelDivision] = useState(null);
  const [selDistrict, setSelDistrict] = useState(null);
  const [selUpazila, setSelUpazila] = useState(null);

  const [loadingDiv, setLoadingDiv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);
  const [loadingUpz, setLoadingUpz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load divisions on open
  useEffect(() => {
    if (!isOpen) return;
    setSaved(false);
    setError('');
    setLoadingDiv(true);
    fetch(`${API_BASE}/delivery-coverage/location/divisions`)
      .then(r => r.json())
      .then(data => setDivisions(Array.isArray(data) ? data : data.divisions || []))
      .catch(() => setError('Failed to load divisions'))
      .finally(() => setLoadingDiv(false));
  }, [isOpen]);

  // Load saved location for logged-in customer
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const token = localStorage.getItem('customerToken');
    if (!token) return;
    fetch(`${API_BASE}/customer-location`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setSelDivision({ id: data.divisionName, name: data.divisionName });
        setSelDistrict({ id: data.districtName, name: data.districtName });
        setSelUpazila({ id: data.upazilaName, name: data.upazilaName });
      })
      .catch(() => {});
  }, [isOpen, isAuthenticated]);

  // Load districts when division changes
  useEffect(() => {
    if (!selDivision) { setDistricts([]); setSelDistrict(null); setUpazilas([]); setSelUpazila(null); return; }
    setLoadingDist(true);
    setSelDistrict(null);
    setUpazilas([]);
    setSelUpazila(null);
    fetch(`${API_BASE}/delivery-coverage/location/districts?division=${encodeURIComponent(selDivision.name)}`)
      .then(r => r.json())
      .then(data => setDistricts(Array.isArray(data) ? data : data.districts || []))
      .catch(() => setError('Failed to load districts'))
      .finally(() => setLoadingDist(false));
  }, [selDivision?.id]);

  // Load upazilas when district changes
  useEffect(() => {
    if (!selDistrict) { setUpazilas([]); setSelUpazila(null); return; }
    setLoadingUpz(true);
    setSelUpazila(null);
    fetch(`${API_BASE}/delivery-coverage/location/areas?district=${encodeURIComponent(selDistrict.name)}`)
      .then(r => r.json())
      .then(data => setUpazilas(Array.isArray(data) ? data : data.upazilas || []))
      .catch(() => setError('Failed to load areas'))
      .finally(() => setLoadingUpz(false));
  }, [selDistrict?.id]);

  const handleConfirm = useCallback(async () => {
    if (!selUpazila || !selDistrict || !selDivision) return;
    setError('');
    setSaving(true);

    const payload = {
      label: `${selUpazila.name}, ${selDistrict.name}`,
      upazilaId: selUpazila.id,
      upazilaName: selUpazila.name,
      districtId: selDistrict.id,
      districtName: selDistrict.name,
      divisionId: selDivision.id,
      divisionName: selDivision.name,
    };

    // Save to localStorage immediately
    setLocation(payload);

    // Sync to backend if logged in
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('customerToken');
        await fetch(`${API_BASE}/customer-location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            division_name: selDivision.name,
            district_name: selDistrict.name,
            upazila_name: selUpazila.name,
          }),
        });
      } catch {
        // localStorage already saved — non-fatal
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => onClose(), 800);
  }, [selDivision, selDistrict, selUpazila, isAuthenticated, setLocation, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg,#5D0096,#7A00BB)' }}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">Delivery Location</p>
              <p className="text-white/70 text-xs">Choose your area for accurate delivery</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {/* Division */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Division</label>
            <div className="relative">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm appearance-none bg-gray-50 focus:outline-none focus:ring-2 focus:border-purple-400 disabled:opacity-50"
                style={{ '--tw-ring-color': '#5D0096' }}
                value={selDivision?.id || ''}
                onChange={e => {
                  const d = divisions.find(x => String(x.id) === e.target.value);
                  setSelDivision(d || null);
                }}
                disabled={loadingDiv}
              >
                <option value="">— Select Division —</option>
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {loadingDiv ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
              </div>
            </div>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">District</label>
            <div className="relative">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm appearance-none bg-gray-50 focus:outline-none focus:ring-2 focus:border-purple-400 disabled:opacity-50"
                value={selDistrict?.id || ''}
                onChange={e => {
                  const d = districts.find(x => String(x.id) === e.target.value);
                  setSelDistrict(d || null);
                }}
                disabled={!selDivision || loadingDist}
              >
                <option value="">— Select District —</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {loadingDist ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
              </div>
            </div>
          </div>

          {/* Upazila / Area */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Area / Upazila</label>
            <div className="relative">
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm appearance-none bg-gray-50 focus:outline-none focus:ring-2 focus:border-purple-400 disabled:opacity-50"
                value={selUpazila?.id || ''}
                onChange={e => {
                  const u = upazilas.find(x => String(x.id) === e.target.value);
                  setSelUpazila(u || null);
                }}
                disabled={!selDistrict || loadingUpz}
              >
                <option value="">— Select Area —</option>
                {upazilas.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {loadingUpz ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
              </div>
            </div>
          </div>

          {/* Summary pill */}
          {selUpazila && selDistrict && selDivision && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 text-sm text-purple-800">
              <MapPin size={14} className="flex-shrink-0 text-purple-500" />
              <span className="font-medium">{selUpazila.name}, {selDistrict.name}, {selDivision.name}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selUpazila || saving || saved}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: saved ? '#10b981' : 'linear-gradient(135deg,#5D0096,#7A00BB)' }}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : (
              'Confirm Location'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
