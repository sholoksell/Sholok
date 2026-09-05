import { useEffect } from 'react';
import { Store } from 'lucide-react';

const VendorLoginPage = () => {
  useEffect(() => {
    window.location.replace('https://admin.sholok.com/vendor/login');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Redirecting to Vendor Panel…</h1>
        <p className="text-gray-500 text-sm">Taking you to <strong>admin.sholok.com/vendor/login</strong></p>
        <div className="mt-4">
          <a
            href="https://admin.sholok.com/vendor/login"
            className="text-emerald-600 hover:underline text-sm font-medium"
          >
            Click here if not redirected automatically
          </a>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage;
