const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Helper function to generate SKU
function generateSKU(prefix, index) {
  return `${prefix}-${String(index).padStart(6, '0')}`;
}

const gadgetProducts = [
  // Mobile Accessories
  {
    name: 'Silicone Phone Case',
    categorySlug: 'mobile-accessories',
    brand: 'Generic',
    description: 'Protective silicone phone case with shock absorption and anti-slip grip',
    regularPrice: 250,
    salePrice: 220,
    stock: 100
  },
  {
    name: 'Clear Phone Case',
    categorySlug: 'mobile-accessories',
    brand: 'Generic',
    description: 'Transparent protective case that shows off your phone design',
    regularPrice: 200,
    salePrice: 180,
    stock: 120
  },
  {
    name: 'Tempered Glass Screen Protector',
    categorySlug: 'mobile-accessories',
    brand: 'Generic',
    description: '9H hardness tempered glass screen protector with anti-scratch coating',
    regularPrice: 150,
    salePrice: 120,
    stock: 200
  },
  {
    name: 'Pop Socket Phone Grip',
    categorySlug: 'mobile-accessories',
    brand: 'PopSockets',
    description: 'Collapsible grip and stand for phones and tablets',
    regularPrice: 180,
    stock: 80
  },
  {
    name: 'USB Type-C Cable 2M',
    categorySlug: 'mobile-accessories',
    brand: 'Generic',
    description: 'Fast charging USB-C cable with data transfer support',
    regularPrice: 150,
    salePrice: 125,
    stock: 150
  },
  
  // Audio Devices
  {
    name: 'Wired Earphones',
    categorySlug: 'audio',
    brand: 'Realme',
    description: 'High quality wired earphones with bass boost and microphone',
    regularPrice: 450,
    salePrice: 399,
    stock: 80
  },
  {
    name: 'TWS Wireless Earbuds',
    categorySlug: 'audio',
    brand: 'Xiaomi',
    description: 'True wireless stereo earbuds with charging case and touch controls',
    regularPrice: 2500,
    salePrice: 2200,
    stock: 50
  },
  {
    name: 'Wireless Bluetooth Headphones',
    categorySlug: 'audio',
    brand: 'Sony',
    description: 'Over-ear wireless headphones with active noise cancellation',
    regularPrice: 4500,
    salePrice: 3999,
    stock: 30
  },
  {
    name: 'Bluetooth Portable Speaker',
    categorySlug: 'audio',
    brand: 'JBL',
    description: 'Waterproof portable speaker with 12-hour battery life',
    regularPrice: 3500,
    salePrice: 3200,
    stock: 40
  },
  {
    name: 'Gaming Headset with Mic',
    categorySlug: 'audio',
    brand: 'Razer',
    description: 'Professional gaming headset with surround sound and RGB lighting',
    regularPrice: 5500,
    stock: 25
  },
  
  // Smart Devices
  {
    name: 'Smart Watch Fitness Tracker',
    categorySlug: 'smart-devices',
    brand: 'Xiaomi Mi Band',
    description: 'Fitness tracking smart band with heart rate monitor and sleep tracking',
    regularPrice: 2850,
    salePrice: 2500,
    stock: 60
  },
  {
    name: 'Smart Watch Pro',
    categorySlug: 'smart-devices',
    brand: 'Xiaomi',
    description: 'Feature-rich smartwatch with GPS, heart rate monitor, and app notifications',
    regularPrice: 5500,
    salePrice: 4999,
    stock: 35
  },
  {
    name: 'Smart LED Bulb WiFi',
    categorySlug: 'smart-devices',
    brand: 'Philips Hue',
    description: 'WiFi-enabled color changing LED bulb with app control',
    regularPrice: 1200,
    stock: 70
  },
  {
    name: 'Smart Plug Socket',
    categorySlug: 'smart-devices',
    brand: 'TP-Link',
    description: 'WiFi smart plug with voice control and scheduling',
    regularPrice: 850,
    stock: 90
  },
  
  // Power & Charging
  {
    name: '18W Fast Charger',
    categorySlug: 'mobile-accessories',
    brand: 'Samsung',
    description: 'Quick charge 3.0 fast charging adapter with safety protection',
    regularPrice: 850,
    salePrice: 750,
    stock: 100
  },
  {
    name: 'Type-C 33W Fast Charger',
    categorySlug: 'mobile-accessories',
    brand: 'Realme',
    description: 'Super fast 33W USB Type-C charger with cable included',
    regularPrice: 1200,
    stock: 80
  },
  {
    name: 'Power Bank 10000mAh',
    categorySlug: 'mobile-accessories',
    brand: 'Xiaomi',
    description: 'Slim portable power bank with dual USB ports and fast charging',
    regularPrice: 1450,
    salePrice: 1299,
    stock: 70
  },
  {
    name: 'Power Bank 20000mAh',
    categorySlug: 'mobile-accessories',
    brand: 'Baseus',
    description: 'High capacity power bank with LED display and multiple ports',
    regularPrice: 2650,
    salePrice: 2400,
    stock: 50
  },
  {
    name: 'Wireless Charging Pad',
    categorySlug: 'mobile-accessories',
    brand: 'Samsung',
    description: 'Fast wireless charger compatible with Qi-enabled devices',
    regularPrice: 1800,
    stock: 45
  },
  
  // Computer Accessories
  {
    name: 'Wireless Mouse',
    categorySlug: 'computer-accessories',
    brand: 'Logitech',
    description: 'Ergonomic wireless mouse with silent clicks and long battery life',
    regularPrice: 1200,
    salePrice: 999,
    stock: 60
  },
  {
    name: 'Mechanical Keyboard RGB',
    categorySlug: 'computer-accessories',
    brand: 'Razer',
    description: 'RGB mechanical gaming keyboard with customizable backlighting',
    regularPrice: 6500,
    stock: 30
  },
  {
    name: 'USB Webcam HD',
    categorySlug: 'computer-accessories',
    brand: 'Logitech',
    description: '1080p HD webcam with auto-focus and built-in microphone',
    regularPrice: 3500,
    stock: 40
  },
  {
    name: 'USB Hub 4-Port',
    categorySlug: 'computer-accessories',
    brand: 'Generic',
    description: '4-port USB 3.0 hub with individual on/off switches',
    regularPrice: 650,
    stock: 75
  },
  {
    name: 'Laptop Cooling Pad',
    categorySlug: 'computer-accessories',
    brand: 'Havit',
    description: 'Laptop cooling pad with adjustable height and dual fans',
    regularPrice: 1500,
    stock: 55
  },
  
  // Memory & Storage
  {
    name: 'MicroSD Card 32GB',
    categorySlug: 'computer-accessories',
    brand: 'SanDisk',
    description: 'High-speed microSD card with adapter, Class 10 U1',
    regularPrice: 650,
    salePrice: 599,
    stock: 100
  },
  {
    name: 'MicroSD Card 64GB',
    categorySlug: 'computer-accessories',
    brand: 'SanDisk',
    description: 'Ultra-fast microSD card for cameras and phones',
    regularPrice: 1100,
    stock: 80
  },
  {
    name: 'USB Flash Drive 32GB',
    categorySlug: 'computer-accessories',
    brand: 'SanDisk',
    description: 'Compact USB 3.0 flash drive with high-speed data transfer',
    regularPrice: 550,
    stock: 120
  },
];

