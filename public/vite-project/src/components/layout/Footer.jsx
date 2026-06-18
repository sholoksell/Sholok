import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Sholok</h3>
            <p className="text-sm mb-4">
              {t('companyTagline')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white">{t('aboutUs')}</Link></li>
              <li><Link to="/contact" className="hover:text-white">{t('contactUs')}</Link></li>
              <li><Link to="/offers" className="hover:text-white">{t('offers')}</Link></li>
              <li><Link to="/faq" className="hover:text-white">{t('faq')}</Link></li>
              <li><Link to="/delivery-areas" className="hover:text-white">{t('deliveryAreas')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('customerService')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account/orders" className="hover:text-white">{t('trackOrder')}</Link></li>
              <li><Link to="/return-policy" className="hover:text-white">{t('returnPolicy')}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white">{t('privacyPolicy')}</Link></li>
              <li><Link to="/terms" className="hover:text-white">{t('termsConditions')}</Link></li>
              <li><Link to="/shipping" className="hover:text-white">{t('shippingInfo')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('contactUs')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{t('addressLine')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>support@sholok.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
