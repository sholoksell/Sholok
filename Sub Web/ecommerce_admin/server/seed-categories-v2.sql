-- ═══════════════════════════════════════════════════════════════════════════
-- Sholok Category Seed v2 — 4-Level Hierarchy (English + Bengali)
-- Run via: node server/run-seed-v2.js
-- ═══════════════════════════════════════════════════════════════════════════

-- Clear subcategories only (keep top-level IDs stable for foreign keys)
DELETE FROM categories WHERE id > 14;

-- ─── LEVEL 1: UPDATE TOP-LEVEL CATEGORIES ───────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, featured, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at)
VALUES
  (1,  'Grocery',               'মুদিখানা',                            'grocery',               1, NULL, 1, 1, 1,  1,1,1, NOW(), NOW()),
  (2,  'Women''s Clothing',     'নারীদের পোশাক',                      'womens-clothing',        1, NULL, 1, 1, 2,  1,1,1, NOW(), NOW()),
  (3,  'Men''s Clothing',       'পুরুষদের পোশাক',                     'mens-clothing',          1, NULL, 1, 1, 3,  1,1,1, NOW(), NOW()),
  (4,  'Beauty & Makeup',       'সৌন্দর্য ও মেকআপ',                   'beauty-makeup',          1, NULL, 1, 1, 4,  1,1,1, NOW(), NOW()),
  (5,  'Personal Care',         'ব্যক্তিগত পরিচর্যা',                  'personal-care',          1, NULL, 1, 1, 5,  1,1,1, NOW(), NOW()),
  (6,  'Fashion & Lifestyle',   'ফ্যাশন ও জীবনধারা',                  'fashion-lifestyle',      1, NULL, 1, 1, 6,  1,1,1, NOW(), NOW()),
  (7,  'Health & Wellness',     'স্বাস্থ্য ও সুস্থতা',                'health-wellness',        1, NULL, 1, 1, 7,  1,1,1, NOW(), NOW()),
  (8,  'Baby Care',             'শিশুর যত্ন',                         'baby-care',              1, NULL, 1, 1, 8,  1,1,1, NOW(), NOW()),
  (9,  'Home & Kitchen',        'গৃহস্থালি ও রান্নাঘর',               'home-kitchen',           1, NULL, 1, 1, 9,  1,1,1, NOW(), NOW()),
  (10, 'Cleaning Supplies',     'পরিষ্কার-পরিচ্ছন্নতার সামগ্রী',     'cleaning-supplies',      1, NULL, 1, 1, 10, 1,1,1, NOW(), NOW()),
  (11, 'Stationery & Office',   'স্টেশনারি ও অফিস সামগ্রী',           'stationery-office',      1, NULL, 1, 1, 11, 1,1,1, NOW(), NOW()),
  (12, 'Pet Care',              'পোষা প্রাণীর যত্ন',                  'pet-care',               1, NULL, 1, 1, 12, 1,1,1, NOW(), NOW()),
  (13, 'Toys & Sports',         'খেলনা ও ক্রীড়াসামগ্রী',             'toys-sports',            1, NULL, 1, 1, 13, 1,1,1, NOW(), NOW()),
  (14, 'Vehicle Essentials',    'যানবাহনের প্রয়োজনীয় সামগ্রী',       'vehicle-essentials',     1, NULL, 1, 1, 14, 1,1,1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), name_bn=VALUES(name_bn), slug=VALUES(slug),
  level=VALUES(level), is_active=VALUES(is_active), featured=VALUES(featured),
  sort_order=VALUES(sort_order), updated_at=NOW();

