// Product images removed — return empty strings so UI fallbacks/placeholders are used
const u = (_id: string) => "";

export type Product = {
  id: string;
  name: string;
  brand: string;
  storeId: string;
  price: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  rating: number;
  reviews: number;
  badge?: string;
  category: string;
  description?: string;
  variants?: { name: string; values: string[] }[];
  stock?: number;
  tags?: string[];
  seasonalFor?: string[]; // Bangladesh season IDs: grishma | barsha | sharat | hemanta | shita | basanta
};

const galleryFor = (_img: string) => [] as string[];

const baseDescription =
  "Premium quality, thoughtfully designed. Loved by thousands of buyers and trusted vendors. Free shipping and 30-day returns on every order.";

export const products: Product[] = [
  { id: "1",  name: "Pro Wireless Headphones",    brand: "Soundwave",     storeId: "s2", price: 27390, originalPrice: 36190, image: u("1505740420928-5e560c06d30e"), gallery: galleryFor(u("1505740420928-5e560c06d30e")), rating: 4.9, reviews: 1284, badge: "Best Seller", category: "Audio",       description: baseDescription, variants: [{ name: "Color",  values: ["Midnight", "Cream", "Sand"] }], stock: 42,  tags: ["wireless", "anc", "premium"] },
  { id: "2",  name: "Ceramica Morning Mug",        brand: "Hearth & Home", storeId: "s3", price: 3080,  originalPrice: 4620,  image: u("1495474472287-4d71bcdd2085"), gallery: galleryFor(u("1495474472287-4d71bcdd2085")), rating: 4.8, reviews: 642,  badge: "New",         category: "Home",        description: baseDescription, variants: [{ name: "Color",  values: ["Bone", "Clay", "Olive"] }],      stock: 124, tags: ["ceramic", "kitchen"] },
  { id: "3",  name: "Heritage Bifold Wallet",      brand: "Atelier Noir",  storeId: "s1", price: 9790,                        image: u("1627123424574-724785494758"), gallery: galleryFor(u("1627123424574-724785494758")), rating: 4.7, reviews: 318,                        category: "Accessories", description: baseDescription, variants: [{ name: "Leather", values: ["Cognac", "Ink", "Espresso"] }], stock: 67,  tags: ["leather", "wallet"] },
  { id: "4",  name: "Solstice Round Sunglasses",   brand: "Lumen Eyewear", storeId: "s2", price: 16390, originalPrice: 21890, image: u("1577803645773-f96470926aa8"), gallery: galleryFor(u("1577803645773-f96470926aa8")), rating: 4.9, reviews: 921,  badge: "Trending",     category: "Accessories", description: baseDescription, variants: [{ name: "Frame",  values: ["Black", "Tortoise", "Gold"] }],   stock: 31,  tags: ["sunglasses"] },
  { id: "5",  name: "Pulse 5 Smartwatch",          brand: "Nimbus Tech",   storeId: "s2", price: 36190, originalPrice: 43890, image: u("1523275335684-37898b6baf30"), gallery: galleryFor(u("1523275335684-37898b6baf30")), rating: 4.8, reviews: 2103, badge: "Top Pick",     category: "Tech",        description: baseDescription, variants: [{ name: "Band",   values: ["Sport", "Leather", "Milanese"] }, { name: "Size", values: ["41mm", "45mm"] }], stock: 88,  tags: ["smartwatch", "fitness"] },
  { id: "6",  name: "Cloudstep Low Sneakers",      brand: "Drift Footwear",storeId: "s4", price: 13090,                        image: u("1542291026-7eec264c27ff"), gallery: galleryFor(u("1542291026-7eec264c27ff")), rating: 4.6, reviews: 754,                        category: "Fashion",     description: baseDescription, variants: [{ name: "Size",   values: ["7", "8", "9", "10", "11"] }],        stock: 54,  tags: ["sneakers"] },
  { id: "7",  name: "Amber Glow Scented Candle",   brand: "Ember Co.",     storeId: "s5", price: 3740,  originalPrice: 5280,  image: u("1602523961358-f9f03dd28c08"), gallery: galleryFor(u("1602523961358-f9f03dd28c08")), rating: 4.9, reviews: 1456, badge: "Cozy Pick",    category: "Home",        description: baseDescription, variants: [{ name: "Scent",  values: ["Amber", "Vanilla", "Cedar"] }],    stock: 210, tags: ["candle", "cozy"] },
  { id: "8",  name: "Voyager Leather Backpack",    brand: "Atelier Noir",  storeId: "s1", price: 20790,                        image: u("1622560480605-d83c661087e7"), gallery: galleryFor(u("1622560480605-d83c661087e7")), rating: 4.7, reviews: 482,                        category: "Accessories", description: baseDescription, variants: [{ name: "Color",  values: ["Cognac", "Ink"] }],               stock: 22,  tags: ["backpack", "leather"] },
  { id: "9",  name: "Studio Over-Ear Headphones",  brand: "Soundwave",     storeId: "s2", price: 19690, originalPrice: 25190, image: u("1618366712010-f4ae9c647dcb"), gallery: galleryFor(u("1618366712010-f4ae9c647dcb")), rating: 4.7, reviews: 612,  badge: "Hot",          category: "Audio",       description: baseDescription, stock: 35 },
  { id: "10", name: "Slow Mornings Espresso Cup",  brand: "Hearth & Home", storeId: "s3", price: 2420,                         image: u("1514228742587-6b1558fcca3d"), gallery: galleryFor(u("1514228742587-6b1558fcca3d")), rating: 4.6, reviews: 198,                        category: "Home",        description: baseDescription, stock: 140 },
  { id: "11", name: "Atelier Card Holder",         brand: "Atelier Noir",  storeId: "s1", price: 6490,                         image: u("1612420869895-28ecfbaa3a25"), gallery: galleryFor(u("1612420869895-28ecfbaa3a25")), rating: 4.8, reviews: 244,                        category: "Accessories", description: baseDescription, stock: 75 },
  { id: "12", name: "Dusk Rectangle Eyewear",      brand: "Lumen Eyewear", storeId: "s2", price: 14190,                         image: u("1572635196237-14b3f281503f"), gallery: galleryFor(u("1572635196237-14b3f281503f")), rating: 4.5, reviews: 178,                        category: "Accessories", description: baseDescription, stock: 41 },
  { id: "13", name: "Pulse Mini Tracker",          brand: "Nimbus Tech",   storeId: "s2", price: 16390, originalPrice: 20790, image: u("1575311373937-040b8e1fd5b6"), gallery: galleryFor(u("1575311373937-040b8e1fd5b6")), rating: 4.6, reviews: 873,                        category: "Tech",        description: baseDescription, stock: 96 },
  { id: "14", name: "Glide High-Top Sneakers",     brand: "Drift Footwear",storeId: "s4", price: 15290,                         image: u("1600185365483-26d7a4cc7519"), gallery: galleryFor(u("1600185365483-26d7a4cc7519")), rating: 4.7, reviews: 421,                        category: "Fashion",     description: baseDescription, stock: 28 },
  { id: "15", name: "Ember Travel Candle Trio",    brand: "Ember Co.",     storeId: "s5", price: 5390,  originalPrice: 7040,  image: u("1603006905003-be475563bc59"), gallery: galleryFor(u("1603006905003-be475563bc59")), rating: 4.9, reviews: 503,  badge: "Set",          category: "Home",        description: baseDescription, stock: 87 },
  { id: "16", name: "Voyager Daypack Mini",        brand: "Atelier Noir",  storeId: "s1", price: 14190,                         image: u("1553062407-98eeb64c6a62"), gallery: galleryFor(u("1553062407-98eeb64c6a62")),  rating: 4.6, reviews: 162,                        category: "Accessories", description: baseDescription, stock: 19 },
  { id: "17", name: "Lite Earbuds",                brand: "Soundwave",     storeId: "s2", price: 9790,  originalPrice: 13090, image: u("1590658268037-6bf12165a8df"), gallery: galleryFor(u("1590658268037-6bf12165a8df")), rating: 4.5, reviews: 932,  badge: "Deal",         category: "Audio",       description: baseDescription, stock: 130 },
  { id: "18", name: "Hearth Soup Mug",             brand: "Hearth & Home", storeId: "s3", price: 3520,                          image: u("1572442388796-11e30afade10"), gallery: galleryFor(u("1572442388796-11e30afade10")), rating: 4.7, reviews: 211,                        category: "Home",        description: baseDescription, stock: 80 },
  { id: "19", name: "Solstice Aviators",           brand: "Lumen Eyewear", storeId: "s2", price: 18590,                          image: u("1508296695146-257a814070b4"), gallery: galleryFor(u("1508296695146-257a814070b4")), rating: 4.8, reviews: 654,  badge: "Trending",     category: "Accessories", description: baseDescription, stock: 24 },
  { id: "20", name: "Pulse 5 Pro Smartwatch",      brand: "Nimbus Tech",   storeId: "s2", price: 49390, originalPrice: 60390, image: u("1546868871-7041f2a55e12"), gallery: galleryFor(u("1546868871-7041f2a55e12")),  rating: 4.9, reviews: 1102, badge: "Premium",       category: "Tech",        description: baseDescription, stock: 18 },
  { id: "21", name: "Drift Court Classics",        brand: "Drift Footwear",storeId: "s4", price: 10890,                          image: u("1491553895911-0055eca6402d"), gallery: galleryFor(u("1491553895911-0055eca6402d")), rating: 4.5, reviews: 387,                        category: "Fashion",     description: baseDescription, stock: 60 },
  { id: "22", name: "Cedar Deep Candle",           brand: "Ember Co.",     storeId: "s5", price: 4180,                           image: u("1601997537628-de3ae12ef86f"), gallery: galleryFor(u("1601997537628-de3ae12ef86f")), rating: 4.8, reviews: 274,                        category: "Home",        description: baseDescription, stock: 112 },
  { id: "23", name: "Atelier Slim Sleeve",         brand: "Atelier Noir",  storeId: "s1", price: 8690,                           image: u("1526170375885-4d8ecf77b99f"), gallery: galleryFor(u("1526170375885-4d8ecf77b99f")), rating: 4.6, reviews: 142,                        category: "Accessories", description: baseDescription, stock: 50 },
  { id: "24", name: "Voyager Weekend Tote",        brand: "Atelier Noir",  storeId: "s1", price: 24090, originalPrice: 29590, image: u("1548036328-c9fa89d128fa"), gallery: galleryFor(u("1548036328-c9fa89d128fa")),  rating: 4.8, reviews: 209,  badge: "Limited",      category: "Accessories", description: baseDescription, stock: 12 },

  // ── Bangladesh Seasonal Products ──
  // ☀️ Grishma (Summer) — Apr/May
  { id: "25", name: "Insulated Water Bottle 1L",   brand: "AquaCool",      storeId: "s4", price: 2090,  originalPrice: 2750,  image: u("1602143108850-0a9e069e8281"), gallery: galleryFor(u("1602143108850-0a9e069e8281")), rating: 4.8, reviews: 1102, badge: "Summer Must", category: "Lifestyle",   description: "Double-wall insulated bottle keeps water ice-cold for 24 hours in Bangladesh's scorching summer heat.", variants: [{ name: "Size", values: ["500ml", "750ml", "1L"] }], stock: 200, tags: ["water", "summer", "hydration"], seasonalFor: ["grishma"] },
  { id: "26", name: "Portable Neck Fan",           brand: "CoolBreeze BD", storeId: "s2", price: 1650,  originalPrice: 2200,  image: u("1585771724684-9f70f4b5bdb7"), gallery: galleryFor(u("1585771724684-9f70f4b5bdb7")), rating: 4.6, reviews: 743,  badge: "Beat Heat",  category: "Tech",        description: "360° wearable neck fan with 3 speed settings — perfect for outdoor commutes in Bangladesh's hot summer.", stock: 95, tags: ["fan", "summer", "cool"], seasonalFor: ["grishma"] },
  { id: "27", name: "Cotton Panjabi (Summer)",     brand: "DeshiWear",     storeId: "s1", price: 1890,  originalPrice: 2490,  image: u("1594938298604-3488c9b2c7e4"), gallery: galleryFor(u("1594938298604-3488c9b2c7e4")), rating: 4.7, reviews: 521,  badge: "Light",      category: "Fashion",     description: "Lightweight cotton panjabi — breathable & cool for hot summer days and Eid celebrations in Bangladesh.", variants: [{ name: "Size", values: ["S", "M", "L", "XL", "XXL"] }], stock: 180, tags: ["panjabi", "summer", "eid"], seasonalFor: ["grishma", "basanta"] },
  { id: "28", name: "SPF 50+ Sunscreen Lotion",    brand: "SunGuard BD",   storeId: "s3", price: 990,                         image: u("1556228578-0d85751b2b8b"), gallery: galleryFor(u("1556228578-0d85751b2b8b")),  rating: 4.5, reviews: 864,                       category: "Beauty",      description: "Dermatologist-tested SPF 50+ sunscreen lotion. Essential protection for Bangladesh's intense summer sun.", stock: 300, tags: ["sunscreen", "spf", "summer"], seasonalFor: ["grishma", "sharat"] },

  // 🌧️ Barsha (Monsoon) — Jun/Jul
  { id: "29", name: "Compact Foldable Umbrella",   brand: "RainGuard",     storeId: "s4", price: 1290,  originalPrice: 1690,  image: u("1527525720359-ecc11a01afcb"), gallery: galleryFor(u("1527525720359-ecc11a01afcb")), rating: 4.7, reviews: 1834, badge: "Best Pick",   category: "Lifestyle",   description: "Auto-open/close windproof umbrella. Built for Bangladesh's heavy monsoon rains — fits any bag.", variants: [{ name: "Color", values: ["Black", "Navy", "Red", "Mint"] }], stock: 250, tags: ["umbrella", "rain", "monsoon"], seasonalFor: ["barsha"] },
  { id: "30", name: "Waterproof Rain Jacket",      brand: "StormShield",   storeId: "s4", price: 3490,  originalPrice: 4590,  image: u("1519683933929-96c21937e80a"), gallery: galleryFor(u("1519683933929-96c21937e80a")), rating: 4.8, reviews: 612,  badge: "Waterproof", category: "Fashion",     description: "100% waterproof, lightweight hooded rain jacket. Perfect for Bangladesh's monsoon season commute.", variants: [{ name: "Size", values: ["S", "M", "L", "XL"] }, { name: "Color", values: ["Black", "Olive", "Navy"] }], stock: 85, tags: ["raincoat", "monsoon", "waterproof"], seasonalFor: ["barsha"] },
  { id: "31", name: "Waterproof Dry Bag 20L",      brand: "AquaShield",    storeId: "s1", price: 1850,                         image: u("1622560480605-d83c661087e7"), gallery: galleryFor(u("1622560480605-d83c661087e7")), rating: 4.6, reviews: 289,                       category: "Accessories", description: "Roll-top waterproof dry bag — keep your phone, documents and valuables safe during Bangladesh's monsoon rains.", stock: 110, tags: ["dry bag", "waterproof", "monsoon"], seasonalFor: ["barsha"] },

  // ❌️ Shita (Winter) — Dec/Jan
  { id: "32", name: "Soft Fleece Blanket",         brand: "WarmHome",      storeId: "s3", price: 2590,  originalPrice: 3490,  image: u("1586105449817-9b5a6d9af91a"), gallery: galleryFor(u("1586105449817-9b5a6d9af91a")), rating: 4.9, reviews: 2108, badge: "Bestseller",  category: "Home",        description: "Ultra-soft double-layer fleece blanket. Essential for Bangladesh's cold foggy winter mornings in December–January.", variants: [{ name: "Size", values: ["Single", "Double", "King"] }, { name: "Color", values: ["Cream", "Grey", "Navy"] }], stock: 160, tags: ["blanket", "winter", "cozy"], seasonalFor: ["shita", "hemanta"] },
  { id: "33", name: "Wool Muffler & Gloves Set",   brand: "WinterWrap BD", storeId: "s1", price: 1190,  originalPrice: 1590,  image: u("1513364776144-60967b0f800f"), gallery: galleryFor(u("1513364776144-60967b0f800f")), rating: 4.7, reviews: 934,  badge: "Set",         category: "Fashion",     description: "Merino wool muffler + gloves set. Stylish warmth for Bangladesh's chilly winter evenings.", variants: [{ name: "Color", values: ["Charcoal", "Camel", "Burgundy"] }], stock: 200, tags: ["muffler", "gloves", "winter", "wool"], seasonalFor: ["shita"] },
  { id: "34", name: "Thermal Hot Water Bottle",    brand: "CozyNest",      storeId: "s3", price: 890,                          image: u("1544716278-ca5e3f4abd8c"), gallery: galleryFor(u("1544716278-ca5e3f4abd8c")),  rating: 4.6, reviews: 712,                       category: "Home",        description: "2L rubber hot water bottle with soft knit cover — instant warmth for cold Bangladesh winter nights.", stock: 140, tags: ["hot water bottle", "winter", "warmth"], seasonalFor: ["shita"] },
  { id: "35", name: "Electric Travel Kettle",      brand: "BrewFast",      storeId: "s2", price: 2290,  originalPrice: 2990,  image: u("1544441452-3d9c6a7e3dc2"), gallery: galleryFor(u("1544441452-3d9c6a7e3dc2")),  rating: 4.8, reviews: 543,  badge: "Winter Fav",  category: "Home",        description: "500ml collapsible travel kettle. Perfect for hot tea and soup on cold Bangladesh winter mornings.", stock: 75, tags: ["kettle", "winter", "tea"], seasonalFor: ["shita", "hemanta"] },

  // 🌸 Basanta (Spring) — Feb/Mar
  { id: "36", name: "Floral Print Casual Shirt",   brand: "SpringBloom BD",storeId: "s4", price: 1490,                          image: u("1598522152293-2f0dc04be7e2"), gallery: galleryFor(u("1598522152293-2f0dc04be7e2")), rating: 4.6, reviews: 391,                       category: "Fashion",     description: "Light floral cotton shirt — made for Bangladesh's beautiful spring season and Pahela Baishakh celebrations.", variants: [{ name: "Size", values: ["S", "M", "L", "XL"] }], stock: 120, tags: ["spring", "floral", "casual"], seasonalFor: ["basanta"] },
];

