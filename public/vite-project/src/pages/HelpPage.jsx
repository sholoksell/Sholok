import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
            <p className="text-muted-foreground">
              We're here to help you with any questions or concerns
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">16469</p>
                <p className="text-sm text-muted-foreground">
                  Available 8am - 10pm, Everyday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium mb-2">support@sholok.com</p>
                <p className="text-sm text-muted-foreground">
                  We'll respond within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I place an order?</h3>
                <p className="text-sm text-muted-foreground">
                  Browse products, add items to cart, proceed to checkout, and complete payment.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What are the delivery charges?</h3>
                <p className="text-sm text-muted-foreground">
                  Free delivery on orders above ৳1500. Below that, ৳50 delivery charge applies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How long does delivery take?</h3>
                <p className="text-sm text-muted-foreground">
                  Standard delivery within 60 minutes for orders placed during business hours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept cash on delivery, credit/debit cards, and mobile banking.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I return or exchange products?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we have a return policy for damaged or incorrect items. Contact us within 24 hours of delivery.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
