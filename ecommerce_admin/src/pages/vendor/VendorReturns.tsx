import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent } from '@/components/ui/card';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700', refunded: 'bg-blue-100 text-blue-700',
};

export default function VendorReturns() {
  const { token, vendor } = useVendorAuth();
  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    if (!vendor) return;
    fetch(`/admin-api/returns/vendor/${vendor._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setReturns(Array.isArray(d) ? d : []));
  }, [vendor, token]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Return Requests</h1>
      <Card>
        <CardContent className="pt-4">
          {returns.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No return requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Return #</th>
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Reason</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr></thead>
                <tbody>
                  {returns.map((r: any) => (
                    <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{r.returnNumber}</td>
                      <td className="py-3">#{r.orderNumber}</td>
                      <td className="py-3">{r.customerName}</td>
                      <td className="py-3 max-w-[150px] truncate">{r.reason}</td>
                      <td className="py-3 capitalize">{r.type}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                      <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
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
