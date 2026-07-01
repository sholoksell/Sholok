import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { wishlistService } from '@/services/wishlistService';
import { rewardService } from '@/services/rewardService';
import { reviewService } from '@/services/reviewService';
import { notificationService } from '@/services/notificationService';
import { addressService } from '@/services/addressService';
import api from '@/lib/axios';
import {
  User, MapPin, ShoppingBag, Heart, Settings, LogOut, Trash2,
  AlertTriangle, Loader2, Award, Star, Gift, Bell, BellDot,
  ChevronDown, ChevronUp, CheckCheck, Lock, Edit2, Save, X,
  Printer, ExternalLink, Truck, Package, Clock, CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

const AccountPage = () => {
  const { customer, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [orders, setOrders] = React.useState([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
  const [expandedOrderId, setExpandedOrderId] = React.useState(null);
  const [wishlistItems, setWishlistItems] = React.useState([]);
  const [loadingWishlist, setLoadingWishlist] = React.useState(false);
  const [rewardData, setRewardData] = React.useState(null);
  const [loadingRewards, setLoadingRewards] = React.useState(false);
  const [myReviews, setMyReviews] = React.useState([]);
  const [loadingReviews, setLoadingReviews] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [loadingNotifs, setLoadingNotifs] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Profile edit
  const [editingProfile, setEditingProfile] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = React.useState(false);

  // Address book
  const [addresses, setAddresses] = React.useState([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);
  const defaultAddrForm = { label: 'Home', name: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'Bangladesh', type: 'both', isDefault: false };
  const [addrModalOpen, setAddrModalOpen] = React.useState(false);
  const [addrForm, setAddrForm] = React.useState(defaultAddrForm);
  const [editingAddrId, setEditingAddrId] = React.useState(null);
  const [savingAddr, setSavingAddr] = React.useState(false);

  // Address edit (legacy single)
  const [editingAddress, setEditingAddress] = React.useState(false);
  const [addressForm, setAddressForm] = React.useState({ street: '', city: '', state: '', zipCode: '', country: '' });
  const [savingAddress, setSavingAddress] = React.useState(false);

  // Password change
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [pwForm, setPwForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = React.useState(false);

  const handlePrintInvoice = (order) => {
    const win = window.open('', '_blank');
    const resolveStr = (v) => !v ? '' : (typeof v === 'object' ? (v.en || v.bn || '') : String(v));
    const items = (order.items || []).map(item => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:8px">${resolveStr(item.productName || item.name)}${item.variant ? ` (${item.variant})` : ''}</td>
        <td style="padding:8px;text-align:center">${item.quantity}</td>
        <td style="padding:8px;text-align:right">৳${(item.price || 0).toLocaleString()}</td>
        <td style="padding:8px;text-align:right">৳${((item.price || 0) * item.quantity).toLocaleString()}</td>
      </tr>`).join('');
    const addr = order.deliveryAddress || order.shippingAddress || {};
    const addrParts = [addr.name, addr.phone, addr.street || addr.addressLine1, addr.city || addr.area, addr.state, addr.zipCode || addr.postalCode, addr.country].filter(Boolean);
    const addrStr = addrParts.join(', ');
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${order.orderNumber}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;max-width:700px;margin:0 auto}h1{font-size:22px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f5f5f5;padding:8px;text-align:left}td{padding:8px}tfoot td{font-weight:bold;border-top:2px solid #333}@media print{button{display:none}}</style>
    </head><body>
      <h1>Invoice</h1>
      <p style="color:#666">Order: <strong>${order.orderNumber}</strong> &nbsp;|&nbsp; Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
      ${addrStr ? `<p>Deliver to: ${addrStr}</p>` : ''}
      ${order.trackingNumber ? `<p>Tracking: <strong>${order.trackingNumber}</strong>${order.courierName ? ` via ${order.courierName}` : ''}</p>` : ''}
      <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>${items}</tbody>
        <tfoot>
          <tr><td colspan="3">Subtotal</td><td style="text-align:right">৳${(order.subtotal || 0).toLocaleString()}</td></tr>
          ${(order.deliveryCharge || order.shipping || 0) > 0 ? `<tr><td colspan="3">Shipping</td><td style="text-align:right">৳${(order.deliveryCharge || order.shipping || 0).toLocaleString()}</td></tr>` : ''}
          ${(order.discount || 0) > 0 ? `<tr><td colspan="3">Discount</td><td style="text-align:right">-৳${(order.discount || 0).toLocaleString()}</td></tr>` : ''}
          <tr><td colspan="3" style="font-size:16px">Total</td><td style="text-align:right;font-size:16px">৳${(order.total || 0).toLocaleString()}</td></tr>
        </tfoot>
      </table>
      <p style="margin-top:16px;color:#666">Payment: ${order.paymentMethod || 'N/A'} &nbsp;|&nbsp; Status: ${order.paymentStatus || 'N/A'}</p>
      <button onclick="window.print()" style="margin-top:16px;padding:8px 20px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer">Print</button>
    </body></html>`);
    win.document.close();
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancel(orderId);
      setOrders((prev) => prev.map((o) =>
        o._id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      setConfirmDeleteId(null);
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'addresses') {
      setLoadingAddresses(true);
      addressService.getAll()
        .then((data) => setAddresses(data || []))
        .catch(() => toast.error('Failed to load addresses'))
        .finally(() => setLoadingAddresses(false));
    }
    if (activeTab === 'orders') {
      setLoadingOrders(true);
      orderService.getAll()
        .then((data) => setOrders(data))
        .catch(() => toast.error('Failed to load orders'))
        .finally(() => setLoadingOrders(false));
    }
    if (activeTab === 'wishlist') {
      setLoadingWishlist(true);
      wishlistService.getAll()
        .then((data) => setWishlistItems(data.wishlist || []))
        .catch(() => toast.error('Failed to load wishlist'))
        .finally(() => setLoadingWishlist(false));
    }
    if (activeTab === 'rewards') {
      setLoadingRewards(true);
      rewardService.getMyPoints()
        .then((data) => setRewardData(data))
        .catch(() => toast.error('Failed to load rewards'))
        .finally(() => setLoadingRewards(false));
    }
    if (activeTab === 'reviews') {
      setLoadingReviews(true);
      reviewService.getMyReviews()
        .then((data) => setMyReviews(data.reviews || data || []))
        .catch(() => toast.error('Failed to load reviews'))
        .finally(() => setLoadingReviews(false));
    }
    if (activeTab === 'notifications') {
      setLoadingNotifs(true);
      notificationService.getAll()
        .then((data) => setNotifications(data || []))
        .catch(() => toast.error('Failed to load notifications'))
        .finally(() => setLoadingNotifs(false));
    }
    if (activeTab === 'settings' && customer) {
      setProfileForm({ name: customer.name || '', phone: customer.phone || '' });
      setAddressForm({
        street: customer.address?.street || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        zipCode: customer.address?.zipCode || '',
        country: customer.address?.country || '',
      });
    }
    if (activeTab === 'dashboard' && orders.length === 0) {
      orderService.getAll().then((data) => setOrders(data)).catch(() => {});
      wishlistService.getAll().then((d) => setWishlistItems(d.wishlist || [])).catch(() => {});
      rewardService.getMyPoints().then((d) => setRewardData(d)).catch(() => {});
    }
  }, [activeTab]);

  const handleAddressSave = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      let result;
      if (editingAddrId) {
        result = await addressService.update(editingAddrId, addrForm);
      } else {
        result = await addressService.create(addrForm);
      }
      setAddresses(result);
      setAddrModalOpen(false);
      setAddrForm(defaultAddrForm);
      setEditingAddrId(null);
      toast.success(editingAddrId ? 'Address updated' : 'Address added');
    } catch {
      toast.error('Failed to save address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const result = await addressService.delete(id);
      setAddresses(result);
      toast.success('Address deleted');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const result = await addressService.setDefault(id);
      setAddresses(result);
      toast.success('Default address updated');
    } catch {
      toast.error('Failed to update default');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistService.remove(productId);
      setWishlistItems(prev => prev.filter(item => (item._id || item.id) !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleMarkNotifRead = async (notifId) => {
    try {
      await notificationService.markRead(notifId);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const result = await updateProfile({ name: profileForm.name, phone: profileForm.phone });
    setSavingProfile(false);
    if (result.success) {
      toast.success('Profile updated');
      setEditingProfile(false);
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      await api.put('/customer-auth/address', addressForm);
      toast.success('Address updated');
      setEditingAddress(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/customer-auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setChangingPassword(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please Login</h1>
        <p className="text-muted-foreground mb-6">
          You need to login to access your account
        </p>
        <Link to="/login">
          <Button>Login Now</Button>
        </Link>
      </div>
    );
  }

  // Account suspension check
  const isSuspended = customer.suspendedUntil && new Date(customer.suspendedUntil) > new Date();

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border rounded-lg overflow-hidden">
                      {/* Confirm cancel banner */}
                      {confirmDeleteId === order._id && (
                        <div className="bg-red-50 border-b border-red-200 p-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-sm font-medium">Cancel order <strong>{order.orderNumber}</strong>? This cannot be undone.</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDeleteId(null)}>Keep</Button>
                            <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={() => handleCancelOrder(order._id)}>Yes, Cancel</Button>
                          </div>
                        </div>
                      )}

                      {/* Order header */}
                      <div
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 gap-3"
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                          {/* Product thumbnails strip */}
                          {order.items?.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {order.items.slice(0, 5).map((item, idx) => {
                                const img = item.image || item.thumbnail || item.productId?.thumbnail || item.productId?.images?.[0];
                                const name = item.productName || item.name || (typeof item.productId?.name === 'object' ? item.productId.name?.en : item.productId?.name) || '';
                                return img ? (
                                  <img key={idx} src={getImageUrl(img)} alt={name} title={name}
                                    className="w-10 h-10 object-contain rounded border bg-white flex-shrink-0" />
                                ) : (
                                  <div key={idx} className="w-10 h-10 rounded border bg-muted flex items-center justify-center flex-shrink-0" title={name}>
                                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                );
                              })}
                              {order.items.length > 5 && (
                                <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                                  +{order.items.length - 5}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <p className="font-bold">৳{order.total}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'out_for_delivery' ? 'bg-cyan-100 text-cyan-800' :
                              'bg-blue-100 text-blue-800'}`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(order._id); }}
                              >
                                <Trash2 className="w-3 h-3" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs gap-1"
                              onClick={(e) => { e.stopPropagation(); handlePrintInvoice(order); }}
                            >
                              <Printer className="w-3 h-3" /> Invoice
                            </Button>
                            {expandedOrderId === order._id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded order details */}
                      {expandedOrderId === order._id && (
                        <div className="border-t bg-muted/10 p-4 space-y-4">
                          {/* Tracking info */}
                          {(order.trackingNumber || order.courierName || order.estimatedDeliveryDate) && (
                            <div className="flex flex-wrap gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                              {order.courierName && (
                                <div className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-blue-500" /><span className="text-muted-foreground">Courier:</span><span className="font-medium">{order.courierName}</span></div>
                              )}
                              {order.trackingNumber && (
                                <div className="flex items-center gap-1.5"><Package className="w-4 h-4 text-blue-500" /><span className="text-muted-foreground">Tracking:</span><span className="font-mono font-medium">{order.trackingNumber}</span></div>
                              )}
                              {order.estimatedDeliveryDate && (
                                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /><span className="text-muted-foreground">ETA:</span><span className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</span></div>
                              )}
                              <Link to={`/track-order?order=${order.orderNumber}`} className="ml-auto flex items-center gap-1 text-primary text-xs hover:underline">
                                <ExternalLink className="w-3 h-3" /> Track Live
                              </Link>
                            </div>
                          )}

                          {/* Status timeline */}
                          {order.statusHistory && order.statusHistory.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Order Timeline</p>
                              <div className="space-y-2">
                                {[...order.statusHistory].reverse().map((entry, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="font-medium capitalize">{entry.status?.replace(/_/g, ' ')}</span>
                                      {entry.note && <span className="text-muted-foreground ml-1">— {entry.note}</span>}
                                      <p className="text-xs text-muted-foreground">{entry.date ? new Date(entry.date).toLocaleString() : ''}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Items */}
                          {order.items?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">Order Items</p>
                              <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    {(item.image || item.thumbnail || item.productId?.thumbnail || item.productId?.images?.[0]) ? (
                                      <img
                                        src={getImageUrl(item.image || item.thumbnail || item.productId?.thumbnail || item.productId?.images?.[0])}
                                        alt={item.productName || item.name || ''}
                                        className="w-12 h-12 object-contain rounded bg-white border"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1">{item.productName || item.name || (typeof item.productId?.name === 'object' ? item.productId.name?.en : item.productId?.name) || 'Product'}</p>
                                      {item.variant && <p className="text-xs text-muted-foreground">{item.variant}</p>}
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-medium">৳{item.price?.toLocaleString()}</p>
                                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Totals */}
                          <div className="pt-2 border-t space-y-1 text-sm">
                            {(order.subtotal > 0) && <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>৳{order.subtotal?.toLocaleString()}</span></div>}
                            {(order.deliveryCharge || order.shipping || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>৳{(order.deliveryCharge || order.shipping).toLocaleString()}</span></div>}
                            {(order.discount || 0) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{order.discount.toLocaleString()}</span></div>}
                            <div className="flex justify-between font-bold text-base border-t pt-1">
                              <span>Total</span><span>৳{order.total?.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p>No orders found</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'addresses':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Address Book</CardTitle>
                <Button size="sm" onClick={() => { setAddrForm(defaultAddrForm); setEditingAddrId(null); setAddrModalOpen(true); }}>
                  + Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAddresses ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground">No saved addresses yet</p>
                  <Button className="mt-4" onClick={() => { setAddrForm(defaultAddrForm); setEditingAddrId(null); setAddrModalOpen(true); }}>Add Address</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr._id} className={`border rounded-lg p-4 ${addr.isDefault ? 'border-primary bg-primary/5' : ''}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-sm">{addr.label}</span>
                            {addr.isDefault && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Default</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${addr.type === 'billing' ? 'bg-blue-100 text-blue-700' : addr.type === 'shipping' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {addr.type === 'both' ? 'Billing & Shipping' : addr.type}
                            </span>
                          </div>
                          {(addr.name || addr.phone) && (
                            <p className="text-sm">{addr.name}{addr.phone ? ` · ${addr.phone}` : ''}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {[addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {!addr.isDefault && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleSetDefaultAddress(addr._id)}>
                              Set Default
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAddrForm(addr); setEditingAddrId(addr._id); setAddrModalOpen(true); }}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteAddress(addr._id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Address Modal */}
              {addrModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setAddrModalOpen(false); }}>
                  <div className="bg-background border rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{editingAddrId ? 'Edit Address' : 'Add Address'}</h3>
                      <button onClick={() => setAddrModalOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                    <form onSubmit={handleAddressSave} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Label</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.label || ''} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Home, Work..." />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Type</label>
                          <select className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.type || 'both'} onChange={e => setAddrForm({ ...addrForm, type: e.target.value })}>
                            <option value="both">Billing & Shipping</option>
                            <option value="billing">Billing</option>
                            <option value="shipping">Shipping</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Contact Name</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.name || ''} onChange={e => setAddrForm({ ...addrForm, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Phone</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.phone || ''} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Street</label>
                        <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                          value={addrForm.street || ''} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">City *</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.city || ''} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">State</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.state || ''} onChange={e => setAddrForm({ ...addrForm, state: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Zip Code</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.zipCode || ''} onChange={e => setAddrForm({ ...addrForm, zipCode: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Country</label>
                          <input className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            value={addrForm.country || 'Bangladesh'} onChange={e => setAddrForm({ ...addrForm, country: e.target.value })} />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!addrForm.isDefault} onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })} />
                        Set as default address
                      </label>
                      <div className="flex gap-2 pt-2">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setAddrModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1" disabled={savingAddr}>{savingAddr ? 'Saving...' : editingAddrId ? 'Update' : 'Add'}</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'wishlist':
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWishlist ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item._id || item.id} className="border rounded-lg p-3 flex gap-3">
                      <Link to={`/product/${item.slug}`} className="flex-shrink-0">
                        <img
                          src={getImageUrl(item.image || item.images?.[0] || item.thumbnail)}
                          alt={item.name}
                          className="w-20 h-20 object-contain rounded bg-gray-50"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug}`} className="font-medium text-sm hover:text-primary line-clamp-2">{item.name}</Link>
                        <p className="text-primary font-bold mt-1">৳{item.price || item.salePrice}</p>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                            <Link to={`/product/${item.slug}`}>View</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p>Your wishlist is empty</p>
                  <Link to="/"><Button variant="outline" className="mt-4">Browse Products</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'rewards':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" /> Reward Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRewards ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : rewardData ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Gift className="w-7 h-7 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-yellow-700">{rewardData.rewardPoints || 0}</p>
                      <p className="text-sm text-yellow-600">Available Points</p>
                    </div>
                    {rewardData.group && rewardData.group !== 'regular' && (
                      <div className="ml-auto px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                        {rewardData.group} Member
                        {rewardData.groupDiscount > 0 && ` (${rewardData.groupDiscount}% off)`}
                      </div>
                    )}
                  </div>
                  {/* Points Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                      <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
                      <p className="text-xl font-bold text-green-600">+{rewardData.totalPointsEarned || 0}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center border border-red-100">
                      <p className="text-xs text-muted-foreground mb-1">Total Used</p>
                      <p className="text-xl font-bold text-red-500">-{rewardData.totalPointsRedeemed || 0}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-100">
                      <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                      <p className="text-xl font-bold text-yellow-600">{rewardData.rewardPoints || 0}</p>
                    </div>
                  </div>
                  {rewardData.pointsHistory && rewardData.pointsHistory.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-3">Points History</h4>
                      <div className="space-y-2">
                        {rewardData.pointsHistory.slice().reverse().map((entry, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                            <div>
                              <p className="font-medium capitalize">{entry.type}</p>
                              <p className="text-xs text-muted-foreground">{entry.description}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.points > 0 ? '+' : ''}{entry.points}
                              </p>
                              <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No points activity yet. Start shopping to earn points!</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p>No reward data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'reviews':
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReviews ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : myReviews.length > 0 ? (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Link to={`/product/${review.productId?.slug}`} className="font-medium text-sm hover:text-primary">
                            {review.productId?.name || 'Product'}
                          </Link>
                          <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          review.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                      {review.title && <p className="font-medium text-sm">{review.title}</p>}
                      {review.comment && <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p>You haven't written any reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
                  )}
                </CardTitle>
                {unreadCount > 0 && (
                  <Button size="sm" variant="outline" onClick={handleMarkAllRead}>
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingNotifs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 border rounded-lg transition-colors ${!notif.read ? 'bg-primary/5 border-primary/30' : ''}`}
                      onClick={() => !notif.read && handleMarkNotifRead(notif._id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                            <p className="font-medium text-sm">{notif.title}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            notif.type === 'promo' ? 'bg-purple-100 text-purple-700' :
                            notif.type === 'warning' ? 'bg-red-100 text-red-700' :
                            notif.type === 'account' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{notif.type}</span>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                  <p>No notifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'settings':
        return (
          <div className="space-y-4">
            {/* Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!editingProfile && (
                    <Button size="sm" variant="outline" onClick={() => {
                      setProfileForm({ name: customer.name || '', phone: customer.phone || '' });
                      setEditingProfile(true);
                    }}>
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingProfile ? (
                  <>
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <input
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <input
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
                        value={customer.email}
                        disabled
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={savingProfile}>
                        <Save className="w-4 h-4 mr-1" />
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{customer.phone || 'Not set'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </CardTitle>
                  {!changingPassword && (
                    <Button size="sm" variant="outline" onClick={() => setChangingPassword(true)}>
                      Change
                    </Button>
                  )}
                </div>
              </CardHeader>
              {changingPassword && (
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={pwForm.currentPassword}
                        onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        minLength={6}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={savingPw}>
                        {savingPw ? 'Saving...' : 'Change Password'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setChangingPassword(false);
                        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-4">
            {/* Account status warning */}
            {customer.status === 'blocked' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <strong>Account Blocked:</strong> Your account has been blocked. Please contact support.
                {isSuspended && ` (Until ${new Date(customer.suspendedUntil).toLocaleDateString()})`}
              </div>
            )}

            {/* Group badge */}
            {customer.group && customer.group !== 'regular' && (
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium capitalize">{customer.group} Member</p>
                  {customer.groupDiscount > 0 && (
                    <p className="text-sm text-muted-foreground">You get {customer.groupDiscount}% discount on all orders</p>
                  )}
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{customer.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{customer.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Quick Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-2xl font-bold text-primary">{orders.length}</p>
                          <p className="text-sm text-muted-foreground">Total Orders</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-2xl font-bold text-primary">{wishlistItems.length}</p>
                          <p className="text-sm text-muted-foreground">Wishlist</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <p className="text-2xl font-bold text-primary">{rewardData?.rewardPoints || customer.rewardPoints || 0}</p>
                          <p className="text-sm text-muted-foreground">Reward Points</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center cursor-pointer hover:bg-muted/30" onClick={() => setActiveTab('notifications')}>
                          <p className="text-2xl font-bold text-primary">{unreadCount}</p>
                          <p className="text-sm text-muted-foreground">Notifications</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    {customer.group && customer.group !== 'regular' && (
                      <p className="text-xs capitalize text-primary font-medium mt-0.5">{customer.group} Member</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('dashboard')}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant={activeTab === 'orders' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('orders')}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  My Orders
                </Button>
                <Button variant={activeTab === 'addresses' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('addresses')}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Addresses
                </Button>
                <Button variant={activeTab === 'wishlist' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('wishlist')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist
                </Button>
                <Button variant={activeTab === 'rewards' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('rewards')}>
                  <Award className="w-4 h-4 mr-2" />
                  Reward Points
                </Button>
                <Button variant={activeTab === 'reviews' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('reviews')}>
                  <Star className="w-4 h-4 mr-2" />
                  My Reviews
                </Button>
                <Button variant={activeTab === 'notifications' ? 'secondary' : 'ghost'} className="w-full justify-between" onClick={() => setActiveTab('notifications')}>
                  <span className="flex items-center">
                    {unreadCount > 0 ? <BellDot className="w-4 h-4 mr-2 text-primary" /> : <Bell className="w-4 h-4 mr-2" />}
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5">{unreadCount}</span>
                  )}
                </Button>
                <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveTab('settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <div className="pt-2 mt-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
