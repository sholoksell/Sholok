import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const TX_COLORS: Record<string, string> = { credit: 'text-green-600', debit: 'text-red-600', settlement: 'text-blue-600', hold: 'text-orange-500', release: 'text-purple-600' };

export default function VendorWallet() {
  const { token } = useVendorAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/admin-api/vendor/wallet', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data?.wallet !== undefined) setData(data); })
      .catch(() => {});
  }, [token]);

  const wallet = data?.wallet;
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Wallet & Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-600 rounded-xl"><Wallet size={20} className="text-white" /></div>
              <div>
                <p className="text-sm text-emerald-700">Available Balance</p>
                <p className="text-2xl font-bold text-emerald-800">৳{Number(wallet?.current_balance || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-yellow-500 rounded-xl"><Clock size={20} className="text-white" /></div>
              <div>
                <p className="text-sm text-gray-500">Pending Settlement</p>
                <p className="text-2xl font-bold">৳{Number(wallet?.pending_settlement || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-400 rounded-xl"><AlertCircle size={20} className="text-white" /></div>
              <div>
                <p className="text-sm text-gray-500">On Hold</p>
                <p className="text-2xl font-bold">৳{Number(wallet?.hold_amount || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No transactions yet</p>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleString()} · #{tx.reference_id || tx.id}</p>
                  </div>
                  <span className={`font-semibold ${TX_COLORS[tx.type] || 'text-gray-700'}`}>
                    {['debit', 'hold'].includes(tx.type) ? '-' : '+'}৳{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