export const categories = [
  { name: "Tech", icon: "Cpu", color: "from-violet-500 to-fuchsia-500" },
  { name: "Fashion", icon: "Shirt", color: "from-pink-500 to-rose-500" },
  { name: "Home", icon: "Home", color: "from-amber-500 to-orange-500" },
  { name: "Beauty", icon: "Sparkles", color: "from-rose-400 to-pink-400" },
  { name: "Audio", icon: "Headphones", color: "from-indigo-500 to-purple-500" },
  { name: "Sport", icon: "Dumbbell", color: "from-emerald-500 to-teal-500" },
  { name: "Books", icon: "BookOpen", color: "from-cyan-500 to-blue-500" },
  { name: "Gourmet", icon: "Coffee", color: "from-yellow-500 to-amber-500" },
];

export type Store = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  followers: string;
  rating: number;
  reviews: number;
  products: number;
  gradient: string;
  joined: string;
  verified: boolean;
};

export const stores: Store[] = [
  { id: "s1", name: "Atelier Noir", tagline: "Heritage leather goods", description: "Slow-crafted leather essentials made by a small atelier in Florence. Every piece is finished by hand and built to age beautifully.", followers: "128K", rating: 4.9, reviews: 4820, products: 64, gradient: "from-amber-200 via-orange-200 to-rose-200", joined: "2019", verified: true },
  { id: "s2", name: "Nimbus Tech", tagline: "Future, simplified", description: "Award-winning consumer tech with thoughtful software and timeless industrial design. Built for everyday rituals.", followers: "342K", rating: 4.8, reviews: 12044, products: 38, gradient: "from-violet-200 via-purple-200 to-indigo-200", joined: "2017", verified: true },
  { id: "s3", name: "Hearth & Home", tagline: "Made for slow mornings", description: "Quietly beautiful homeware — tableware, textiles and objects that turn ordinary moments into rituals.", followers: "89K", rating: 4.9, reviews: 3210, products: 92, gradient: "from-pink-200 via-rose-200 to-orange-200", joined: "2020", verified: true },
  { id: "s4", name: "Drift Footwear", tagline: "Walk on clouds", description: "Performance comfort meets minimalist style. Lightweight, breathable sneakers for every step of the day.", followers: "215K", rating: 4.7, reviews: 6128, products: 47, gradient: "from-cyan-200 via-sky-200 to-blue-200", joined: "2018", verified: true },
  { id: "s5", name: "Ember Co.", tagline: "Light up your space", description: "Hand-poured candles and atmospheric scents inspired by quiet places. Clean burn, complex notes.", followers: "67K", rating: 4.9, reviews: 2148, products: 28, gradient: "from-amber-200 via-yellow-200 to-orange-200", joined: "2021", verified: true },
];