-- ─── LEVEL 2: GROCERY SUBCATEGORIES (parent=1) ──────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (101, 'Fruits & Vegetables',  'ফল ও শাকসবজি',                      'grocery-fruits-vegetables',  2, 1, 1, 1,  1,1,1, NOW(), NOW()),
  (102, 'Meat & Fish',          'মাংস ও মাছ',                        'grocery-meat-fish',           2, 1, 1, 2,  1,1,1, NOW(), NOW()),
  (103, 'Cooking',              'রান্নার উপকরণ',                      'grocery-cooking',             2, 1, 1, 3,  1,1,1, NOW(), NOW()),
  (104, 'Sauces & Pickles',     'সস ও আচার',                         'grocery-sauces-pickles',      2, 1, 1, 4,  1,1,1, NOW(), NOW()),
  (105, 'Dairy & Eggs',         'দুগ্ধজাত পণ্য ও ডিম',               'grocery-dairy-eggs',          2, 1, 1, 5,  1,1,1, NOW(), NOW()),
  (106, 'Breakfast',            'নাশতার খাবার',                       'grocery-breakfast',           2, 1, 1, 6,  1,1,1, NOW(), NOW()),
  (107, 'Candy & Chocolate',    'ক্যান্ডি ও চকলেট',                  'grocery-candy-chocolate',     2, 1, 1, 7,  1,1,1, NOW(), NOW()),
  (108, 'Snacks',               'হালকা নাস্তা',                       'grocery-snacks',              2, 1, 1, 8,  1,1,1, NOW(), NOW()),
  (109, 'Beverages',            'পানীয়',                             'grocery-beverages',           2, 1, 1, 9,  1,1,1, NOW(), NOW()),
  (110, 'Baking',               'বেকিং উপকরণ',                       'grocery-baking',              2, 1, 1, 10, 1,1,1, NOW(), NOW()),
  (111, 'Frozen & Canned',      'হিমায়িত ও ক্যানজাত খাবার',          'grocery-frozen-canned',       2, 1, 1, 11, 1,1,1, NOW(), NOW()),
  (112, 'Diabetic Food',        'ডায়াবেটিক খাবার',                    'grocery-diabetic-food',       2, 1, 1, 12, 1,1,1, NOW(), NOW()),
  (113, 'Ice Cream',            'আইসক্রিম',                           'grocery-ice-cream',           2, 1, 1, 13, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: WOMEN'S CLOTHING SUBCATEGORIES (parent=2) ─────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (201, 'Bottoms',                     'নিচের পোশাক',                   'womens-bottoms',              2, 2, 1, 1, 1,1,1, NOW(), NOW()),
  (202, 'Dresses',                     'ড্রেস',                         'womens-dresses',              2, 2, 1, 2, 1,1,1, NOW(), NOW()),
  (203, 'Wedding Dresses',             'বিয়ের পোশাক',                  'womens-wedding-dresses',      2, 2, 1, 3, 1,1,1, NOW(), NOW()),
  (204, 'Special Occasion Dresses',    'বিশেষ অনুষ্ঠানের পোশাক',       'womens-special-occasion',     2, 2, 1, 4, 1,1,1, NOW(), NOW()),
  (205, 'Curve & Plus Size',           'কার্ভ ও প্লাস সাইজ',           'womens-curve-plus',           2, 2, 1, 5, 1,1,1, NOW(), NOW()),
  (206, 'Outerwears',                  'বাইরের পোশাক',                  'womens-outerwears',           2, 2, 1, 6, 1,1,1, NOW(), NOW()),
  (207, 'Matching Sets',               'ম্যাচিং সেট',                  'womens-matching-sets',        2, 2, 1, 7, 1,1,1, NOW(), NOW()),
  (208, 'Tops',                        'টপস',                           'womens-tops',                 2, 2, 1, 8, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: MEN'S CLOTHING SUBCATEGORIES (parent=3) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (301, 'Tops & T-Shirts',  'টপস ও টি-শার্ট',   'mens-tops-tshirts',   2, 3, 1, 1,  1,1,1, NOW(), NOW()),
  (302, 'Shirts',           'শার্ট',             'mens-shirts',         2, 3, 1, 2,  1,1,1, NOW(), NOW()),
  (303, 'Hoodies',          'হুডি',              'mens-hoodies',        2, 3, 1, 3,  1,1,1, NOW(), NOW()),
  (304, 'Suits & Blazers',  'স্যুট ও ব্লেজার',   'mens-suits-blazers',  2, 3, 1, 4,  1,1,1, NOW(), NOW()),
  (305, 'Men''s Sets',      'পুরুষদের সেট',      'mens-sets',           2, 3, 1, 5,  1,1,1, NOW(), NOW()),
  (306, 'Coats',            'কোট',               'mens-coats',          2, 3, 1, 6,  1,1,1, NOW(), NOW()),
  (307, 'Down Jackets',     'ডাউন জ্যাকেট',      'mens-down-jackets',   2, 3, 1, 7,  1,1,1, NOW(), NOW()),
  (308, 'Pants',            'প্যান্ট',           'mens-pants',          2, 3, 1, 8,  1,1,1, NOW(), NOW()),
  (309, 'Jeans',            'জিন্স',             'mens-jeans',          2, 3, 1, 9,  1,1,1, NOW(), NOW()),
  (310, 'Jackets',          'জ্যাকেট',           'mens-jackets',        2, 3, 1, 10, 1,1,1, NOW(), NOW()),
  (311, 'Shorts',           'শর্টস',             'mens-shorts',         2, 3, 1, 11, 1,1,1, NOW(), NOW()),
  (312, 'Sweaters',         'সোয়েটার',          'mens-sweaters',       2, 3, 1, 12, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: PERSONAL CARE SUBCATEGORIES (parent=5) ────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (501, 'Women''s Care',  'নারীদের পরিচর্যা',           'pc-womens-care',   2, 5, 1, 1, 1,1,1, NOW(), NOW()),
  (502, 'Men''s Care',    'পুরুষদের পরিচর্যা',          'pc-mens-care',     2, 5, 1, 2, 1,1,1, NOW(), NOW()),
  (503, 'Handwash',       'হ্যান্ডওয়াশ',               'pc-handwash',      2, 5, 1, 3, 1,1,1, NOW(), NOW()),
  (504, 'Tissue & Wipes', 'টিস্যু ও ওয়াইপস',           'pc-tissue-wipes',  2, 5, 1, 4, 1,1,1, NOW(), NOW()),
  (505, 'Oral Care',      'মুখ ও দাঁতের পরিচর্যা',      'pc-oral-care',     2, 5, 1, 5, 1,1,1, NOW(), NOW()),
  (506, 'Skin Care',      'ত্বকের পরিচর্যা',            'pc-skin-care',     2, 5, 1, 6, 1,1,1, NOW(), NOW()),
  (507, 'Talcum Powder',  'ট্যালকম পাউডার',             'pc-talcum-powder', 2, 5, 1, 7, 1,1,1, NOW(), NOW()),
  (508, 'Hair Color',     'চুলের রং',                   'pc-hair-color',    2, 5, 1, 8, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: HEALTH & WELLNESS SUBCATEGORIES (parent=7) ────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (701, 'Keto Food',                       'কিটো খাবার',                    'hw-keto-food',         2, 7, 1, 1,  1,1,1, NOW(), NOW()),
  (702, 'Antiseptics',                     'অ্যান্টিসেপটিক',                'hw-antiseptics',       2, 7, 1, 2,  1,1,1, NOW(), NOW()),
  (703, 'Handwash & Handrub',              'হ্যান্ডওয়াশ ও হ্যান্ডরাব',    'hw-handwash-handrub',  2, 7, 1, 3,  1,1,1, NOW(), NOW()),
  (704, 'Herbal & Digestive Aids',         'হারবাল ও হজম সহায়ক',           'hw-herbal-digestive',  2, 7, 1, 4,  1,1,1, NOW(), NOW()),
  (705, 'Food Supplements',               'খাদ্য পরিপূরক',                 'hw-food-supplements',  2, 7, 1, 5,  1,1,1, NOW(), NOW()),
  (706, 'Face Masks & Safety',            'ফেস মাস্ক ও সুরক্ষা সামগ্রী',  'hw-face-masks',        2, 7, 1, 6,  1,1,1, NOW(), NOW()),
  (707, 'Family Planning',               'পরিবার পরিকল্পনা',               'hw-family-planning',   2, 7, 1, 7,  1,1,1, NOW(), NOW()),
  (708, 'Mouthwashes, Inhaler & Balm',   'মাউথওয়াশ, ইনহেলার ও বাম',      'hw-mouthwash-inhaler', 2, 7, 1, 8,  1,1,1, NOW(), NOW()),
  (709, 'Adult Diapers',                  'প্রাপ্তবয়স্কদের ডায়াপার',       'hw-adult-diapers',     2, 7, 1, 9,  1,1,1, NOW(), NOW()),
  (710, 'Medical Devices',               'চিকিৎসা সরঞ্জাম',               'hw-medical-devices',   2, 7, 1, 10, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: BABY CARE SUBCATEGORIES (parent=8) ────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (801, 'Diapers',             'ডায়াপার',                           'bc-diapers',             2, 8, 1, 1, 1,1,1, NOW(), NOW()),
  (802, 'Baby Food',           'শিশুখাদ্য',                         'bc-baby-food',           2, 8, 1, 2, 1,1,1, NOW(), NOW()),
  (803, 'Baby Skincare',       'শিশুর ত্বকের পরিচর্যা',             'bc-baby-skincare',       2, 8, 1, 3, 1,1,1, NOW(), NOW()),
  (804, 'Wipes',               'বেবি ওয়াইপস',                      'bc-wipes',               2, 8, 1, 4, 1,1,1, NOW(), NOW()),
  (805, 'Baby Oral Care',      'শিশুর মুখ ও দাঁতের পরিচর্যা',      'bc-baby-oral-care',      2, 8, 1, 5, 1,1,1, NOW(), NOW()),
  (806, 'Newborn Essentials',  'নবজাতকের প্রয়োজনীয় সামগ্রী',      'bc-newborn-essentials',  2, 8, 1, 6, 1,1,1, NOW(), NOW()),
  (807, 'Baby Accessories',    'শিশুর আনুষঙ্গিক সামগ্রী',           'bc-baby-accessories',    2, 8, 1, 7, 1,1,1, NOW(), NOW()),
  (808, 'Feeders',             'ফিডার',                             'bc-feeders',             2, 8, 1, 8, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: HOME & KITCHEN SUBCATEGORIES (parent=9) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (901, 'Kitchen Accessories',  'রান্নাঘরের আনুষঙ্গিক সামগ্রী',      'hk-kitchen-accessories',  2, 9, 1, 1, 1,1,1, NOW(), NOW()),
  (902, 'Kitchen Appliances',   'রান্নাঘরের বৈদ্যুতিক যন্ত্রপাতি',   'hk-kitchen-appliances',   2, 9, 1, 2, 1,1,1, NOW(), NOW()),
  (903, 'Lights & Electrical',  'লাইট ও বৈদ্যুতিক সামগ্রী',          'hk-lights-electrical',    2, 9, 1, 3, 1,1,1, NOW(), NOW()),
  (904, 'Tools & Hardware',     'যন্ত্রপাতি ও হার্ডওয়্যার',          'hk-tools-hardware',       2, 9, 1, 4, 1,1,1, NOW(), NOW()),
  (905, 'Basket & Bucket',      'ঝুড়ি ও বালতি',                      'hk-basket-bucket',        2, 9, 1, 5, 1,1,1, NOW(), NOW()),
  (906, 'Box & Container',      'বক্স ও কনটেইনার',                   'hk-box-container',        2, 9, 1, 6, 1,1,1, NOW(), NOW()),
  (907, 'Gardening',            'বাগান পরিচর্যা',                     'hk-gardening',            2, 9, 1, 7, 1,1,1, NOW(), NOW()),
  (908, 'Rack & Organizer',     'র‍্যাক ও অর্গানাইজার',               'hk-rack-organizer',       2, 9, 1, 8, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: CLEANING SUPPLIES SUBCATEGORIES (parent=10) ──────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (1001, 'Dishwashing Supplies',      'বাসন পরিষ্কারের সামগ্রী',                   'cs-dishwashing',          2, 10, 1, 1,  1,1,1, NOW(), NOW()),
  (1002, 'Laundry',                   'কাপড় ধোয়ার সামগ্রী',                        'cs-laundry',              2, 10, 1, 2,  1,1,1, NOW(), NOW()),
  (1003, 'Toilet Cleaners',           'টয়লেট পরিষ্কারক',                            'cs-toilet-cleaners',      2, 10, 1, 3,  1,1,1, NOW(), NOW()),
  (1004, 'Napkins & Paper Products',  'ন্যাপকিন ও কাগজজাত পণ্য',                  'cs-napkins-paper',        2, 10, 1, 4,  1,1,1, NOW(), NOW()),
  (1005, 'Pest Control',              'কীটপতঙ্গ নিয়ন্ত্রণ',                         'cs-pest-control',         2, 10, 1, 5,  1,1,1, NOW(), NOW()),
  (1006, 'Floor & Glass Cleaners',    'মেঝে ও কাচ পরিষ্কারক',                       'cs-floor-glass',          2, 10, 1, 6,  1,1,1, NOW(), NOW()),
  (1007, 'Cleaning Accessories',      'পরিষ্কার-পরিচ্ছন্নতার আনুষঙ্গিক সামগ্রী', 'cs-cleaning-accessories', 2, 10, 1, 7,  1,1,1, NOW(), NOW()),
  (1008, 'Air Fresheners',            'এয়ার ফ্রেশনার',                              'cs-air-fresheners',       2, 10, 1, 8,  1,1,1, NOW(), NOW()),
  (1009, 'Disposables & Trash Bags',  'একবার ব্যবহারযোগ্য সামগ্রী ও ট্র্যাশ ব্যাগ','cs-disposables',        2, 10, 1, 9,  1,1,1, NOW(), NOW()),
  (1010, 'Shoe Care',                 'জুতার পরিচর্যা',                              'cs-shoe-care',            2, 10, 1, 10, 1,1,1, NOW(), NOW()),
  (1011, 'Trash Bin & Basket',        'ডাস্টবিন ও ঝুড়ি',                           'cs-trash-bin',            2, 10, 1, 11, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: STATIONERY & OFFICE SUBCATEGORIES (parent=11) ────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (1101, 'Office Electronics',   'অফিস ইলেকট্রনিক্স',            'so-office-electronics',  2, 11, 1, 1, 1,1,1, NOW(), NOW()),
  (1102, 'Organizers',           'অর্গানাইজার',                  'so-organizers',           2, 11, 1, 2, 1,1,1, NOW(), NOW()),
  (1103, 'Writing & Printing',   'লেখালেখি ও প্রিন্টিং সামগ্রী', 'so-writing-printing',     2, 11, 1, 3, 1,1,1, NOW(), NOW()),
  (1104, 'Paper Supplies',       'কাগজজাত সামগ্রী',              'so-paper-supplies',       2, 11, 1, 4, 1,1,1, NOW(), NOW()),
  (1105, 'School Supplies',      'স্কুল সামগ্রী',                'so-school-supplies',      2, 11, 1, 5, 1,1,1, NOW(), NOW()),
  (1106, 'Arts & Crafts',        'চারুকলা ও হস্তশিল্প সামগ্রী', 'so-arts-crafts',          2, 11, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 2: PET CARE SUBCATEGORIES (parent=12) ────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (1201, 'Cat Food',               'বিড়ালের খাবার',                               'petcare-cat-food',       2, 12, 1, 1, 1,1,1, NOW(), NOW()),
  (1202, 'Cat Litters',            'বিড়ালের লিটার',                               'petcare-cat-litters',    2, 12, 1, 2, 1,1,1, NOW(), NOW()),
  (1203, 'Kitten Food',            'বিড়ালছানার খাবার',                            'petcare-kitten-food',    2, 12, 1, 3, 1,1,1, NOW(), NOW()),
  (1204, 'Dog Food',               'কুকুরের খাবার',                               'petcare-dog-food',       2, 12, 1, 4, 1,1,1, NOW(), NOW()),
  (1205, 'Grooming & Cleaning',    'পরিচর্যা ও পরিষ্কার-পরিচ্ছন্নতার সামগ্রী', 'petcare-grooming',       2, 12, 1, 5, 1,1,1, NOW(), NOW()),
  (1206, 'Bird & Other Pet Food',  'পাখি ও অন্যান্য পোষা প্রাণীর খাবার',        'petcare-bird-others',    2, 12, 1, 6, 1,1,1, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════════════════
-- LEVEL 3 CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── LEVEL 3: GROCERY > FRUITS & VEGETABLES (parent=101) ───────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2001, 'Fresh Vegetables',  'তাজা শাকসবজি',  'fresh-vegetables',  3, 101, 1, 1, 1,1,1, NOW(), NOW()),
  (2002, 'Fresh Fruits',      'তাজা ফল',       'fresh-fruits',      3, 101, 1, 2, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > MEAT & FISH (parent=102) ────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2011, 'Chicken & Poultry',        'মুরগি ও পোলট্রি',        'chicken-poultry',        3, 102, 1, 1, 1,1,1, NOW(), NOW()),
  (2012, 'Premium Perishables',      'প্রিমিয়াম তাজা খাদ্যপণ্য', 'premium-perishables',  3, 102, 1, 2, 1,1,1, NOW(), NOW()),
  (2013, 'Frozen Fish',              'হিমায়িত মাছ',            'frozen-fish',            3, 102, 1, 3, 1,1,1, NOW(), NOW()),
  (2014, 'Meat',                     'মাংস',                    'meat',                   3, 102, 1, 4, 1,1,1, NOW(), NOW()),
  (2015, 'Tofu & Meat Alternatives', 'টোফু ও মাংসের বিকল্প',  'tofu-meat-alternatives', 3, 102, 1, 5, 1,1,1, NOW(), NOW()),
  (2016, 'Dried Fish',               'শুঁটকি মাছ',             'dried-fish',             3, 102, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > COOKING (parent=103) ─────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2021, 'Spices',                'মসলা',                        'spices',              3, 103, 1, 1,  1,1,1, NOW(), NOW()),
  (2022, 'Salt & Sugar',          'লবণ ও চিনি',                 'salt-sugar',          3, 103, 1, 2,  1,1,1, NOW(), NOW()),
  (2023, 'Rice',                  'চাল',                         'rice',                3, 103, 1, 3,  1,1,1, NOW(), NOW()),
  (2024, 'Dal or Lentil',         'ডাল',                         'dal-lentil',          3, 103, 1, 4,  1,1,1, NOW(), NOW()),
  (2025, 'Ready Mix',             'রেডি মিক্স',                 'ready-mix',           3, 103, 1, 5,  1,1,1, NOW(), NOW()),
  (2026, 'Shemai & Suji',         'সেমাই ও সুজি',               'shemai-suji',         3, 103, 1, 6,  1,1,1, NOW(), NOW()),
  (2027, 'Special Ingredients',   'বিশেষ রান্নার উপকরণ',        'special-ingredients', 3, 103, 1, 7,  1,1,1, NOW(), NOW()),
  (2028, 'Oil',                   'তেল',                         'cooking-oil',         3, 103, 1, 8,  1,1,1, NOW(), NOW()),
  (2029, 'Colors & Flavours',     'খাদ্য রং ও ফ্লেভার',         'colors-flavours',     3, 103, 1, 9,  1,1,1, NOW(), NOW()),
  (2030, 'Ghee',                  'ঘি',                          'ghee',                3, 103, 1, 10, 1,1,1, NOW(), NOW()),
  (2031, 'Premium Ingredients',   'প্রিমিয়াম রান্নার উপকরণ',   'premium-ingredients', 3, 103, 1, 11, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > SAUCES & PICKLES (parent=104) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2041, 'Tomato Sauces',        'টমেটো সস',            'tomato-sauces',     3, 104, 1, 1, 1,1,1, NOW(), NOW()),
  (2042, 'Pickles',              'আচার',                 'pickles',           3, 104, 1, 2, 1,1,1, NOW(), NOW()),
  (2043, 'Cooking Sauces',       'রান্নার সস',           'cooking-sauces',    3, 104, 1, 3, 1,1,1, NOW(), NOW()),
  (2044, 'Other Table Sauces',   'অন্যান্য টেবিল সস',   'other-table-sauces',3, 104, 1, 4, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > DAIRY & EGGS (parent=105) ───────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2051, 'Eggs',                      'ডিম',                           'eggs',                  3, 105, 1, 1, 1,1,1, NOW(), NOW()),
  (2052, 'Powder Milk',               'গুঁড়ো দুধ',                    'powder-milk',           3, 105, 1, 2, 1,1,1, NOW(), NOW()),
  (2053, 'Liquid & UHT Milk',         'তরল ও ইউএইচটি দুধ',            'liquid-uht-milk',       3, 105, 1, 3, 1,1,1, NOW(), NOW()),
  (2054, 'Yogurt & Sweets',           'দই ও মিষ্টি',                  'yogurt-sweets',         3, 105, 1, 4, 1,1,1, NOW(), NOW()),
  (2055, 'Cheese',                    'চিজ',                           'cheese',                3, 105, 1, 5, 1,1,1, NOW(), NOW()),
  (2056, 'Condensed Milk & Cream',    'কনডেন্সড মিল্ক ও ক্রিম',       'condensed-milk-cream',  3, 105, 1, 6, 1,1,1, NOW(), NOW()),
  (2057, 'Butter & Sour Cream',       'মাখন ও সাওয়ার ক্রিম',         'butter-sour-cream',     3, 105, 1, 7, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > BREAKFAST (parent=106) ──────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2061, 'Breads',                  'পাউরুটি',                    'breads',              3, 106, 1, 1, 1,1,1, NOW(), NOW()),
  (2062, 'Tea & Coffee',            'চা ও কফি',                  'tea-coffee',          3, 106, 1, 2, 1,1,1, NOW(), NOW()),
  (2063, 'Local Breakfast',         'দেশীয় নাশতা',               'local-breakfast',     3, 106, 1, 3, 1,1,1, NOW(), NOW()),
  (2064, 'Cereals',                 'ব্রেকফাস্ট সিরিয়াল',       'cereals',             3, 106, 1, 4, 1,1,1, NOW(), NOW()),
  (2065, 'Honey',                   'মধু',                        'honey',               3, 106, 1, 5, 1,1,1, NOW(), NOW()),
  (2066, 'Dips, Spreads & Syrups',  'ডিপস, স্প্রেড ও সিরাপ',    'dips-spreads-syrups', 3, 106, 1, 6, 1,1,1, NOW(), NOW()),
  (2067, 'Energy Boosters',         'শক্তিবর্ধক খাদ্য',           'energy-boosters',     3, 106, 1, 7, 1,1,1, NOW(), NOW()),
  (2068, 'Jams & Jellies',          'জ্যাম ও জেলি',              'jams-jellies',        3, 106, 1, 8, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > CANDY & CHOCOLATE (parent=107) ──────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2071, 'Chocolates',                   'চকলেট',                       'chocolates',          3, 107, 1, 1, 1,1,1, NOW(), NOW()),
  (2072, 'Wafers',                       'ওয়েফার',                     'wafers',              3, 107, 1, 2, 1,1,1, NOW(), NOW()),
  (2073, 'Candies',                      'ক্যান্ডি',                   'candies',             3, 107, 1, 3, 1,1,1, NOW(), NOW()),
  (2074, 'Gums, Mints & Mouth Fresheners','চুইংগাম, মিন্ট ও মুখশুদ্ধি','gums-mints-fresheners',3,107,1, 4, 1,1,1, NOW(), NOW()),
  (2075, 'Jellies & Marshmallows',       'জেলি ও মার্শম্যালো',         'jellies-marshmallows',3, 107, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > SNACKS (parent=108) ─────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2081, 'Noodles',               'নুডলস',                  'noodles',             3, 108, 1, 1,  1,1,1, NOW(), NOW()),
  (2082, 'Cookies',               'কুকিজ',                  'cookies',             3, 108, 1, 2,  1,1,1, NOW(), NOW()),
  (2083, 'Local Snacks',          'দেশীয় নাস্তা',           'local-snacks',        3, 108, 1, 3,  1,1,1, NOW(), NOW()),
  (2084, 'Chips & Pretzels',      'চিপস ও প্রেটজেল',        'chips-pretzels',      3, 108, 1, 4,  1,1,1, NOW(), NOW()),
  (2085, 'Plain Biscuits',        'সাধারণ বিস্কুট',         'plain-biscuits',      3, 108, 1, 5,  1,1,1, NOW(), NOW()),
  (2086, 'Toast & Bakery Biscuits','টোস্ট ও বেকারি বিস্কুট','toast-bakery-biscuits',3,108, 1, 6,  1,1,1, NOW(), NOW()),
  (2087, 'Cream Biscuits',        'ক্রিম বিস্কুট',          'cream-biscuits',      3, 108, 1, 7,  1,1,1, NOW(), NOW()),
  (2088, 'Pasta & Macaroni',      'পাস্তা ও ম্যাকারনি',    'pasta-macaroni',      3, 108, 1, 8,  1,1,1, NOW(), NOW()),
  (2089, 'Soups',                 'স্যুপ',                   'soups',               3, 108, 1, 9,  1,1,1, NOW(), NOW()),
  (2090, 'Popcorn & Nuts',        'পপকর্ন ও বাদাম',         'popcorn-nuts',        3, 108, 1, 10, 1,1,1, NOW(), NOW()),
  (2091, 'Salted Biscuits',       'নোনতা বিস্কুট',          'salted-biscuits',     3, 108, 1, 11, 1,1,1, NOW(), NOW()),
  (2092, 'Cakes',                 'কেক',                     'cakes',               3, 108, 1, 12, 1,1,1, NOW(), NOW()),
  (2093, 'Salad Dressing',        'সালাদ ড্রেসিং',          'salad-dressing',      3, 108, 1, 13, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > BEVERAGES (parent=109) ──────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2101, 'Tea',                    'চা',                      'tea',                  3, 109, 1, 1, 1,1,1, NOW(), NOW()),
  (2102, 'Soft Drinks',            'কোমল পানীয়',             'soft-drinks',          3, 109, 1, 2, 1,1,1, NOW(), NOW()),
  (2103, 'Coffee',                 'কফি',                     'coffee',               3, 109, 1, 3, 1,1,1, NOW(), NOW()),
  (2104, 'Syrups & Powder Drinks', 'সিরাপ ও পাউডার পানীয়',  'syrups-powder-drinks', 3, 109, 1, 4, 1,1,1, NOW(), NOW()),
  (2105, 'Juice',                  'জুস',                     'juice',                3, 109, 1, 5, 1,1,1, NOW(), NOW()),
  (2106, 'Water',                  'পানি',                    'water',                3, 109, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > BAKING (parent=110) ──────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2111, 'Flour',                   'আটা ও ময়দা',              'flour',                 3, 110, 1, 1, 1,1,1, NOW(), NOW()),
  (2112, 'Nuts & Dried Fruits',     'বাদাম ও শুকনো ফল',       'nuts-dried-fruits',     3, 110, 1, 2, 1,1,1, NOW(), NOW()),
  (2113, 'Baking Ingredients',      'বেকিং উপকরণ',             'baking-ingredients',    3, 110, 1, 3, 1,1,1, NOW(), NOW()),
  (2114, 'Baking Tools',            'বেকিং সরঞ্জাম',           'baking-tools',          3, 110, 1, 4, 1,1,1, NOW(), NOW()),
  (2115, 'Baking & Dessert Mixes',  'বেকিং ও ডেজার্ট মিক্স',  'baking-dessert-mixes',  3, 110, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: GROCERY > FROZEN & CANNED (parent=111) ────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (2121, 'Chicken Snacks',          'চিকেন স্ন্যাকস',         'chicken-snacks',     3, 111, 1, 1, 1,1,1, NOW(), NOW()),
  (2122, 'Frozen Parathas & Roti',  'হিমায়িত পরোটা ও রুটি',  'frozen-parathas',    3, 111, 1, 2, 1,1,1, NOW(), NOW()),
  (2123, 'Vegetable Snacks',        'সবজির স্ন্যাকস',         'vegetable-snacks',   3, 111, 1, 3, 1,1,1, NOW(), NOW()),
  (2124, 'Mushroom Cans',           'ক্যানজাত মাশরুম',        'mushroom-cans',      3, 111, 1, 4, 1,1,1, NOW(), NOW()),
  (2125, 'Beef Snacks',             'বিফ স্ন্যাকস',           'beef-snacks',        3, 111, 1, 5, 1,1,1, NOW(), NOW()),
  (2126, 'Vegetable Cans',          'ক্যানজাত সবজি',          'vegetable-cans',     3, 111, 1, 6, 1,1,1, NOW(), NOW()),
  (2127, 'Fish Cans',               'ক্যানজাত মাছ',           'fish-cans',          3, 111, 1, 7, 1,1,1, NOW(), NOW()),
  (2128, 'Canned Fruits & Sweets',  'ক্যানজাত ফল ও মিষ্টি',  'canned-fruits',      3, 111, 1, 8, 1,1,1, NOW(), NOW()),
  (2129, 'Fish Snacks',             'মাছের স্ন্যাকস',         'fish-snacks',        3, 111, 1, 9, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S CLOTHING > BOTTOMS (parent=201) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3001, 'Pants',          'প্যান্ট',           'womens-pants',      3, 201, 1, 1, 1,1,1, NOW(), NOW()),
  (3002, 'Shorts',         'শর্টস',             'womens-shorts',     3, 201, 1, 2, 1,1,1, NOW(), NOW()),
  (3003, 'Skirts',         'স্কার্ট',           'womens-skirts',     3, 201, 1, 3, 1,1,1, NOW(), NOW()),
  (3004, 'Jeans',          'জিন্স',             'womens-jeans',      3, 201, 1, 4, 1,1,1, NOW(), NOW()),
  (3005, 'Leggings',       'লেগিংস',           'womens-leggings',   3, 201, 1, 5, 1,1,1, NOW(), NOW()),
  (3006, 'Women''s Pants', 'নারীদের প্যান্ট',   'womens-pants-all',  3, 201, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S CLOTHING > DRESSES (parent=202) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3011, 'Indian Suits',          'ভারতীয় স্যুট',         'indian-suits',         3, 202, 1, 1, 1,1,1, NOW(), NOW()),
  (3012, 'Pakistani Suits',       'পাকিস্তানি স্যুট',      'pakistani-suits',      3, 202, 1, 2, 1,1,1, NOW(), NOW()),
  (3013, 'Long Dresses',          'লম্বা ড্রেস',            'long-dresses',         3, 202, 1, 3, 1,1,1, NOW(), NOW()),
  (3014, 'Long Sleeve Dresses',   'লম্বা হাতার ড্রেস',     'long-sleeve-dresses',  3, 202, 1, 4, 1,1,1, NOW(), NOW()),
  (3015, 'Party Dresses',         'পার্টি ড্রেস',           'party-dresses',        3, 202, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S > WEDDING DRESSES (parent=203) ────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3021, 'Wedding Party Dress',       'ওয়েডিং পার্টি ড্রেস',       'wedding-party-dress',    3, 203, 1, 1, 1,1,1, NOW(), NOW()),
  (3022, 'Wedding Dress',             'বিয়ের গাউন',                 'wedding-dress',          3, 203, 1, 2, 1,1,1, NOW(), NOW()),
  (3023, 'Wedding Accessories',       'বিয়ের আনুষঙ্গিক সামগ্রী',   'wedding-accessories',    3, 203, 1, 3, 1,1,1, NOW(), NOW()),
  (3024, 'Plus Size Wedding Dress',   'প্লাস সাইজ বিয়ের গাউন',     'plus-wedding-dress',     3, 203, 1, 4, 1,1,1, NOW(), NOW()),
  (3025, 'Bespoke Wedding Dress',     'কাস্টম-মেড বিয়ের গাউন',     'bespoke-wedding-dress',  3, 203, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S > SPECIAL OCCASION (parent=204) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3031, 'Formal Occasion Dresses',   'আনুষ্ঠানিক অনুষ্ঠানের ড্রেস',   'formal-occasion-dresses',  3, 204, 1, 1, 1,1,1, NOW(), NOW()),
  (3032, 'Bespoke Occasion Dresses',  'কাস্টম-মেড অনুষ্ঠানের ড্রেস',   'bespoke-occasion-dresses', 3, 204, 1, 2, 1,1,1, NOW(), NOW()),
  (3033, 'Homecoming Dresses',        'হোমকামিং ড্রেস',                 'homecoming-dresses',       3, 204, 1, 3, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S > CURVE & PLUS SIZE (parent=205) ──────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3041, 'Plus Size Swimwears',     'প্লাস সাইজ সাঁতারের পোশাক',  'plus-size-swimwears',    3, 205, 1, 1, 1,1,1, NOW(), NOW()),
  (3042, 'Plus Size Outerwears',    'প্লাস সাইজ বাইরের পোশাক',    'plus-size-outerwears',   3, 205, 1, 2, 1,1,1, NOW(), NOW()),
  (3043, 'Plus Size Down Coats',    'প্লাস সাইজ ডাউন কোট',        'plus-size-down-coats',   3, 205, 1, 3, 1,1,1, NOW(), NOW()),
  (3044, 'Plus Size Matching Sets', 'প্লাস সাইজ ম্যাচিং সেট',     'plus-size-matching-sets',3, 205, 1, 4, 1,1,1, NOW(), NOW()),
  (3045, 'Plus Size Tops',          'প্লাস সাইজ টপস',             'plus-size-tops',         3, 205, 1, 5, 1,1,1, NOW(), NOW()),
  (3046, 'Plus Size Dresses',       'প্লাস সাইজ ড্রেস',           'plus-size-dresses',      3, 205, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S > OUTERWEARS (parent=206) ──────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3051, 'Down Coats',             'ডাউন কোট',                      'down-coats',           3, 206, 1, 1, 1,1,1, NOW(), NOW()),
  (3052, 'Wool & Blends Coats',    'উলের ও মিশ্র কাপড়ের কোট',      'wool-blends-coats',    3, 206, 1, 2, 1,1,1, NOW(), NOW()),
  (3053, 'Parkas',                 'পার্কা',                         'parkas',               3, 206, 1, 3, 1,1,1, NOW(), NOW()),
  (3054, 'Long Down Coats',        'লম্বা ডাউন কোট',                'long-down-coats',      3, 206, 1, 4, 1,1,1, NOW(), NOW()),
  (3055, 'Short Down Coats',       'ছোট ডাউন কোট',                  'short-down-coats',     3, 206, 1, 5, 1,1,1, NOW(), NOW()),
  (3056, 'Cardigans',              'কার্ডিগান',                     'womens-cardigans',     3, 206, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S > MATCHING SETS (parent=207) ──────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3061, 'Pant Sets',             'প্যান্ট সেট',           'pant-sets',            3, 207, 1, 1, 1,1,1, NOW(), NOW()),
  (3062, 'Short Sets',            'শর্টস সেট',             'short-sets',           3, 207, 1, 2, 1,1,1, NOW(), NOW()),
  (3063, 'Dress Sets',            'ড্রেস সেট',             'dress-sets',           3, 207, 1, 3, 1,1,1, NOW(), NOW()),
  (3064, 'Sweater Matching Sets', 'সোয়েটার ম্যাচিং সেট', 'sweater-matching-sets',3, 207, 1, 4, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: WOMEN'S > TOPS (parent=208) ────────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (3071, 'Shirts & Blouses',   'শার্ট ও ব্লাউজ',       'shirts-blouses',       3, 208, 1, 1, 1,1,1, NOW(), NOW()),
  (3072, 'Knitwears',          'নিটওয়্যার',            'knitwears',            3, 208, 1, 2, 1,1,1, NOW(), NOW()),
  (3073, 'Pullovers',          'পুলওভার',               'womens-pullovers',     3, 208, 1, 3, 1,1,1, NOW(), NOW()),
  (3074, 'O-Neck Pullovers',   'ও-নেক পুলওভার',         'o-neck-pullovers',     3, 208, 1, 4, 1,1,1, NOW(), NOW()),
  (3075, 'Long Sleeve Tees',   'লম্বা হাতার টি-শার্ট',  'womens-long-sleeve',   3, 208, 1, 5, 1,1,1, NOW(), NOW()),
  (3076, 'Turtlenecks',        'টার্টলনেক',             'womens-turtlenecks',   3, 208, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > TOPS & T-SHIRTS (parent=301) ──────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4001, 'T-Shirts',           'টি-শার্ট',              'mens-tshirts',         3, 301, 1, 1, 1,1,1, NOW(), NOW()),
  (4002, 'Polo Shirts',        'পোলো শার্ট',            'polo-shirts',          3, 301, 1, 2, 1,1,1, NOW(), NOW()),
  (4003, 'Tank Tops',          'ট্যাঙ্ক টপ',            'tank-tops',            3, 301, 1, 3, 1,1,1, NOW(), NOW()),
  (4004, 'Compression Shirts', 'কমপ্রেশন শার্ট',        'compression-shirts',   3, 301, 1, 4, 1,1,1, NOW(), NOW()),
  (4005, 'Henley Shirts',      'হেনলি শার্ট',           'henley-shirts',        3, 301, 1, 5, 1,1,1, NOW(), NOW()),
  (4006, 'Long Sleeve T-Shirts','লম্বা হাতার টি-শার্ট', 'mens-long-sleeve-tees',3, 301, 1, 6, 1,1,1, NOW(), NOW()),
  (4007, 'Graphic T-Shirts',   'গ্রাফিক টি-শার্ট',      'graphic-tshirts',      3, 301, 1, 7, 1,1,1, NOW(), NOW()),
  (4008, 'Oversized T-Shirts', 'ওভারসাইজ টি-শার্ট',    'oversized-tshirts',    3, 301, 1, 8, 1,1,1, NOW(), NOW()),
  (4009, 'Sports T-Shirts',    'স্পোর্টস টি-শার্ট',    'sports-tshirts',       3, 301, 1, 9, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > SHIRTS (parent=302) ────────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4011, 'Casual Shirts',    'ক্যাজুয়াল শার্ট',   'casual-shirts',   3, 302, 1, 1, 1,1,1, NOW(), NOW()),
  (4012, 'Dress Shirts',     'ফরমাল শার্ট',        'dress-shirts',    3, 302, 1, 2, 1,1,1, NOW(), NOW()),
  (4013, 'Denim Shirts',     'ডেনিম শার্ট',        'denim-shirts',    3, 302, 1, 3, 1,1,1, NOW(), NOW()),
  (4014, 'Linen Shirts',     'লিনেন শার্ট',        'linen-shirts',    3, 302, 1, 4, 1,1,1, NOW(), NOW()),
  (4015, 'Plaid Shirts',     'চেক শার্ট',          'plaid-shirts',    3, 302, 1, 5, 1,1,1, NOW(), NOW()),
  (4016, 'Oxford Shirts',    'অক্সফোর্ড শার্ট',    'oxford-shirts',   3, 302, 1, 6, 1,1,1, NOW(), NOW()),
  (4017, 'Flannel Shirts',   'ফ্ল্যানেল শার্ট',    'flannel-shirts',  3, 302, 1, 7, 1,1,1, NOW(), NOW()),
  (4018, 'Hawaiian Shirts',  'হাওয়াইয়ান শার্ট',  'hawaiian-shirts', 3, 302, 1, 8, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > HOODIES (parent=303) ───────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4021, 'Hoodies',            'হুডি',              'hoodies',            3, 303, 1, 1, 1,1,1, NOW(), NOW()),
  (4022, 'Zip Hoodies',        'জিপ হুডি',          'zip-hoodies',        3, 303, 1, 2, 1,1,1, NOW(), NOW()),
  (4023, 'Pullover Hoodies',   'পুলওভার হুডি',      'pullover-hoodies',   3, 303, 1, 3, 1,1,1, NOW(), NOW()),
  (4024, 'Fleece Hoodies',     'ফ্লিস হুডি',        'fleece-hoodies',     3, 303, 1, 4, 1,1,1, NOW(), NOW()),
  (4025, 'Oversized Hoodies',  'ওভারসাইজ হুডি',    'oversized-hoodies',  3, 303, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > SUITS & BLAZERS (parent=304) ──────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4031, 'Business Suits',  'বিজনেস স্যুট',   'business-suits', 3, 304, 1, 1, 1,1,1, NOW(), NOW()),
  (4032, 'Wedding Suits',   'বিয়ের স্যুট',    'wedding-suits',  3, 304, 1, 2, 1,1,1, NOW(), NOW()),
  (4033, 'Blazers',         'ব্লেজার',        'blazers',        3, 304, 1, 3, 1,1,1, NOW(), NOW()),
  (4034, 'Suit Jackets',    'স্যুট জ্যাকেট',  'suit-jackets',   3, 304, 1, 4, 1,1,1, NOW(), NOW()),
  (4035, 'Suit Vests',      'স্যুট ভেস্ট',    'suit-vests',     3, 304, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > PANTS (parent=308) ─────────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4081, 'Casual Pants',   'ক্যাজুয়াল প্যান্ট',  'casual-pants',  3, 308, 1, 1, 1,1,1, NOW(), NOW()),
  (4082, 'Cargo Pants',    'কার্গো প্যান্ট',       'cargo-pants',   3, 308, 1, 2, 1,1,1, NOW(), NOW()),
  (4083, 'Chinos',         'চিনো প্যান্ট',         'chinos',        3, 308, 1, 3, 1,1,1, NOW(), NOW()),
  (4084, 'Joggers',        'জগার প্যান্ট',         'joggers',       3, 308, 1, 4, 1,1,1, NOW(), NOW()),
  (4085, 'Sweatpants',     'সুইটপ্যান্ট',          'sweatpants',    3, 308, 1, 5, 1,1,1, NOW(), NOW()),
  (4086, 'Formal Pants',   'ফরমাল প্যান্ট',        'formal-pants',  3, 308, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > JEANS (parent=309) ─────────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4091, 'Skinny Jeans',       'স্কিনি জিন্স',         'skinny-jeans',       3, 309, 1, 1, 1,1,1, NOW(), NOW()),
  (4092, 'Slim Fit Jeans',     'স্লিম ফিট জিন্স',      'slim-fit-jeans',     3, 309, 1, 2, 1,1,1, NOW(), NOW()),
  (4093, 'Straight Fit Jeans', 'স্ট্রেইট ফিট জিন্স',  'straight-fit-jeans', 3, 309, 1, 3, 1,1,1, NOW(), NOW()),
  (4094, 'Wide Leg Jeans',     'ওয়াইড লেগ জিন্স',     'wide-leg-jeans',     3, 309, 1, 4, 1,1,1, NOW(), NOW()),
  (4095, 'Ripped Jeans',       'রিপড জিন্স',           'ripped-jeans',       3, 309, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > JACKETS (parent=310) ───────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4101, 'Bomber Jackets',    'বোম্বার জ্যাকেট',    'bomber-jackets',    3, 310, 1, 1, 1,1,1, NOW(), NOW()),
  (4102, 'Denim Jackets',     'ডেনিম জ্যাকেট',      'denim-jackets',     3, 310, 1, 2, 1,1,1, NOW(), NOW()),
  (4103, 'Leather Jackets',   'লেদার জ্যাকেট',      'leather-jackets',   3, 310, 1, 3, 1,1,1, NOW(), NOW()),
  (4104, 'Windbreakers',      'উইন্ডব্রেকার',        'windbreakers',      3, 310, 1, 4, 1,1,1, NOW(), NOW()),
  (4105, 'Varsity Jackets',   'ভার্সিটি জ্যাকেট',  'varsity-jackets',   3, 310, 1, 5, 1,1,1, NOW(), NOW()),
  (4106, 'Military Jackets',  'মিলিটারি জ্যাকেট',   'military-jackets',  3, 310, 1, 6, 1,1,1, NOW(), NOW()),
  (4107, 'Softshell Jackets', 'সফটশেল জ্যাকেট',     'softshell-jackets', 3, 310, 1, 7, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > SHORTS (parent=311) ────────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4111, 'Cargo Shorts',   'কার্গো শর্টস',   'cargo-shorts',  3, 311, 1, 1, 1,1,1, NOW(), NOW()),
  (4112, 'Denim Shorts',   'ডেনিম শর্টস',    'denim-shorts',  3, 311, 1, 2, 1,1,1, NOW(), NOW()),
  (4113, 'Sports Shorts',  'স্পোর্টস শর্টস', 'sports-shorts', 3, 311, 1, 3, 1,1,1, NOW(), NOW()),
  (4114, 'Beach Shorts',   'বিচ শর্টস',      'beach-shorts',  3, 311, 1, 4, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: MEN'S > SWEATERS (parent=312) ──────────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (4121, 'Pullovers',            'পুলওভার',             'mens-pullovers',       3, 312, 1, 1, 1,1,1, NOW(), NOW()),
  (4122, 'Cardigans',            'কার্ডিগান',           'mens-cardigans',       3, 312, 1, 2, 1,1,1, NOW(), NOW()),
  (4123, 'Turtleneck Sweaters',  'টার্টলনেক সোয়েটার', 'turtleneck-sweaters',  3, 312, 1, 3, 1,1,1, NOW(), NOW()),
  (4124, 'Knitted Sweaters',     'নিট সোয়েটার',        'knitted-sweaters',     3, 312, 1, 4, 1,1,1, NOW(), NOW()),
  (4125, 'V-Neck Sweaters',      'ভি-নেক সোয়েটার',     'v-neck-sweaters',      3, 312, 1, 5, 1,1,1, NOW(), NOW()),
  (4126, 'Crew Neck Sweaters',   'ক্রু নেক সোয়েটার',  'crew-neck-sweaters',   3, 312, 1, 6, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: PERSONAL CARE > WOMEN'S CARE (parent=501) ────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (5011, 'Women''s Soaps',                  'নারীদের সাবান',                   'womens-soaps',                3, 501, 1, 1,  1,1,1, NOW(), NOW()),
  (5012, 'Hair Care',                       'চুলের যত্ন',                      'womens-hair-care',            3, 501, 1, 2,  1,1,1, NOW(), NOW()),
  (5013, 'Women''s Shampoos & Conditioners','নারীদের শ্যাম্পু ও কন্ডিশনার',  'womens-shampoos',             3, 501, 1, 3,  1,1,1, NOW(), NOW()),
  (5014, 'Feminine Care',                   'নারী পরিচর্যা',                   'feminine-care',               3, 501, 1, 4,  1,1,1, NOW(), NOW()),
  (5015, 'Female Moisturizer',              'নারীদের ময়েশ্চারাইজার',           'female-moisturizer',          3, 501, 1, 5,  1,1,1, NOW(), NOW()),
  (5016, 'Face Wash & Scrub',               'ফেসওয়াশ ও স্ক্রাব',              'face-wash-scrub',             3, 501, 1, 6,  1,1,1, NOW(), NOW()),
  (5017, 'Female Deo',                      'নারীদের ডিওডোরেন্ট',              'female-deo',                  3, 501, 1, 7,  1,1,1, NOW(), NOW()),
  (5018, 'Women''s Perfume',               'নারীদের পারফিউম',                 'womens-perfume',              3, 501, 1, 8,  1,1,1, NOW(), NOW()),
  (5019, 'Women''s Shower Gel',            'নারীদের শাওয়ার জেল',              'womens-shower-gel',           3, 501, 1, 9,  1,1,1, NOW(), NOW()),
  (5020, 'Masks & Cleansers',              'মাস্ক ও ক্লিনজার',                'masks-cleansers',             3, 501, 1, 10, 1,1,1, NOW(), NOW()),
  (5021, 'Serum, Oil & Toners',            'সিরাম, তেল ও টোনার',              'serum-oil-toners',            3, 501, 1, 11, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: PERSONAL CARE > MEN'S CARE (parent=502) ──────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (5031, 'Men''s Soaps',                  'পুরুষদের সাবান',                  'mens-soaps',               3, 502, 1, 1,  1,1,1, NOW(), NOW()),
  (5032, 'Men''s Perfume',               'পুরুষদের পারফিউম',               'mens-perfume',             3, 502, 1, 2,  1,1,1, NOW(), NOW()),
  (5033, 'Men''s Shampoos & Conditioners','পুরুষদের শ্যাম্পু ও কন্ডিশনার','mens-shampoos',            3, 502, 1, 3,  1,1,1, NOW(), NOW()),
  (5034, 'Shaving Needs',                 'শেভিং সামগ্রী',                   'shaving-needs',            3, 502, 1, 4,  1,1,1, NOW(), NOW()),
  (5035, 'Beard Grooming',                'দাড়ির পরিচর্যা',                  'beard-grooming',           3, 502, 1, 5,  1,1,1, NOW(), NOW()),
  (5036, 'Men''s Deodorants',            'পুরুষদের ডিওডোরেন্ট',             'mens-deodorants',          3, 502, 1, 6,  1,1,1, NOW(), NOW()),
  (5037, 'Razors & Blades',               'রেজর ও ব্লেড',                    'razors-blades',            3, 502, 1, 7,  1,1,1, NOW(), NOW()),
  (5038, 'Men''s Hair Care',             'পুরুষদের চুলের পরিচর্যা',         'mens-hair-care',           3, 502, 1, 8,  1,1,1, NOW(), NOW()),
  (5039, 'Cream & Lotion',               'ক্রিম ও লোশন',                    'cream-lotion',             3, 502, 1, 9,  1,1,1, NOW(), NOW()),
  (5040, 'Men''s Facewash',              'পুরুষদের ফেসওয়াশ',               'mens-facewash',            3, 502, 1, 10, 1,1,1, NOW(), NOW()),
  (5041, 'Men''s Shower Gels',           'পুরুষদের শাওয়ার জেল',             'mens-shower-gels',         3, 502, 1, 11, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: PERSONAL CARE > HANDWASH (parent=503) ────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (5051, 'Liquid Handwash',  'তরল হ্যান্ডওয়াশ',  'liquid-handwash',  3, 503, 1, 1, 1,1,1, NOW(), NOW()),
  (5052, 'Hand Sanitizer',   'হ্যান্ড স্যানিটাইজার','hand-sanitizer',  3, 503, 1, 2, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: PERSONAL CARE > ORAL CARE (parent=505) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (5061, 'Toothpastes',         'টুথপেস্ট',               'toothpastes',         3, 505, 1, 1, 1,1,1, NOW(), NOW()),
  (5062, 'Toothbrushes',        'টুথব্রাশ',               'toothbrushes',        3, 505, 1, 2, 1,1,1, NOW(), NOW()),
  (5063, 'Mouthwash & Others',  'মাউথওয়াশ ও অন্যান্য',   'mouthwash-others',    3, 505, 1, 3, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: PERSONAL CARE > SKIN CARE (parent=506) ───────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (5071, 'Soaps',               'সাবান',                   'soaps',               3, 506, 1, 1, 1,1,1, NOW(), NOW()),
  (5072, 'Lotions',             'লোশন',                    'lotions',             3, 506, 1, 2, 1,1,1, NOW(), NOW()),
  (5073, 'Petroleum Jelly',     'পেট্রোলিয়াম জেলি',       'petroleum-jelly',     3, 506, 1, 3, 1,1,1, NOW(), NOW()),
  (5074, 'Creams',              'ক্রিম',                   'creams',              3, 506, 1, 4, 1,1,1, NOW(), NOW()),
  (5075, 'Face Wash & Mask',    'ফেসওয়াশ ও ফেস মাস্ক',   'face-wash-mask',      3, 506, 1, 5, 1,1,1, NOW(), NOW()),
  (5076, 'Body & Hair Oil',     'শরীর ও চুলের তেল',       'body-hair-oil',       3, 506, 1, 6, 1,1,1, NOW(), NOW()),
  (5077, 'Lipsticks & Lip Balm','লিপস্টিক ও লিপ বাম',    'lipsticks-lip-balm',  3, 506, 1, 7, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: BABY CARE > DIAPERS (parent=801) ──────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (8011, 'Medium (5-13kg) Diapers',    'মিডিয়াম (৫-১৩ কেজি) ডায়াপার',    'diapers-medium',   3, 801, 1, 1, 1,1,1, NOW(), NOW()),
  (8012, 'Large (10-16kg) Diapers',    'লার্জ (১০-১৬ কেজি) ডায়াপার',      'diapers-large',    3, 801, 1, 2, 1,1,1, NOW(), NOW()),
  (8013, 'Extra Large (15+kg) Diapers','এক্সট্রা লার্জ (১৫+ কেজি) ডায়াপার','diapers-xl',      3, 801, 1, 3, 1,1,1, NOW(), NOW()),
  (8014, 'Small (3-7kg) Diapers',      'স্মল (৩-৭ কেজি) ডায়াপার',         'diapers-small',    3, 801, 1, 4, 1,1,1, NOW(), NOW()),
  (8015, 'Newborn (2-5kg) Diapers',    'নবজাতক (২-৫ কেজি) ডায়াপার',       'diapers-newborn',  3, 801, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: BABY CARE > BABY FOOD (parent=802) ────────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (8021, 'Milk, Juice & Drinks',     'দুধ, জুস ও পানীয়',         'baby-milk-juice',     3, 802, 1, 1, 1,1,1, NOW(), NOW()),
  (8022, 'Baby & Toddler Food',      'শিশু ও টডলারের খাবার',      'baby-toddler-food',   3, 802, 1, 2, 1,1,1, NOW(), NOW()),
  (8023, 'Formula',                  'ফর্মুলা দুধ',                'baby-formula',        3, 802, 1, 3, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: HOME & KITCHEN > LIGHTS & ELECTRICAL (parent=903) ─────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (9031, 'Lights',               'লাইট',                              'lights',             3, 903, 1, 1, 1,1,1, NOW(), NOW()),
  (9032, 'Mosquito Swatter',      'মশা মারার ব্যাট',                   'mosquito-swatter',   3, 903, 1, 2, 1,1,1, NOW(), NOW()),
  (9033, 'Electric & Multiplug',  'বৈদ্যুতিক সামগ্রী ও মাল্টিপ্লাগ', 'electric-multiplug', 3, 903, 1, 3, 1,1,1, NOW(), NOW()),
  (9034, 'Electronics',           'ইলেকট্রনিক্স',                     'hk-electronics',     3, 903, 1, 4, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: STATIONERY > OFFICE ELECTRONICS (parent=1101) ─────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (6011, 'Batteries',     'ব্যাটারি',     'batteries',     3, 1101, 1, 1, 1,1,1, NOW(), NOW()),
  (6012, 'Calculators',   'ক্যালকুলেটর', 'calculators',   3, 1101, 1, 2, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: STATIONERY > ORGANIZERS (parent=1102) ─────────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (6021, 'Tapes, Glues & Adhesive',   'টেপ, আঠা ও আঠালো সামগ্রী',         'tapes-glues',          3, 1102, 1, 1, 1,1,1, NOW(), NOW()),
  (6022, 'Stapler & Punch',           'স্ট্যাপলার ও পাঞ্চ',                'stapler-punch',        3, 1102, 1, 2, 1,1,1, NOW(), NOW()),
  (6023, 'Organizing Accessories',    'অর্গানাইজিং আনুষঙ্গিক সামগ্রী',   'organizing-accessories',3,1102, 1, 3, 1,1,1, NOW(), NOW()),
  (6024, 'Cutting',                   'কাটিং সরঞ্জাম',                     'cutting-tools',        3, 1102, 1, 4, 1,1,1, NOW(), NOW()),
  (6025, 'Files & Folders',           'ফাইল ও ফোল্ডার',                    'files-folders',        3, 1102, 1, 5, 1,1,1, NOW(), NOW()),
  (6026, 'Measuring Tools',           'পরিমাপের সরঞ্জাম',                   'measuring-tools',      3, 1102, 1, 6, 1,1,1, NOW(), NOW()),
  (6027, 'Desk Organizers',           'ডেস্ক অর্গানাইজার',                  'desk-organizers',      3, 1102, 1, 7, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: STATIONERY > WRITING & PRINTING (parent=1103) ─────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (6031, 'Pens',                       'কলম',                         'pens',                    3, 1103, 1, 1, 1,1,1, NOW(), NOW()),
  (6032, 'Highlighters & Markers',     'হাইলাইটার ও মার্কার',        'highlighters-markers',    3, 1103, 1, 2, 1,1,1, NOW(), NOW()),
  (6033, 'Toner & Ink',                'টোনার ও কালি',               'toner-ink',               3, 1103, 1, 3, 1,1,1, NOW(), NOW()),
  (6034, 'Pencils',                    'পেন্সিল',                    'pencils',                 3, 1103, 1, 4, 1,1,1, NOW(), NOW()),
  (6035, 'Erasers & Correction Fluid', 'রাবার ও কারেকশন ফ্লুইড',    'erasers-correction',      3, 1103, 1, 5, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: STATIONERY > PAPER SUPPLIES (parent=1104) ─────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (6041, 'Printing Paper',      'প্রিন্টিং পেপার',      'printing-paper',    3, 1104, 1, 1, 1,1,1, NOW(), NOW()),
  (6042, 'Diaries & Notebooks', 'ডায়েরি ও নোটবুক',    'diaries-notebooks', 3, 1104, 1, 2, 1,1,1, NOW(), NOW());

-- ─── LEVEL 3: STATIONERY > ARTS & CRAFTS (parent=1106) ──────────────────────
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (6051, 'Color Pencils', 'রঙিন পেন্সিল', 'color-pencils', 3, 1106, 1, 1, 1,1,1, NOW(), NOW());

-- ═══════════════════════════════════════════════════════════════════════════
-- LEVEL 4: WOMEN'S CLOTHING > DRESSES > PAKISTANI SUITS > BRANDS
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO categories (id, name, name_bn, slug, level, parent_id, is_active, sort_order, show_on_menu, show_on_homepage, show_in_search, created_at, updated_at) VALUES
  (7001, 'Adan''s Libas',     'আদান''স লিবাস',      'adans-libas',      4, 3012, 1, 1, 1,1,1, NOW(), NOW()),
  (7002, 'Arham Textile',     'আরহাম টেক্সটাইল',    'arham-textile',    4, 3012, 1, 2, 1,1,1, NOW(), NOW()),
  (7003, 'Binaas',            'বিনাস',               'binaas',           4, 3012, 1, 3, 1,1,1, NOW(), NOW()),
  (7004, 'Charizma',          'কারিজমা',             'charizma',         4, 3012, 1, 4, 1,1,1, NOW(), NOW()),
  (7005, 'Guljee',            'গুলজি',               'guljee',           4, 3012, 1, 5, 1,1,1, NOW(), NOW()),
  (7006, 'Maalhar Textile',   'মালহার টেক্সটাইল',   'maalhar-textile',  4, 3012, 1, 6, 1,1,1, NOW(), NOW()),
  (7007, 'Nur',               'নূর',                 'nur',              4, 3012, 1, 7, 1,1,1, NOW(), NOW()),
  (7008, 'Supreme',           'সুপ্রিম',             'supreme',          4, 3012, 1, 8, 1,1,1, NOW(), NOW()),
  (7009, 'Zebaish',           'জেবাইশ',              'zebaish',          4, 3012, 1, 9, 1,1,1, NOW(), NOW());

-- ─── Reset AUTO_INCREMENT ───────────────────────────────────────────────────
ALTER TABLE categories AUTO_INCREMENT = 10000;

SELECT CONCAT('Total categories: ', COUNT(*)) AS result FROM categories WHERE deleted_at IS NULL;
SELECT CONCAT('  Level 1: ', SUM(level=1)) AS result FROM categories WHERE deleted_at IS NULL
UNION ALL SELECT CONCAT('  Level 2: ', SUM(level=2)) FROM categories WHERE deleted_at IS NULL
UNION ALL SELECT CONCAT('  Level 3: ', SUM(level=3)) FROM categories WHERE deleted_at IS NULL
UNION ALL SELECT CONCAT('  Level 4: ', SUM(level=4)) FROM categories WHERE deleted_at IS NULL;
