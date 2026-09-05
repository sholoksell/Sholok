import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Clock, TrendingUp, Zap, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useFeatureBanner } from '@/hooks/useFeatureBanner';

const OffersPage = () => {
  const featureBanner = useFeatureBanner('offers');
  const [coupons, setCoupons] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/marketing/coupons/active', { params: { limit: 20 } }).catch(() => ({ data: { coupons: [] } })),
      api.get('/marketing/flash-sales/active').catch(() => ({ data: [] })),
    ]).then(([couponRes, flashRes]) => {
      setCoupons(couponRes.data?.coupons || []);
      setFlashSales(Array.isArray(flashRes.data) ? flashRes.data : []);
    }).finally(() => setLoading(false));
  }, []);

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {featureBanner?.image && (
        <div className="w-full h-44 sm:h-56 overflow-hidden">
          <img src={featureBanner.image} alt={featureBanner.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{featureBanner?.name || 'Special Offers & Deals'}</h1>
          <p className="text-muted-foreground">
            {featureBanner?.description || 'Grab the best deals and save more on your shopping'}
          </p>
        </div>

        {/* Featured Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Hot Deal
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Mega Weekend Sale - Up to 70% Off!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Valid on selected products. Limited time offer.
                </p>
                <Link to="/flash-sales">
                  <Button>Shop Now</Button>
                </Link>
              </div>
              <div className="hidden md:block text-6xl">🎉</div>
            </div>
          </CardContent>
        </Card>

        {/* Flash Sales Section */}
        {flashSales.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold">Active Flash Sales</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {flashSales.map((sale) => (
                <Card key={sale.id} className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-orange-800">{sale.title}</h3>
                        {sale.description && (
                          <p className="text-sm text-orange-600 mt-1">{sale.description}</p>
                        )}
                      </div>
                      {sale.discount_percentage && (
                        <Badge className="bg-orange-500 text-white border-0 text-sm px-2 py-1">
                          -{sale.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                    {sale.end_date && (
                      <div className="flex items-center gap-2 text-sm text-orange-700">
                        <Clock className="w-4 h-4" />
                        <span>Ends: {new Date(sale.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <Link to="/flash-sales" className="mt-3 block">
                      <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white border-0">
                        View Flash Sale
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Coupons Section */}
        {coupons.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Available Coupons</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{coupon.title || coupon.code}</h3>
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : coupon.discount_type === 'free_shipping'
                          ? 'Free Delivery'
                          : `৳${coupon.discount_value}`}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Code:</span>
                        <code className="px-2 py-1 bg-muted rounded font-mono">{coupon.code}</code>
                      </div>
                      {coupon.expiry_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Valid till:</span>
                          <span className="text-muted-foreground">
                            {new Date(coupon.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {coupon.min_order_amount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Min. Order:</span>
                          <span className="text-muted-foreground">৳{coupon.min_order_amount}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => copyCode(coupon.code)}
                    >
                      Copy Code
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-600">No coupons available right now</h3>
            <p className="text-sm text-gray-400 mt-1">Check back soon for exciting offers!</p>
          </div>
        )}

        {/* Terms & Conditions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Terms &amp; Conditions</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Offers are valid for limited time only</li>
              <li>Cannot be combined with other offers unless specified</li>
              <li>Minimum order value required for certain offers</li>
              <li>Maximum discount amount may apply</li>
              <li>Sholok reserves the right to modify or cancel offers</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OffersPage;
