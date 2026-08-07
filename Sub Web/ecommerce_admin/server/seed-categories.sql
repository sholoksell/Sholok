-- ============================================================
-- CATEGORY SEED DATA — 14 Top-Level + 100+ Subcategories
-- Run AFTER db-migrate-categories.sql
-- Uses INSERT IGNORE so it is safe to re-run
-- ============================================================

USE sholok_ecommerce;

-- ─── TOP-LEVEL CATEGORIES (IDs 1–14) ────────────────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1,  'Grocery',               'মুদিখানা',                  'grocery',                1, NULL, 1, 1, 10,  1,1,1, NOW(), NOW()),
  (2,  'Women''s Clothing',     'মহিলাদের পোশাক',            'womens-clothing',        1, NULL, 1, 1, 20,  1,1,1, NOW(), NOW()),
  (3,  'Men''s Clothing',       'পুরুষদের পোশাক',            'mens-clothing',          1, NULL, 1, 1, 30,  1,1,1, NOW(), NOW()),
  (4,  'Beauty & Makeup',       'সৌন্দর্য ও মেকআপ',          'beauty-makeup',          1, NULL, 1, 1, 40,  1,1,1, NOW(), NOW()),
  (5,  'Personal Care',         'ব্যক্তিগত যত্ন',            'personal-care',          1, NULL, 1, 1, 50,  1,1,1, NOW(), NOW()),
  (6,  'Fashion & Lifestyle',   'ফ্যাশন ও লাইফস্টাইল',      'fashion-lifestyle',      1, NULL, 1, 1, 60,  1,1,1, NOW(), NOW()),
  (7,  'Health & Wellness',     'স্বাস্থ্য ও সুস্থতা',       'health-wellness',        1, NULL, 1, 1, 70,  1,1,1, NOW(), NOW()),
  (8,  'Baby Care',             'শিশু পরিচর্যা',              'baby-care',              1, NULL, 1, 1, 80,  1,1,1, NOW(), NOW()),
  (9,  'Home & Kitchen',        'হোম ও কিচেন',               'home-kitchen',           1, NULL, 1, 1, 90,  1,1,1, NOW(), NOW()),
  (10, 'Cleaning Supplies',     'পরিষ্কার সামগ্রী',           'cleaning-supplies',      1, NULL, 1, 1, 100, 1,1,1, NOW(), NOW()),
  (11, 'Stationery & Office',   'স্টেশনারি ও অফিস',          'stationery-office',      1, NULL, 1, 1, 110, 1,1,1, NOW(), NOW()),
  (12, 'Pet Care',              'পোষা প্রাণীর যত্ন',          'pet-care',               1, NULL, 1, 0, 120, 1,1,1, NOW(), NOW()),
  (13, 'Toys & Sports',         'খেলনা ও স্পোর্টস',          'toys-sports',            1, NULL, 1, 1, 130, 1,1,1, NOW(), NOW()),
  (14, 'Vehicle Essentials',    'যানবাহন সামগ্রী',            'vehicle-essentials',     1, NULL, 1, 0, 140, 1,1,1, NOW(), NOW());

