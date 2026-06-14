import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: Clock,
};

const statusColors = {
  pending: 'bg-gray-200 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-600',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrderData(null);
    try {
      const res = await axios.get(`/api/orders/track/${orderId.trim()}`);
      setOrderData(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Order not found. Please check your order number and try again.');
      } else {
        setError('Failed to track order. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
            <p className="text-muted-foreground">Enter your order number to track your delivery</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Order Number</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. SH16123456781"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      required
                    />
                    <Button type="submit" disabled={loading}>
                      <Search className="w-4 h-4 mr-2" />
                      {loading ? 'Tracking...' : 'Track'}
                    </Button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              {orderData && (
                <div className="mt-6 space-y-6">
                  <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Order Number</p><p className="font-semibold">{orderData.orderNumber}</p></div>
                    <div><p className="text-muted-foreground">Status</p><Badge className={`${statusColors[orderData.status] || 'bg-gray-100'} border-0`}>{orderData.status?.replace(/_/g, ' ')}</Badge></div>
                    <div><p className="text-muted-foreground">Order Date</p><p className="font-medium">{new Date(orderData.createdAt).toLocaleDateString()}</p></div>
                    <div><p className="text-muted-foreground">Total</p><p className="font-semibold">৳{orderData.total?.toLocaleString()}</p></div>
                    {orderData.trackingNumber && (
                      <div><p className="text-muted-foreground">Tracking #</p><p className="font-mono font-medium">{orderData.trackingNumber}</p></div>
                    )}
                    {orderData.courierName && (
                      <div><p className="text-muted-foreground">Courier</p><p className="font-medium">{orderData.courierName}</p></div>
                    )}
                    {orderData.estimatedDeliveryDate && (
                      <div className="col-span-2"><p className="text-muted-foreground">Estimated Delivery</p><p className="font-medium">{new Date(orderData.estimatedDeliveryDate).toLocaleDateString()}</p></div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold mb-4">Order Timeline</h3>
                    {orderData.timeline && orderData.timeline.length > 0 ? (
                      <div className="space-y-4">
                        {orderData.timeline.map((step, index) => {
                          const Icon = statusIcons[step.status] || Clock;
                          return (
                            <div key={index} className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-400'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium capitalize ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {step.status?.replace(/_/g, ' ')}
                                </p>
                                {step.note && <p className="text-xs text-muted-foreground">{step.note}</p>}
                                <p className="text-xs text-muted-foreground">{step.date ? new Date(step.date).toLocaleString() : ''}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((step, index) => {
                          const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
                          const currentIdx = statuses.indexOf(orderData.status);
                          const stepIdx = statuses.indexOf(step);
                          const done = stepIdx <= currentIdx;
                          const Icon = statusIcons[step] || Clock;
                          return (
                            <div key={step} className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-400'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className={`font-medium capitalize ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-muted-foreground">{done ? 'Completed' : 'Pending'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!orderData && !error && (
                <div className="mt-6 text-center text-muted-foreground">
                  <p className="text-sm">You can find your order number in the confirmation email or your account orders page</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
