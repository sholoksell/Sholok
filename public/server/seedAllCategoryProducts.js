const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Comprehensive product data for all categories
const categoryProductsMap = {
  'Vegetables': [
    { name: 'Fresh Tomato', nameBn: 'টমেটো', weight: '1kg', price: 45 },
    { name: 'Green Potato', nameBn: 'আলু', weight: '1kg', price: 35 },
    { name: 'Red Onion', nameBn: 'পেঁয়াজ', weight: '1kg', price: 55 },
    { name: 'Fresh Carrot', nameBn: 'গাজর', weight: '500g', price: 40 },
    { name: 'Green Chili', nameBn: 'কাঁচা মরিচ', weight: '250g', price: 25 },
  ],
  'Fruits': [
    { name: 'Fresh Apple', nameBn: 'আপেল', weight: '4pcs', price: 180 },
    { name: 'Banana', nameBn: 'কলা', weight: '1 dozen', price: 65 },
    { name: 'Orange', nameBn: 'কমলা', weight: '4pcs', price: 120 },
    { name: 'Grapes', nameBn: 'আঙ্গুর', weight: '500g', price: 250 },
    { name: 'Watermelon', nameBn: 'তরমুজ', weight: '1pc', price: 85 },
  ],
  'Meat & Fish': [
    { name: 'Chicken Breast', nameBn: 'মুরগির মাংস', weight: '500g', price: 185 },
    { name: 'Beef', nameBn: 'গরুর মাংস', weight: '500g', price: 420 },
    { name: 'Mutton', nameBn: 'খাসির মাংস', weight: '500g', price: 650 },
    { name: 'Rohu Fish', nameBn: 'রুই মাছ', weight: '1kg', price: 380 },
    { name: 'Hilsa Fish', nameBn: 'ইলিশ মাছ', weight: '1kg', price: 1200 },
  ],
  'Rice': [
    { name: 'Miniket Rice', nameBn: 'মিনিকেট চাল', weight: '5kg', price: 385 },
    { name: 'Basmati Rice', nameBn: 'বাসমতী চাল', weight: '5kg', price: 550 },
    { name: 'Chinigura Rice', nameBn: 'চিনিগুড়া', weight: '2kg', price: 280 },
  ],
  'Snacks': [
    { name: 'Pringles Chips', nameBn: 'প্রিঙ্গলস চিপস', weight: '165g', price: 295 },
    { name: 'Lays Chips', nameBn: 'লেইজ চিপস', weight: '52g', price: 20 },
    { name: 'Chocolate Wafer', nameBn: 'চকলেট ওয়েফার', weight: '150g', price: 85 },
    { name: 'Biscuits Pack', nameBn: 'বিস্কুট প্যাক', weight: '200g', price: 65 },
  ],
  'Beverages': [
    { name: 'Coca Cola', nameBn: 'কোকা কোলা', weight: '2L', price: 95 },
    { name: 'Sprite', nameBn: 'স্প্রাইট', weight: '2L', price: 95 },
    { name: 'Mango Juice', nameBn: 'আমের জুস', weight: '1L', price: 185 },
    { name: 'Mineral Water', nameBn: 'মিনারেল ওয়াটার', weight: '2L', price: 30 },
  ],
  'Cooking Oil': [
    { name: 'Soybean Oil', nameBn: 'সয়াবিন তেল', weight: '5L', price: 685 },
    { name: 'Mustard Oil', nameBn: 'সরিষার তেল', weight: '1L', price: 185 },
    { name: 'Olive Oil', nameBn: 'অলিভ অয়েল', weight: '500ml', price: 495 },
  ],
  'Food': [
    { name: 'Bread Loaf', nameBn: 'পাউরুটি', weight: '400g', price: 55 },
    { name: 'Salt', nameBn: 'লবণ', weight: '1kg', price: 25 },
    { name: 'Sugar', nameBn: 'চিনি', weight: '1kg', price: 75 },
    { name: 'Flour', nameBn: 'আটা', weight: '2kg', price: 95 },
  ],
  'Baby Food & Care': [
    { name: 'Baby Wipes Gentle', nameBn: 'বেবি ওয়াইপস', weight: '72pcs', price: 285 },
    { name: 'Baby Cerelac', nameBn: 'বেবি সেরিলাক', weight: '400g', price: 345 },
    { name: 'Baby Shampoo', nameBn: 'বেবি শ্যাম্পু', weight: '200ml', price: 195 },
  ],
  'Home Cleaning': [
    { name: 'Dish Wash Liquid', nameBn: 'ডিশ ওয়াশ', weight: '500ml', price: 125 },
    { name: 'Floor Cleaner', nameBn: 'ফ্লোর ক্লিনার', weight: '1L', price: 185 },
    { name: 'Toilet Cleaner', nameBn: 'টয়লেট ক্লিনার', weight: '500ml', price: 145 },
  ],
  'Beauty & Health': [
    { name: 'Shampoo', nameBn: 'শ্যাম্পু', weight: '400ml', price: 285 },
    { name: 'Toothpaste', nameBn: 'টুথপেস্ট', weight: '100g', price: 85 },
    { name: 'Hand Soap', nameBn: 'হ্যান্ড সোপ', weight: '200ml', price: 95 },
  ],
  'Fashion & Lifestyle': [
    { name: 'Cotton T-Shirt', nameBn: 'টি-শার্ট', weight: '1pc', price: 495 },
    { name: 'Sunglasses', nameBn: 'সানগ্লাস', weight: '1pc', price: 385 },
  ],
  'Home & Kitchen': [
    { name: 'Kitchen Knife Set', nameBn: 'ছুরি সেট', weight: '3pcs', price: 685 },
    { name: 'Cutting Board', nameBn: 'কাটিং বোর্ড', weight: '1pc', price: 295 },
    { name: 'Cooking Pot', nameBn: 'রান্নার হাঁড়ি', weight: '1pc', price: 895 },
  ],
  'Stationeries': [
    { name: 'Notebook Set', nameBn: 'নোটবুক সেট', weight: '5pcs', price: 285 },
    { name: 'Pen Pack', nameBn: 'কলমের প্যাক', weight: '10pcs', price: 95 },
  ],
  'Toys & Sports': [
    { name: 'Football', nameBn: 'ফুটবল', weight: '1pc', price: 685 },
    { name: 'Cricket Bat', nameBn: 'ক্রিকেট ব্যাট', weight: '1pc', price: 1285 },
  ],
  'Gadget': [
    { name: 'Phone Charger', nameBn: 'ফোন চার্জার', weight: '1pc', price: 385 },
    { name: 'USB Cable', nameBn: 'ইউএসবি কেবল', weight: '1pc', price: 185 },
    { name: 'Power Bank', nameBn: 'পাওয়ার ব্যাংক', weight: '1pc', price: 985 },
  ],
  'Pet Care': [
    { name: 'Pet Food', nameBn: 'পোষা প্রাণীর খাবার', weight: '1kg', price: 485 },
    { name: 'Pet Shampoo', nameBn: 'পোষা প্রাণীর শ্যাম্পু', weight: '200ml', price: 295 },
  ]
};