async function seedGadgetProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories\n`);
    
    // Create category map
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const [index, productData] of gadgetProducts.entries()) {
      try {
        const categoryId = categoryMap[productData.categorySlug];
        
        if (!categoryId) {
          console.log(`⚠️  Category '${productData.categorySlug}' not found for: ${productData.name}`);
          skippedCount++;
          continue;
        }

        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          slug: createSlug(productData.name) 
        });

        if (existingProduct) {
          console.log(`⏭️  Already exists: ${productData.name}`);
          skippedCount++;
          continue;
        }

        // Create product
        const product = new Product({
          name: productData.name,
          slug: createSlug(productData.name),
          description: productData.description,
          categoryId: categoryId,
          brand: productData.brand,
          regularPrice: productData.regularPrice,
          salePrice: productData.salePrice || null,
          sku: generateSKU('GAD', index + 1),
          stock: productData.stock,
          images: [],
          thumbnail: '',
          status: 'active',
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false,
        });

        await product.save();
        addedCount++;
        console.log(`✅ ${addedCount}. Added: ${productData.name} → ${productData.categorySlug}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error adding ${productData.name}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully added: ${addedCount} gadget products`);
    console.log(`⏭️  Skipped (already exist): ${skippedCount} products`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} products`);
    }
    console.log(`${'='.repeat(60)}\n`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

seedGadgetProducts();
