import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';

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

const shipmentStatusConfig = {
  pending:          { label: 'Pending',           color: 'bg-gray-200 text-gray-600' },
  confirmed:        { label: 'Confirmed',          color: 'bg-blue-100 text-blue-600' },
  processing:       { label: 'Processing',         color: 'bg-yellow-100 text-yellow-700' },
  ready_for_pickup: { label: 'Ready for Pickup',   color: 'bg-orange-100 text-orange-700' },
  picked_up:        { label: 'Picked Up',          color: 'bg-purple-100 text-purple-700' },
  in_transit:       { label: 'In Transit',         color: 'bg-indigo-100 text-indigo-700' },
  out_for_delivery: { label: 'Out for Delivery',   color: 'bg-cyan-100 text-cyan-700' },
  delivered:        { label: 'Delivered',          color: 'bg-green-100 text-green-700' },
  failed_delivery:  { label: 'Failed Delivery',    color: 'bg-red-100 text-red-700' },
  returned:         { label: 'Returned',           color: 'bg-gray-100 text-gray-600' },
  cancelled:        { label: 'Cancelled',          color: 'bg-red-100 text-red-600' },
};

const SHIPMENT_STEPS = ['pending','confirmed','processing','picked_up','in_transit','out_for_delivery','delivered'];

function ShipmentCard({ shipment, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cfg = shipmentStatusConfig[shipment.status] || { label: shipment.status, color: 'bg-gray-100 text-gray-600' };
  const currentIdx = SHIPMENT_STEPS.indexOf(shipment.status);

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 text-sm">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-medium">Shipment #{index + 1}</span>
          <span className="font-mono text-xs text-muted-foreground">{shipment.shipmentNumber}</span>
          <Badge className={`${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 py-4 space-y-4">
          {/* Shipment meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {shipment.courierName && <div><p className="text-muted-foreground">Courier</p><p className="font-medium">{shipment.courierName}</p></div>}
            {shipment.trackingNumber && <div><p className="text-muted-foreground">Tracking #</p><p className="font-mono font-medium">{shipment.trackingNumber}</p></div>}
            {shipment.estimatedDaysMin && <div><p className="text-muted-foreground">ETA</p><p className="font-medium">{shipment.estimatedDaysMin}–{shipment.estimatedDaysMax} days</p></div>}
            {shipment.deliveryCharge != null && <div><p className="text-muted-foreground">Delivery Charge</p><p className="font-medium">৳{shipment.deliveryCharge}</p></div>}
          </div>

          {/* Items */}
          {shipment.items && shipment.items.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Items in this shipment</p>
              <div className="space-y-1">{shipment.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b last:border-b-0">
                  <span>{item.product_name || `Product #${item.product_id}`}</span>
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </div>
              ))}</div>
            </div>
          )}

          {/* Tracking timeline */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Tracking Timeline</p>
            {shipment.trackingEvents && shipment.trackingEvents.length > 0 ? (
              <div className="space-y-3">
                {shipment.trackingEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${shipmentStatusConfig[ev.status]?.color || 'bg-gray-100 text-gray-600'} border-0 text-xs`}>
                          {shipmentStatusConfig[ev.status]?.label || ev.status}
                        </Badge>
                        {ev.location && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                      </div>
                      {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Simple progress steps fallback */
              <div className="space-y-3">
                {SHIPMENT_STEPS.map((step, i) => {
                  const done = i <= currentIdx;
                  const Icon = i === 0 ? Clock : i < 5 ? Package : i === 5 ? Truck : CheckCircle;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-sm capitalize ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {shipmentStatusConfig[step]?.label || step.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrderData(null);
    setShipments([]);
    try {
      const res = await api.get(`/orders/track/${orderId.trim()}`);
      setOrderData(res.data);
      // Also fetch shipments for this order
      try {
        const ordNumeric = res.data?.id || res.data?._id;
        if (ordNumeric) {
          const sRes = await api.get(`/shipments/order/${ordNumeric}`);
          setShipments(sRes.data || []);
        }
      } catch { /* shipments optional */ }
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

                  {/* Shipments */}
                  {shipments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">
                        Shipments ({shipments.length})
                      </h3>
                      <div className="space-y-3">
                        {shipments.map((s, i) => (
                          <ShipmentCard key={s._id || s.shipmentNumber} shipment={s} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

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
