import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        // Header & Navigation
        searchPlaceholder: "Search your products...",
        deliveryLocation: "Select your delivery location",
        downloadApp: "Download App Now",
        signIn: "Sign In / Sign up",
        account: "Account",
        cart: "Cart",
        items: "Items",
        shopByCategory: "SHOP BY CATEGORY",
        topCategories: "Top Categories",
        allCategories: "ALL CATEGORIES",
        
        // Product Related
        addToBag: "Add to Bag",
        addToCart: "Add to Cart",
        delivery: "Delivery",
        perPiece: "Per Piece",
        hot: "HOT",
        new: "NEW",
        sale: "SALE",
        off: "OFF",
        outOfStock: "Out of Stock",
        inStock: "In Stock",
        discount: "Discount",
        
        // Timing
        hours: "hours",
        minutes: "minutes",
        seconds: "seconds",
        delivery12Hours: "Delivery 1-2 hours",
        
        // Sections
        freshProduce: "FRESH PRODUCE",
        greatDeals: "GREAT DEALS",
        snacksBeverages: "SNACKS & BEVERAGES",
        ourBrands: "OUR BRANDS",
        household: "HOUSEHOLD",
        personalCare: "PERSONAL CARE",
        recommendedProducts: "Recommended For You",
        trendingProducts: "Trending Products",
        featuredProducts: "Featured Products",
        bestDeals: "Best Deals",
        newArrivals: "New Arrivals",
        
        // Features
        freeDelivery: "Free Delivery",
        freeDeliveryDesc: "On orders above ৳500",
        securePayment: "Secure Payment",
        securePaymentDesc: "100% secure payment",
        easyReturns: "Easy Returns",
        easyReturnsDesc: "7 days return policy",
        support247: "24/7 Support",
        support247Desc: "Dedicated support",
        
        // Footer
        ourOutlets: "Our Outlets",
        helpLine: "Help Line",
        aboutUs: "About Us",
        contactUs: "Contact Us",
        termsConditions: "Terms & Conditions",
        privacyPolicy: "Privacy Policy",
        careers: "Careers",
        blog: "Blog",
        customerService: "Customer Service",
        myAccount: "My Account",
        trackOrder: "Track Order",
        offers: "Offers",
        help: "Help",
        
        // Modal
        locationHeader: "Delivery Location",
        searchLocation: "Road 6, Block C",
        or: "OR",
        selectDistrict: "Select district",
        selectArea: "Select area",
        done: "Done",
        close: "Close",
        
        // Buttons & Actions
        viewAll: "View All",
        buyNow: "Buy Now",
        quickView: "Quick View",
        compare: "Compare",
        addToWishlist: "Add to Wishlist",
        
        // Messages
        addedToCart: "Added to cart!",
        addedToWishlist: "Added to wishlist",
        removedFromWishlist: "Removed from wishlist",
        
        // Auth
        login: "Login",
        register: "Register",
        logout: "Logout",
        email: "Email",
        password: "Password",
        forgotPassword: "Forgot Password?",
        
        // Checkout
        checkout: "Checkout",
        subtotal: "Subtotal",
        total: "Total",
        shippingFee: "Shipping Fee",
        proceed: "Proceed",
        
        // Empty States
        emptyCart: "Your cart is empty",
        startShopping: "Start Shopping",

        // Footer
        companyTagline: "Your trusted online grocery shopping destination. Fresh products delivered to your doorstep.",
        quickLinks: "Quick Links",
        faq: "FAQ",
        deliveryAreas: "Delivery Areas",
        returnPolicy: "Return Policy",
        shippingInfo: "Shipping Info",
        addressLine: "123 Shopping Street, Dhaka 1000, Bangladesh",

        // Mobile Bottom Nav
        home: "Home",
        categories: "Categories",
    },
    bn: {
        // Header & Navigation
        searchPlaceholder: "আপনার পণ্য অনুসন্ধান করুন...",
        deliveryLocation: "আপনার ডেলিভারি অবস্থান নির্বাচন করুন",
        downloadApp: "অ্যাপ ডাউনলোড করুন",
        signIn: "সাইন ইন / সাইন আপ",
        account: "অ্যাকাউন্ট",
        cart: "কার্ট",
        items: "আইটেম",
        shopByCategory: "ক্যাটাগরি অনুযায়ী কিনুন",
        topCategories: "জনপ্রিয় ক্যাটাগরি",
        allCategories: "সকল ক্যাটাগরি",
        
        // Product Related
        addToBag: "ব্যাগে যোগ করুন",
        addToCart: "কার্টে যোগ করুন",
        delivery: "ডেলিভারি",
        perPiece: "প্রতি পিস",
        hot: "হট",
        new: "নতুন",
        sale: "সেল",
        off: "ছাড়",
        outOfStock: "স্টক শেষ",
        inStock: "স্টকে আছে",
        discount: "ছাড়",
        
        // Timing
        hours: "ঘন্টা",
        minutes: "মিনিট",
        seconds: "সেকেন্ড",
        delivery12Hours: "ডেলিভারি ১-২ ঘন্টা",
        
        // Sections
        freshProduce: "তাজা পণ্য",
        greatDeals: "সেরা ডিল",
        snacksBeverages: "স্ন্যাকস ও পানীয়",
        ourBrands: "আমাদের ব্র্যান্ড",
        household: "গৃহস্থালী",
        personalCare: "ব্যক্তিগত যত্ন",
        recommendedProducts: "আপনার জন্য সুপারিশকৃত",
        trendingProducts: "ট্রেন্ডিং পণ্য",
        featuredProducts: "বিশেষ পণ্য",
        bestDeals: "সেরা অফার",
        newArrivals: "নতুন আগমন",
        
        // Features
        freeDelivery: "ফ্রি ডেলিভারি",
        freeDeliveryDesc: "৳৫০০ এর উপরে অর্ডারে",
        securePayment: "নিরাপদ পেমেন্ট",
        securePaymentDesc: "১০০% নিরাপদ পেমেন্ট",
        easyReturns: "সহজ রিটার্ন",
        easyReturnsDesc: "৭ দিনের রিটার্ন পলিসি",
        support247: "২৪/৭ সাপোর্ট",
        support247Desc: "ডেডিকেটেড সাপোর্ট",
        
        // Footer
        ourOutlets: "আমাদের আউটলেট",
        helpLine: "হেল্প লাইন",
        aboutUs: "আমাদের সম্পর্কে",
        contactUs: "যোগাযোগ",
        termsConditions: "শর্তাবলী",
        privacyPolicy: "গোপনীয়তা নীতি",
        careers: "ক্যারিয়ার",
        blog: "ব্লগ",
        customerService: "গ্রাহক সেবা",
        myAccount: "আমার অ্যাকাউন্ট",
        trackOrder: "অর্ডার ট্র্যাক করুন",
        offers: "অফার",
        help: "সাহায্য",
        
        // Modal
        locationHeader: "ডেলিভারি অবস্থান",
        searchLocation: "রোড ৬, ব্লক সি",
        or: "অথবা",
        selectDistrict: "জেলা নির্বাচন করুন",
        selectArea: "এলাকা নির্বাচন করুন",
        done: "সম্পন্ন",
        close: "বন্ধ করুন",
        
        // Buttons & Actions
        viewAll: "সব দেখুন",
        buyNow: "এখনই কিনুন",
        quickView: "দ্রুত দেখুন",
        compare: "তুলনা করুন",
        addToWishlist: "উইশলিস্টে যোগ করুন",
        
        // Messages
        addedToCart: "কার্টে যোগ করা হয়েছে!",
        addedToWishlist: "উইশলিস্টে যোগ করা হয়েছে",
        removedFromWishlist: "উইশলিস্ট থেকে সরানো হয়েছে",
        
        // Auth
        login: "লগইন",
        register: "রেজিস্টার",
        logout: "লগআউট",
        email: "ইমেইল",
        password: "পাসওয়ার্ড",
        forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
        
        // Checkout
        checkout: "চেকআউট",
        subtotal: "সাবটোটাল",
        total: "মোট",
        shippingFee: "শিপিং ফি",
        proceed: "এগিয়ে যান",
        
        // Empty States
        emptyCart: "আপনার কার্ট খালি",
        startShopping: "কেনাকাটা শুরু করুন",

        // Footer
        companyTagline: "আপনার বিশ্বস্ত অনলাইন মুদি কেনাকাটার গন্তব্য। তাজা পণ্য আপনার দোরগোড়ায় পৌঁছে দেওয়া হয়।",
        quickLinks: "দ্রুত লিঙ্ক",
        faq: "সাধারণ জিজ্ঞাসা",
        deliveryAreas: "ডেলিভারি এলাকা",
        returnPolicy: "রিটার্ন নীতি",
        shippingInfo: "শিপিং তথ্য",
        addressLine: "১২৩ শপিং স্ট্রিট, ঢাকা ১০০০, বাংলাদেশ",

        // Mobile Bottom Nav
        home: "হোম",
        categories: "ক্যাটাগরি",
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Load language from localStorage or default to 'bn'
        return localStorage.getItem('preferredLanguage') || 'bn';
    });

    useEffect(() => {
        // Save language preference to localStorage
        localStorage.setItem('preferredLanguage', language);
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'bn' : 'en');
    };

    // Helper function to get translated field from object
    const getLocalizedField = (obj, field) => {
        if (!obj) return '';
        
        if (language === 'bn' && obj[`${field}Bn`]) {
            return obj[`${field}Bn`];
        }
        return obj[field] || '';
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage, getLocalizedField }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