export const aiSections = [
  { id: "rec", title: "Recommended for You", subtitle: "Based on your browsing patterns", icon: "Sparkles", productIds: ["1", "5", "4", "8"] },
  { id: "activity", title: "Based on Your Activity", subtitle: "You recently viewed audio gear", icon: "Activity", productIds: ["2", "7", "3", "6"] },
  { id: "trending", title: "Trending Now", subtitle: "What everyone's loving today", icon: "TrendingUp", productIds: ["4", "1", "5", "7"] },
  { id: "weather", title: "Rainy Day Picks", subtitle: "Cozy items you'll love today", icon: "Cloud", productIds: ["7", "2", "22", "15"] },
  { id: "season", title: "Seasonal Edit", subtitle: "Hand-curated for the moment", icon: "Leaf", productIds: ["19", "12", "24", "20"] },
];

export const heroSlides = [
  { id: 1, eyebrow: "Curated · Spring Edit", title: "Discover what you'll\nlove next.", subtitle: "Smart recommendations from 12,000+ trusted stores — tailored to your taste.", cta: "Shop the edit", gradient: "from-pink-100 via-rose-100 to-orange-100" },
  { id: 2, eyebrow: "Flash Sale · 48 Hours", title: "Up to 60% off\nbest sellers.", subtitle: "Limited drops from your favorite vendors. Move fast — they go quickly.", cta: "See deals", gradient: "from-amber-100 via-yellow-100 to-pink-100" },
  { id: 3, eyebrow: "New · Live Shopping", title: "Watch, chat,\nbuy live.", subtitle: "Join interactive streams from top sellers and shop in real-time.", cta: "Go live", gradient: "from-violet-100 via-fuchsia-100 to-cyan-100" },
];

