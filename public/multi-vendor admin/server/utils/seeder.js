require("dotenv").config();
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");
const connectDB = require("../config/db");

const User     = require("../models/User");
const Store    = require("../models/Store");
const Category = require("../models/Category");
const Product  = require("../models/Product");
const Banner   = require("../models/Banner");
const Setting  = require("../models/Setting");

const seed = async () => {
  await connectDB();
  console.log("🌱 Seeding sholok_ecommerce database...\n");

  // Clear existing data
  await Promise.all([
    User.deleteMany(), Store.deleteMany(), Category.deleteMany(), Product.deleteMany(),
    Banner.deleteMany(), Setting.deleteMany(),
  ]);
  console.log("🗑️  Cleared existing data");

  // ── Categories ───────────────────────────────────────────────
  const cats = await Category.insertMany([
    { name: "Tech",       icon: "Cpu",        color: "from-violet-500 to-fuchsia-500", order: 1, isFeatured: true },
    { name: "Fashion",    icon: "Shirt",       color: "from-pink-500 to-rose-500",      order: 2, isFeatured: true },
    { name: "Home",       icon: "Home",        color: "from-amber-500 to-orange-500",   order: 3, isFeatured: true },
    { name: "Beauty",     icon: "Sparkles",    color: "from-rose-400 to-pink-400",      order: 4, isFeatured: true },
    { name: "Audio",      icon: "Headphones",  color: "from-indigo-500 to-purple-500",  order: 5 },
    { name: "Sport",      icon: "Dumbbell",    color: "from-emerald-500 to-teal-500",   order: 6 },
    { name: "Books",      icon: "BookOpen",    color: "from-cyan-500 to-blue-500",      order: 7 },
    { name: "Lifestyle",  icon: "Zap",         color: "from-sky-500 to-cyan-500",       order: 8 },
  ]);
  console.log(`✅ Created ${cats.length} categories`);

  // ── Admin User ───────────────────────────────────────────────
  const admin = await User.create({
    name: "Sholok Admin", email: "admin@sholok.store",
    password: "admin123456", role: "admin", isVerified: true,
  });
  console.log(`✅ Admin: admin@sholok.store / admin123456`);

  // ── Seller Users + Stores ────────────────────────────────────
  const sellers = [];
  const stores  = [];
  const sellerData = [
    { name: "Tech Galaxy BD",    email: "techgalaxy@sholok.store",  smartStore: "tech-galaxy-bd",    category: "Tech" },
    { name: "Fashion Hub BD",    email: "fashionhub@sholok.store",  smartStore: "fashion-hub-bd",    category: "Fashion" },
    { name: "Home Essentials BD",email: "homebd@sholok.store",      smartStore: "home-essentials-bd",category: "Home" },
    { name: "Sports Arena BD",   email: "sports@sholok.store",      smartStore: "sports-arena-bd",   category: "Sport" },
  ];

  for (const d of sellerData) {
    const seller = await User.create({ name: d.name, email: d.email, password: "seller123456", role: "seller", isVerified: true });
    const store  = await Store.create({
      owner: seller._id, smartStore: d.smartStore, name: d.name,
      category: d.category, isActive: true, isVerified: true, isFeatured: true,
      description: `Welcome to ${d.name} — your trusted Sholok Smart Store for quality ${d.category} products in Bangladesh.`,
      logo:   `https://ui-avatars.com/api/?background=6c47ff&color=fff&name=${encodeURIComponent(d.name)}&size=200`,
      banner: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80`,
    });
    sellers.push(seller);
    stores.push(store);
  }
  console.log(`✅ Created ${sellers.length} sellers + stores`);

  // ── Sample Products ──────────────────────────────────────────
  const catMap = {};
  cats.forEach((c) => { catMap[c.name] = c; });
  const u = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

  const productData = [
    // Tech
    { name: "Wireless Noise-Cancelling Headphones", price: 8690,  originalPrice: 10990, storeIdx: 0, cat: "Tech",      img: u("1505740420928-5e560c06d30e"), badge: "Bestseller", rating: 4.8, reviews: 1247, isFeatured: true, tags: ["headphones", "audio", "wireless"] },
    { name: "Smart Watch Series X",                 price: 14990, originalPrice: 19990, storeIdx: 0, cat: "Tech",      img: u("1523275335684-37898b6baf30"), badge: "Hot",        rating: 4.7, reviews: 892,  isFeatured: true, tags: ["smartwatch", "fitness"] },
    { name: "USB-C Hub 7-in-1",                     price: 3490,  originalPrice: 4490,  storeIdx: 0, cat: "Tech",      img: u("1518770660439-4636190af475"), badge: "",           rating: 4.6, reviews: 445 },
    { name: "Portable Neck Fan",                    price: 1650,  originalPrice: 2200,  storeIdx: 0, cat: "Tech",      img: u("1585771724684-9f70f4b5bdb7"), badge: "Hot",  rating: 4.6, reviews: 743,  seasonalFor: ["grishma"] },
    // Fashion
    { name: "Cotton Panjabi (Summer)",              price: 1890,  originalPrice: 2490,  storeIdx: 1, cat: "Fashion",   img: u("1594938298604-3488c9b2c7e4"), badge: "New",      rating: 4.7, reviews: 521,  seasonalFor: ["grishma", "basanta"] },
    { name: "Waterproof Rain Jacket",               price: 3490,  originalPrice: 4590,  storeIdx: 1, cat: "Fashion",   img: u("1519683933929-96c21937e80a"), badge: "Trending", rating: 4.8, reviews: 612,  seasonalFor: ["barsha"] },
    { name: "Wool Muffler & Gloves Set",            price: 1190,  originalPrice: 1590,  storeIdx: 1, cat: "Fashion",   img: u("1513364776144-60967b0f800f"), badge: "Sale",        rating: 4.7, reviews: 934,  seasonalFor: ["shita"] },
    { name: "Floral Print Casual Shirt",            price: 1490,  originalPrice: 0,     storeIdx: 1, cat: "Fashion",   img: u("1598522152293-2f0dc04be7e2"), badge: "",           rating: 4.6, reviews: 391,  seasonalFor: ["basanta"] },
    // Home
    { name: "Soft Fleece Blanket",                  price: 2590,  originalPrice: 3490,  storeIdx: 2, cat: "Home",      img: u("1586105449817-9b5a6d9af91a"), badge: "Bestseller", rating: 4.9, reviews: 2108, seasonalFor: ["shita", "hemanta"], isFeatured: true },
    { name: "Thermal Hot Water Bottle",             price: 890,   originalPrice: 0,     storeIdx: 2, cat: "Home",      img: u("1544716278-ca5e3f4abd8c"),   badge: "",           rating: 4.6, reviews: 712,  seasonalFor: ["shita"] },
    { name: "Electric Travel Kettle",               price: 2290,  originalPrice: 2990,  storeIdx: 2, cat: "Home",      img: u("1544441452-3d9c6a7e3dc2"),   badge: "Hot", rating: 4.8, reviews: 543,  seasonalFor: ["shita", "hemanta"] },
    // Lifestyle
    { name: "Insulated Water Bottle 1L",            price: 2090,  originalPrice: 2750,  storeIdx: 3, cat: "Lifestyle", img: u("1602143108850-0a9e069e8281"), badge: "Bestseller",rating: 4.8, reviews: 1102, seasonalFor: ["grishma"], isFeatured: true },
    { name: "Compact Foldable Umbrella",            price: 1290,  originalPrice: 1690,  storeIdx: 3, cat: "Lifestyle", img: u("1527525720359-ecc11a01afcb"), badge: "Trending",  rating: 4.7, reviews: 1834, seasonalFor: ["barsha"], isFeatured: true },
    { name: "Waterproof Dry Bag 20L",               price: 1850,  originalPrice: 0,     storeIdx: 3, cat: "Lifestyle", img: u("1622560480605-d83c661087e7"), badge: "",           rating: 4.6, reviews: 289,  seasonalFor: ["barsha"] },
  ];

  const products = [];
  for (const d of productData) {
    const cat   = catMap[d.cat];
    const store = stores[d.storeIdx];
    const prod  = await Product.create({
      store:        store._id,
      seller:       sellers[d.storeIdx]._id,
      name:         d.name,
      description:  `${d.name} — premium quality product available exclusively on Sholok Smart Store. Fast delivery across Bangladesh.`,
      price:        d.price,
      originalPrice:d.originalPrice || 0,
      category:     cat._id,
      categoryName: cat.name,
      images:       [{ url: d.img }],
      stock:        Math.floor(Math.random() * 200) + 20,
      sold:         Math.floor(Math.random() * 500),
      badge:        d.badge || "",
      isFeatured:   d.isFeatured || false,
      seasonalFor:  d.seasonalFor || [],
      tags:         d.tags || [],
      isActive:     true,
      "ratings.average": d.rating,
      "ratings.count":   d.reviews,
    });
    products.push(prod);
    await Category.findByIdAndUpdate(cat._id, { $inc: { productCount: 1 } });
    await Store.findByIdAndUpdate(store._id, { $inc: { "stats.totalProducts": 1 } });
  }
  console.log(`✅ Created ${products.length} products`);

  // ── Customer ─────────────────────────────────────────────────
  await User.create({ name: "Test Customer", email: "customer@sholok.store", password: "customer123456", role: "customer", isVerified: true });
  console.log(`✅ Customer: customer@sholok.store / customer123456`);

  // ── Banners ──────────────────────────────────────────────────
  await Banner.insertMany([
    {
      title: "Bangladesh's Smartest Marketplace",
      subtitle: "Shop from thousands of verified sellers",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
      cta: "Start shopping", link: "/shop",
      slot: "hero", order: 0,
      bgColor: "from-violet-600 to-fuchsia-600", textColor: "#fff",
    },
    {
      title: "Flash Sale · Up to 70% off",
      subtitle: "Limited stock. Don't miss out.",
      image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&q=80",
      cta: "Grab deals", link: "/flash-sale",
      slot: "hero", order: 1,
      bgColor: "from-rose-500 to-orange-500", textColor: "#fff",
    },
    {
      title: "New Sellers · Free 1st Month Commission",
      subtitle: "Start your Smart Store today",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
      cta: "Become a seller", link: "/seller/register",
      slot: "promo", order: 0,
    },
  ]);
  console.log(`✅ Created 3 banners`);

  // ── Settings ─────────────────────────────────────────────────
  await Setting.create({
    key: "global",
    siteName: "Sholok eCommerce",
    siteTagline: "Bangladesh's Smart Multi-Vendor Marketplace",
    supportEmail: "support@sholok.store",
    supportPhone: "+880 1700-000000",
    commissionPercent: Number(process.env.PLATFORM_COMMISSION_PERCENT) || 8,
    freeShippingThreshold: 11000, flatShippingRate: 880,
    enableStripe: true, enableSslcommerz: true, enableCod: true,
    currency: "BDT", currencySymbol: "৳",
  });
  console.log(`✅ Created platform settings`);

  console.log("\n🎉 Seed complete! sholok_ecommerce database is ready.");
  console.log("\n── Test Accounts ──────────────────────────────");
  console.log("Admin:    admin@sholok.store    / admin123456");
  console.log("Seller 1: techgalaxy@sholok.store / seller123456");
  console.log("Customer: customer@sholok.store / customer123456");
  console.log("────────────────────────────────────────────────\n");
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