async function seedProductsForAllCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const categories = await Category.find({ isActive: true }).lean();
    let totalAdded = 0;

    for (const category of categories) {
      const existingCount = await Product.countDocuments({ categoryId: category._id });
      
      if (existingCount > 0) {
        console.log(`⏭️  ${category.name}: Already has ${existingCount} products, skipping`);
        continue;
      }

      // Try to find matching products for this category
      const categoryProducts = categoryProductsMap[category.name];
      
      if (!categoryProducts) {
        console.log(`⚠️  ${category.name}: No seed data available`);
        continue;
      }

      console.log(`\n🌱 Seeding ${category.name}...`);

      for (const productData of categoryProducts) {
        const slug = createSlug(`${productData.name}-${productData.weight}`);
        const sku = `PRD-${String(Date.now()).slice(-8)}`;

        const product = new Product({
          name: productData.name,
          nameBn: productData.nameBn,
          slug: slug,
          description: `High quality ${productData.name}`,
          descriptionBn: `উচ্চ মানের ${productData.nameBn}`,
          categoryId: category._id,
          regularPrice: productData.price,
          salePrice: null,
          sku: sku,
          stock: Math.floor(Math.random() * 100) + 50,
          images: [productData.image],
          thumbnail: productData.image,
          weight: productData.weight,
          unit: 'piece',
          tags: [category.name],
          isFeatured: Math.random() > 0.7,
          isNewArrival: Math.random() > 0.8,
          isBestSeller: Math.random() > 0.75,
          status: 'active',
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 50) + 5
        });

        await product.save();
        console.log(`   ✅ Added: ${productData.name}`);
        totalAdded++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Seeding complete! Added ${totalAdded} products`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

seedProductsForAllCategories();