export type Review = {
  id: string;
  productId: string;
  user: string;
  avatar: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpful: number;
};

export const reviews: Review[] = [
  { id: "r1", productId: "1", user: "Maya L.", avatar: "🎧", rating: 5, title: "Sound that disappears the world", body: "ANC is unreal. Battery lasts the whole work week. The cream colorway is gorgeous.", date: "2 days ago", helpful: 42 },
  { id: "r2", productId: "1", user: "Jordan P.", avatar: "🌟", rating: 5, title: "Worth every dollar", body: "Compared three flagships. These won on comfort and call quality.", date: "1 week ago", helpful: 31 },
  { id: "r3", productId: "1", user: "Sana K.", avatar: "✨", rating: 4, title: "Beautiful, slightly heavy", body: "Sound is incredible, slightly heavy on long flights but the case is perfect.", date: "3 weeks ago", helpful: 18 },
  { id: "r4", productId: "5", user: "Devin R.", avatar: "⌚", rating: 5, title: "The fitness coach in my pocket", body: "Sleep tracking + workouts are spot-on. I sold my old one same day.", date: "5 days ago", helpful: 56 },
  { id: "r5", productId: "5", user: "Priya S.", avatar: "💜", rating: 5, title: "Stunning and useful", body: "Battery lasts 3 days easy. Companion app feels premium and not bloated.", date: "2 weeks ago", helpful: 22 },
  { id: "r6", productId: "7", user: "Theo V.", avatar: "🕯", rating: 5, title: "My living room hosts now", body: "Subtle amber + cedar. No artificial smell at all. Already reordered.", date: "4 days ago", helpful: 19 },
];

