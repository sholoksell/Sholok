import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-indigo-100 text-indigo-700', in_transit: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', returned: 'bg-red-100 text-red-700',
};

export default function VendorShipments() {
  const { token } = useVendorAuth();
  const [shipments, setShipments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('/admin-api/vendor/shipments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setShipments(data); })
      .catch(() => {});
  }, [token]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">My Shipments</h1>
      <Card>
        <CardContent className="pt-4">
          {shipments.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No shipments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Shipment #</th>
                  <th className="pb-2 font-medium">Order #</th>
                  <th className="pb-2 font-medium">Tracking</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr></thead>
                <tbody>
                  {shipments.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">#{s.shipment_number}</td>
                      <td className="py-3">#{s.order_id}</td>
                      <td className="py-3 font-mono text-xs">{s.tracking_number || '—'}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span></td>
                      <td className="py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
