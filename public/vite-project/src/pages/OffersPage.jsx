import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Clock, TrendingUp } from 'lucide-react';

const OffersPage = () => {
  // Sample offers data
  const offers = [
    {
      id: 1,
      title: 'First Order Discount',
      description: 'Get 50% off on your first order above ৳1000',
      code: 'FIRST50',
      discount: '50%',
      validTill: 'Dec 31, 2025',
      minOrder: 1000,
    },
    {
      id: 2,
      title: 'Weekend Special',
      description: 'Free delivery on orders above ৳1500',
      code: 'WEEKEND',
      discount: 'Free Delivery',
      validTill: 'Every Weekend',
      minOrder: 1500,
    },
    {
      id: 3,
      title: 'Bank Offer',
      description: '20% cashback on credit card payments',
      code: 'BANK20',
      discount: '20%',
      validTill: 'Dec 25, 2025',
      minOrder: 500,
    },
    {
      id: 4,
      title: 'Fresh Produce Deal',
      description: 'Buy 2 Get 1 Free on all fruits and vegetables',
      code: 'FRESH3',
      discount: 'Buy 2 Get 1',
      validTill: 'Dec 15, 2025',
      minOrder: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Special Offers & Deals</h1>
          <p className="text-muted-foreground">
            Grab the best deals and save more on your shopping
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
                <Link to="/deals">
                  <Button>Shop Now</Button>
                </Link>
              </div>
              <div className="hidden md:block text-6xl">🎉</div>
            </div>
          </CardContent>
        </Card>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {offer.description}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {offer.discount}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Code:</span>
                    <code className="px-2 py-1 bg-muted rounded font-mono">
                      {offer.code}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Valid till:</span>
                    <span className="text-muted-foreground">{offer.validTill}</span>
                  </div>
                  {offer.minOrder > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Min. Order:</span>
                      <span className="text-muted-foreground">৳{offer.minOrder}</span>
                    </div>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  Apply Offer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Terms & Conditions */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Terms & Conditions</h3>
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