export type Order = {
  id: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  total: number;
  items: { productId: string; quantity: number }[];
  tracking?: string;
};

export const orders: Order[] = [
  { id: "ORD-10481", date: "Apr 28, 2026", status: "Delivered", total: 39380, items: [{ productId: "1", quantity: 1 }, { productId: "7", quantity: 2 }], tracking: "SHO-93BX2" },
  { id: "ORD-10460", date: "Apr 22, 2026", status: "Shipped", total: 20790, items: [{ productId: "8", quantity: 1 }], tracking: "SHO-77AC9" },
  { id: "ORD-10437", date: "Apr 14, 2026", status: "Processing", total: 52580, items: [{ productId: "5", quantity: 1 }, { productId: "4", quantity: 1 }] },
  { id: "ORD-10402", date: "Apr 02, 2026", status: "Delivered", total: 9790, items: [{ productId: "3", quantity: 1 }], tracking: "SHO-12FF8" },
  { id: "ORD-10388", date: "Mar 27, 2026", status: "Cancelled", total: 13090, items: [{ productId: "6", quantity: 1 }] },
];

export const user = {
  name: "Alex Morgan",
  email: "alex@sholok.shop",
  avatar: "AM",
  joined: "March 2024",
  tier: "Gold",
  points: 2840,
};