-- ─── GROCERY SUBCATEGORIES (IDs 101–109) ─────────────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (101, 'Rice, Flour & Grains', 'চাল, আটা ও শস্য',          'grocery-rice-flour-grains',   2, 1, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (102, 'Oil & Ghee',           'তেল ও ঘি',                  'grocery-oil-ghee',            2, 1, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (103, 'Spices & Masala',      'মশলা',                      'grocery-spices-masala',       2, 1, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (104, 'Lentils & Pulses',     'ডাল',                       'grocery-lentils-pulses',      2, 1, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (105, 'Snacks & Biscuits',    'স্ন্যাকস ও বিস্কুট',        'grocery-snacks-biscuits',     2, 1, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (106, 'Beverages & Drinks',   'পানীয়',                    'grocery-beverages-drinks',    2, 1, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (107, 'Dairy & Eggs',         'দুগ্ধজাত পণ্য ও ডিম',       'grocery-dairy-eggs',          2, 1, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (108, 'Frozen Foods',         'হিমায়িত খাবার',             'grocery-frozen-foods',        2, 1, 1, 0, 80, 1,1,1, NOW(), NOW()),
  (109, 'Organic & Natural',    'অর্গানিক ও প্রাকৃতিক',      'grocery-organic-natural',     2, 1, 1, 0, 90, 1,1,1, NOW(), NOW());

-- ─── WOMEN'S CLOTHING SUBCATEGORIES (IDs 201–210) ────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (201, 'Saree',            'শাড়ি',                    'womens-saree',              2, 2, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (202, 'Salwar Kameez',    'সালোয়ার কামিজ',            'womens-salwar-kameez',      2, 2, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (203, 'Kurtis',           'কুর্তি',                  'womens-kurtis',             2, 2, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (204, 'Tops & Tunics',    'টপস ও টিউনিক',             'womens-tops-tunics',        2, 2, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (205, 'Jeans & Pants',    'জিন্স ও প্যান্ট',           'womens-jeans-pants',        2, 2, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (206, 'Traditional Wear', 'ঐতিহ্যবাহী পোশাক',         'womens-traditional-wear',   2, 2, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (207, 'Western Dress',    'ওয়েস্টার্ন ড্রেস',          'womens-western-dress',      2, 2, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (208, 'Nightwear',        'নাইটওয়্যার',              'womens-nightwear',          2, 2, 1, 0, 80, 1,1,1, NOW(), NOW()),
  (209, 'Maternity Wear',   'মাতৃত্ব পোশাক',            'womens-maternity-wear',     2, 2, 1, 0, 90, 1,1,1, NOW(), NOW()),
  (210, 'Sportswear',       'স্পোর্টসওয়্যার',           'womens-sportswear',         2, 2, 1, 0, 100,1,1,1, NOW(), NOW());

-- ─── MEN'S CLOTHING SUBCATEGORIES (IDs 301–308) ──────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (301, 'Shirts',              'শার্ট',                   'mens-shirts',           2, 3, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (302, 'T-Shirts & Polos',    'টি-শার্ট ও পোলো',          'mens-tshirts-polos',    2, 3, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (303, 'Pants & Trousers',    'প্যান্ট ও ট্রাউজার',       'mens-pants-trousers',   2, 3, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (304, 'Jeans',               'জিন্স',                   'mens-jeans',            2, 3, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (305, 'Panjabi & Kurta',     'পাঞ্জাবি ও কুর্তা',        'mens-panjabi-kurta',    2, 3, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (306, 'Blazers & Suits',     'ব্লেজার ও স্যুট',           'mens-blazers-suits',    2, 3, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (307, 'Underwear & Socks',   'অন্তর্বাস ও মোজা',          'mens-underwear-socks',  2, 3, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (308, 'Sportswear',          'স্পোর্টসওয়্যার',           'mens-sportswear',       2, 3, 1, 0, 80, 1,1,1, NOW(), NOW());

-- ─── BEAUTY & MAKEUP SUBCATEGORIES (IDs 401–409) ─────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (401, 'Lipstick & Lip Care',       'লিপস্টিক ও লিপ কেয়ার',      'beauty-lipstick',            2, 4, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (402, 'Foundation & Concealer',    'ফাউন্ডেশন ও কনসিলার',       'beauty-foundation',          2, 4, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (403, 'Eyeshadow & Eyeliner',      'আইশ্যাডো ও আইলাইনার',       'beauty-eyeshadow',           2, 4, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (404, 'Blush & Highlighter',       'ব্লাশ ও হাইলাইটার',          'beauty-blush',               2, 4, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (405, 'Setting Spray & Powder',    'সেটিং স্প্রে ও পাউডার',      'beauty-setting-spray',       2, 4, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (406, 'Nail Polish',               'নেইল পলিশ',                  'beauty-nail-polish',         2, 4, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (407, 'Makeup Tools & Brushes',    'মেকআপ টুলস ও ব্রাশ',         'beauty-makeup-tools',        2, 4, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (408, 'Skincare & Serum',          'স্কিনকেয়ার ও সেরাম',         'beauty-skincare-serum',      2, 4, 1, 0, 80, 1,1,1, NOW(), NOW()),
  (409, 'Face Mask & Scrub',         'ফেস মাস্ক ও স্ক্রাব',         'beauty-face-mask',           2, 4, 1, 0, 90, 1,1,1, NOW(), NOW());

-- ─── PERSONAL CARE SUBCATEGORIES (IDs 501–509) ───────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (501, 'Shampoo & Conditioner',  'শ্যাম্পু ও কন্ডিশনার',     'care-shampoo',           2, 5, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (502, 'Body Wash & Soap',       'বডি ওয়াশ ও সাবান',          'care-bodywash',          2, 5, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (503, 'Deodorant & Perfume',    'ডিওডোরেন্ট ও পারফিউম',      'care-deodorant',         2, 5, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (504, 'Toothpaste & Oral Care', 'টুথপেস্ট ও ওরাল কেয়ার',    'care-oral-care',         2, 5, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (505, 'Shaving & Grooming',     'শেভিং ও গ্রুমিং',            'care-shaving',           2, 5, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (506, 'Hair Care Products',     'হেয়ার কেয়ার পণ্য',           'care-hair-care',         2, 5, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (507, 'Feminine Hygiene',       'মহিলাদের হাইজিন',             'care-feminine',          2, 5, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (508, 'Skin Cream & Lotion',    'স্কিন ক্রিম ও লোশন',         'care-skin-cream',        2, 5, 1, 0, 80, 1,1,1, NOW(), NOW()),
  (509, 'Sunscreen & SPF',        'সানস্ক্রিন ও এসপিএফ',        'care-sunscreen',         2, 5, 1, 0, 90, 1,1,1, NOW(), NOW());

-- ─── FASHION & LIFESTYLE SUBCATEGORIES (IDs 601–608) ─────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (601, 'Handbags & Clutches',  'হ্যান্ডব্যাগ ও ক্লাচ',      'fashion-handbags',       2, 6, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (602, 'Shoes & Sandals',      'জুতা ও স্যান্ডেল',            'fashion-shoes',          2, 6, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (603, 'Watches',              'ঘড়ি',                       'fashion-watches',        2, 6, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (604, 'Sunglasses',           'সানগ্লাস',                   'fashion-sunglasses',     2, 6, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (605, 'Jewelry & Accessories','গহনা ও আনুষঙ্গিক',            'fashion-jewelry',        2, 6, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (606, 'Belts & Wallets',      'বেল্ট ও মানিব্যাগ',           'fashion-belts-wallets',  2, 6, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (607, 'Caps & Hats',          'ক্যাপ ও হ্যাট',               'fashion-caps-hats',      2, 6, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (608, 'Scarves & Stoles',     'স্কার্ফ ও স্টোল',             'fashion-scarves',        2, 6, 1, 0, 80, 1,1,1, NOW(), NOW());

-- ─── HEALTH & WELLNESS SUBCATEGORIES (IDs 701–707) ───────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (701, 'Vitamins & Supplements', 'ভিটামিন ও সাপ্লিমেন্ট',  'health-vitamins',        2, 7, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (702, 'Protein & Fitness',      'প্রোটিন ও ফিটনেস',         'health-protein',         2, 7, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (703, 'Medical Devices',        'মেডিকেল ডিভাইস',           'health-medical-devices', 2, 7, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (704, 'First Aid',              'প্রাথমিক চিকিৎসা',          'health-first-aid',       2, 7, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (705, 'Weight Management',      'ওজন ব্যবস্থাপনা',           'health-weight',          2, 7, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (706, 'Herbal & Ayurvedic',     'হার্বাল ও আয়ুর্বেদিক',     'health-herbal',          2, 7, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (707, 'Mental Wellness',        'মানসিক সুস্থতা',            'health-mental',          2, 7, 1, 0, 70, 1,1,1, NOW(), NOW());

-- ─── BABY CARE SUBCATEGORIES (IDs 801–808) ───────────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (801, 'Baby Clothing',       'শিশুর পোশাক',             'baby-clothing',       2, 8, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (802, 'Diapers & Wipes',     'ডায়াপার ও ওয়াইপস',        'baby-diapers',        2, 8, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (803, 'Baby Food & Formula', 'শিশুর খাবার ও ফর্মুলা',   'baby-food',           2, 8, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (804, 'Baby Skincare',       'শিশুর স্কিনকেয়ার',        'baby-skincare',       2, 8, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (805, 'Toys & Rattles',      'খেলনা ও র‍্যাটল',           'baby-toys-rattles',   2, 8, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (806, 'Baby Accessories',    'শিশুর আনুষঙ্গিক',          'baby-accessories',    2, 8, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (807, 'Strollers & Carriers','স্ট্রোলার ও ক্যারিয়ার',   'baby-strollers',      2, 8, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (808, 'Feeding & Nursing',   'খাওয়ানো ও নার্সিং',       'baby-feeding',        2, 8, 1, 0, 80, 1,1,1, NOW(), NOW());

-- ─── HOME & KITCHEN SUBCATEGORIES (IDs 901–908) ──────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (901, 'Cookware & Pans',        'রান্নার সরঞ্জাম',         'home-cookware',          2, 9, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (902, 'Kitchen Appliances',     'কিচেন যন্ত্রপাতি',        'home-kitchen-appliances',2, 9, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (903, 'Bedding & Pillows',      'বিছানার চাদর ও বালিশ',   'home-bedding',           2, 9, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (904, 'Curtains & Blinds',      'পর্দা ও ব্লাইন্ড',        'home-curtains',          2, 9, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (905, 'Furniture',              'আসবাবপত্র',               'home-furniture',         2, 9, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (906, 'Storage & Organisation', 'সঞ্চয়স্থান ও সংগঠন',     'home-storage',           2, 9, 1, 0, 60, 1,1,1, NOW(), NOW()),
  (907, 'Lighting & Lamps',       'আলো ও বাতি',              'home-lighting',          2, 9, 1, 0, 70, 1,1,1, NOW(), NOW()),
  (908, 'Decor & Gifts',          'সাজসজ্জা ও উপহার',        'home-decor-gifts',       2, 9, 1, 0, 80, 1,1,1, NOW(), NOW());

-- ─── CLEANING SUPPLIES SUBCATEGORIES (IDs 1001–1006) ─────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1001, 'Floor Cleaners',      'মেঝে পরিষ্কারক',        'clean-floor',          2, 10, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (1002, 'Toilet & Bathroom',   'টয়লেট ও বাথরুম',        'clean-toilet',         2, 10, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (1003, 'Dishwash & Sink',     'থালাবাসন ও সিঙ্ক',      'clean-dishwash',       2, 10, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (1004, 'Laundry & Detergent', 'কাপড় ধোয়া ও ডিটারজেন্ট','clean-laundry',        2, 10, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (1005, 'Air Fresheners',      'বায়ু সতেজতাকারী',       'clean-air-fresheners', 2, 10, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (1006, 'Mops & Brushes',      'মপ ও ব্রাশ',            'clean-mops-brushes',   2, 10, 1, 0, 60, 1,1,1, NOW(), NOW());

-- ─── STATIONERY & OFFICE SUBCATEGORIES (IDs 1101–1106) ───────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1101, 'Notebooks & Diaries', 'নোটবুক ও ডায়েরি',     'stationary-notebooks',   2, 11, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (1102, 'Pens & Pencils',      'কলম ও পেন্সিল',        'stationary-pens',        2, 11, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (1103, 'Art & Craft',         'আর্ট ও ক্রাফট',        'stationary-art-craft',   2, 11, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (1104, 'Office Supplies',     'অফিস সামগ্রী',          'stationary-office-sup',  2, 11, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (1105, 'Bags & Backpacks',    'ব্যাগ ও ব্যাকপ্যাক',   'stationary-bags',        2, 11, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (1106, 'Files & Folders',     'ফাইল ও ফোল্ডার',       'stationary-files',       2, 11, 1, 0, 60, 1,1,1, NOW(), NOW());

-- ─── PET CARE SUBCATEGORIES (IDs 1201–1205) ──────────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1201, 'Pet Food',         'পোষা প্রাণীর খাবার',          'pet-food',         2, 12, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (1202, 'Pet Accessories',  'পোষা প্রাণীর আনুষঙ্গিক',      'pet-accessories',  2, 12, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (1203, 'Pet Grooming',     'পোষা প্রাণীর সৌন্দর্য চর্চা', 'pet-grooming',     2, 12, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (1204, 'Pet Health',       'পোষা প্রাণীর স্বাস্থ্য',      'pet-health',       2, 12, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (1205, 'Pet Toys',         'পোষা প্রাণীর খেলনা',          'pet-toys',         2, 12, 1, 0, 50, 1,1,1, NOW(), NOW());

-- ─── TOYS & SPORTS SUBCATEGORIES (IDs 1301–1306) ─────────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1301, 'Action Figures & Dolls', 'অ্যাকশন ফিগার ও পুতুল',  'toys-action-figures',   2, 13, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (1302, 'Board Games & Puzzles',  'বোর্ড গেম ও পাজেল',       'toys-board-games',      2, 13, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (1303, 'Outdoor Sports',         'আউটডোর স্পোর্টস',          'toys-outdoor-sports',   2, 13, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (1304, 'Fitness Equipment',      'ফিটনেস সরঞ্জাম',           'toys-fitness',          2, 13, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (1305, 'Cricket & Football',     'ক্রিকেট ও ফুটবল',          'toys-cricket-football', 2, 13, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (1306, 'Educational Toys',       'শিক্ষামূলক খেলনা',          'toys-educational',      2, 13, 1, 0, 60, 1,1,1, NOW(), NOW());

-- ─── VEHICLE ESSENTIALS SUBCATEGORIES (IDs 1401–1406) ────────────────────────

INSERT IGNORE INTO categories
  (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order,
   show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1401, 'Car Accessories',   'গাড়ির আনুষঙ্গিক',        'vehicle-car-accessories', 2, 14, 1, 0, 10, 1,1,1, NOW(), NOW()),
  (1402, 'Bike Accessories',  'বাইকের আনুষঙ্গিক',       'vehicle-bike-accessories',2, 14, 1, 0, 20, 1,1,1, NOW(), NOW()),
  (1403, 'Car Care Products', 'গাড়ির যত্ন পণ্য',        'vehicle-car-care',        2, 14, 1, 0, 30, 1,1,1, NOW(), NOW()),
  (1404, 'Tyres & Batteries', 'টায়ার ও ব্যাটারি',       'vehicle-tyres-batteries', 2, 14, 1, 0, 40, 1,1,1, NOW(), NOW()),
  (1405, 'GPS & Electronics', 'জিপিএস ও ইলেকট্রনিক্স', 'vehicle-gps-electronics', 2, 14, 1, 0, 50, 1,1,1, NOW(), NOW()),
  (1406, 'Oils & Lubricants', 'তেল ও লুব্রিকেন্ট',     'vehicle-oils-lubricants', 2, 14, 1, 0, 60, 1,1,1, NOW(), NOW());

-- Fix auto_increment so new inserts don't conflict
ALTER TABLE categories AUTO_INCREMENT = 2000;

SELECT
  COUNT(*) AS total_categories,
  SUM(level = 1) AS top_level,
  SUM(level = 2) AS sub_categories
FROM categories
WHERE deleted_at IS NULL;