export type LiveStream = {
  id: string;
  title: string;
  store: string;
  storeId: string;
  viewers: number;
  thumbnail: string;
  isLive: boolean;
  productIds: string[];
  host: string;
  category: string;
};

export const liveStreams: LiveStream[] = [
  { id: "live1", title: "Spring drop: Pro Wireless live demo", store: "Nimbus Tech", storeId: "s2", viewers: 4231, thumbnail: u("1505740420928-5e560c06d30e"), isLive: true,  productIds: ["1", "5", "9", "17"],   host: "Mira Chen", category: "Tech" },
  { id: "live2", title: "Morning ritual styling session",      store: "Hearth & Home", storeId: "s3", viewers: 1284, thumbnail: u("1495474472287-4d71bcdd2085"), isLive: true,  productIds: ["2", "10", "18", "7"], host: "Liv Park",  category: "Home" },
  { id: "live3", title: "How we stitch our heritage wallets",  store: "Atelier Noir", storeId: "s1",  viewers: 892,  thumbnail: u("1627123424574-724785494758"), isLive: false, productIds: ["3", "8", "11", "16"], host: "Rafael M.", category: "Accessories" },
];

export type SalesPoint = { day: string; revenue: number; orders: number };
export const sellerSales: SalesPoint[] = [
  { day: "Mon", revenue: 136400, orders: 18 },
  { day: "Tue", revenue: 200200, orders: 24 },
  { day: "Wed", revenue: 178200, orders: 21 },
  { day: "Thu", revenue: 246400, orders: 31 },
  { day: "Fri", revenue: 327800, orders: 42 },
  { day: "Sat", revenue: 365200, orders: 47 },
  { day: "Sun", revenue: 272800, orders: 35 },
];

export const adminUsers = [
  { id: "u1", name: "Alex Morgan", email: "alex@sholok.shop", role: "Buyer", status: "Active", joined: "Mar 2024" },
  { id: "u2", name: "Mira Chen", email: "mira@nimbus.tech", role: "Seller", status: "Active", joined: "Jul 2023" },
  { id: "u3", name: "Liv Park", email: "liv@hearthandhome.co", role: "Seller", status: "Active", joined: "Sep 2023" },
  { id: "u4", name: "Devin R.", email: "devin@example.com", role: "Buyer", status: "Suspended", joined: "Feb 2025" },
  { id: "u5", name: "Rafael M.", email: "rafael@ateliernoir.com", role: "Seller", status: "Active", joined: "Jan 2022" },
  { id: "u6", name: "Sana K.", email: "sana@example.com", role: "Buyer", status: "Active", joined: "May 2024" },
];
