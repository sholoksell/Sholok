const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to generate SKU
function generateSKU(categoryName, productName, index) {
  const catPrefix = categoryName.substring(0, 3).toUpperCase();
  const prodPrefix = productName.substring(0, 3).toUpperCase();
  const num = String(index).padStart(4, '0');
  return `${catPrefix}-${prodPrefix}-${num}`;
}

// Comprehensive product data with real-world product information
const productTemplates = {
  'Rice': [
    { name: 'Miniket Rice', brand: 'Fresh', weight: '1kg', price: 65, description: 'Premium quality Miniket rice, perfect for daily meals', unit: 'kg' },
    { name: 'Miniket Rice', brand: 'Fresh', weight: '5kg', price: 310, description: 'Premium quality Miniket rice, perfect for daily meals', unit: 'kg' },
    { name: 'Najirshail Rice', brand: 'Golden', weight: '1kg', price: 75, description: 'Aromatic Najirshail rice with excellent taste', unit: 'kg' },
    { name: 'Basmati Rice', brand: 'Premium', weight: '1kg', price: 145, description: 'Long grain Basmati rice, ideal for special occasions', unit: 'kg' },
    { name: 'Brown Rice', brand: 'Healthy', weight: '1kg', price: 95, description: 'Nutritious brown rice rich in fiber', unit: 'kg' },
    { name: 'Chinigura Rice', brand: 'Traditional', weight: '500g', price: 180, description: 'Aromatic Chinigura rice, perfect for polao and biriyani', unit: 'kg' }
  ],
  'Potato': [
    { name: 'Fresh Potato', brand: 'Farm Fresh', weight: '1kg', price: 35, description: 'Fresh locally grown potatoes', unit: 'kg' },
    { name: 'Fresh Potato', brand: 'Farm Fresh', weight: '2kg', price: 68, description: 'Fresh locally grown potatoes', unit: 'kg' },
    { name: 'Fresh Potato', brand: 'Farm Fresh', weight: '5kg', price: 165, description: 'Fresh locally grown potatoes', unit: 'kg' }
  ],
  'Onion': [
    { name: 'Red Onion', brand: 'Fresh', weight: '1kg', price: 45, description: 'Fresh red onions for cooking', unit: 'kg' },
    { name: 'Red Onion', brand: 'Fresh', weight: '2kg', price: 88, description: 'Fresh red onions for cooking', unit: 'kg' },
    { name: 'White Onion', brand: 'Fresh', weight: '1kg', price: 50, description: 'Fresh white onions, mild flavor', unit: 'kg' }
  ],
  'Tomato': [
    { name: 'Fresh Tomato', brand: 'Farm Fresh', weight: '500g', price: 30, description: 'Fresh ripe tomatoes', unit: 'kg' },
    { name: 'Fresh Tomato', brand: 'Farm Fresh', weight: '1kg', price: 55, description: 'Fresh ripe tomatoes', unit: 'kg' },
    { name: 'Cherry Tomato', brand: 'Premium', weight: '250g', price: 60, description: 'Sweet cherry tomatoes', unit: 'kg' }
  ],
  'Banana': [
    { name: 'Ripe Banana', brand: 'Fresh', weight: '1 dozen', price: 50, description: 'Fresh ripe bananas', unit: 'dozen' },
    { name: 'Green Banana', brand: 'Fresh', weight: '1kg', price: 40, description: 'Fresh green cooking bananas', unit: 'kg' },
    { name: 'Sagor Banana', brand: 'Premium', weight: '1 dozen', price: 65, description: 'Premium Sagor bananas', unit: 'dozen' }
  ],
  'Apple': [
    { name: 'Red Apple', brand: 'Imported', weight: '1kg', price: 220, description: 'Fresh imported red apples', unit: 'kg' },
    { name: 'Green Apple', brand: 'Imported', weight: '1kg', price: 240, description: 'Fresh imported green apples', unit: 'kg' },
    { name: 'Fuji Apple', brand: 'Premium', weight: '500g', price: 145, description: 'Premium Fuji apples', unit: 'kg' }
  ],
  'Orange': [
    { name: 'Malta Orange', brand: 'Fresh', weight: '1kg', price: 120, description: 'Fresh Malta oranges', unit: 'kg' },
    { name: 'Mandarin Orange', brand: 'Imported', weight: '1kg', price: 180, description: 'Sweet mandarin oranges', unit: 'kg' },
    { name: 'Valencia Orange', brand: 'Premium', weight: '1kg', price: 160, description: 'Juicy Valencia oranges', unit: 'kg' }
  ],
  'Milk': [
    { name: 'Fresh Milk', brand: 'Milk Vita', weight: '1L', price: 65, description: 'Fresh full cream milk', unit: 'L' },
    { name: 'UHT Milk', brand: 'Aarong', weight: '1L', price: 95, description: 'Long life UHT milk', unit: 'L' },
    { name: 'Powder Milk', brand: 'Dano', weight: '400g', price: 395, description: 'Full cream powder milk', unit: 'g' },
    { name: 'Low Fat Milk', brand: 'Milk Vita', weight: '1L', price: 72, description: 'Low fat fresh milk', unit: 'L' }
  ],
  'Broiler Chicken': [
    { name: 'Whole Chicken', brand: 'Fresh', weight: '1kg', price: 180, description: 'Fresh broiler chicken', unit: 'kg' },
    { name: 'Chicken Breast', brand: 'Premium', weight: '500g', price: 145, description: 'Boneless chicken breast', unit: 'kg' },
    { name: 'Chicken Drumstick', brand: 'Fresh', weight: '500g', price: 110, description: 'Fresh chicken drumsticks', unit: 'kg' },
    { name: 'Chicken Wings', brand: 'Fresh', weight: '500g', price: 95, description: 'Fresh chicken wings', unit: 'kg' }
  ],
  'Brown Eggs': [
    { name: 'Brown Eggs', brand: 'Fresh', weight: '6 pcs', price: 65, description: 'Fresh brown eggs', unit: 'pcs' },
    { name: 'Brown Eggs', brand: 'Fresh', weight: '12 pcs', price: 125, description: 'Fresh brown eggs', unit: 'pcs' },
    { name: 'Organic Brown Eggs', brand: 'Premium', weight: '6 pcs', price: 85, description: 'Organic free-range brown eggs', unit: 'pcs' }
  ],
  'Soybean Oil': [
    { name: 'Soybean Oil', brand: 'Teer', weight: '1L', price: 135, description: 'Pure soybean cooking oil', unit: 'L' },
    { name: 'Soybean Oil', brand: 'Teer', weight: '2L', price: 265, description: 'Pure soybean cooking oil', unit: 'L' },
    { name: 'Soybean Oil', brand: 'Fresh', weight: '5L', price: 645, description: 'Pure soybean cooking oil', unit: 'L' }
  ],
  'Mustard Oil': [
    { name: 'Mustard Oil', brand: 'Radhuni', weight: '1L', price: 195, description: 'Pure mustard cooking oil', unit: 'L' },
    { name: 'Mustard Oil', brand: 'Teer', weight: '500ml', price: 105, description: 'Pure mustard cooking oil', unit: 'L' }
  ],
  'White Sugar': [
    { name: 'White Sugar', brand: 'Fresh', weight: '1kg', price: 85, description: 'Pure white refined sugar', unit: 'kg' },
    { name: 'White Sugar', brand: 'Fresh', weight: '2kg', price: 168, description: 'Pure white refined sugar', unit: 'kg' }
  ],
  'Table Salt': [
    { name: 'Iodized Salt', brand: 'ACI', weight: '1kg', price: 35, description: 'Iodized table salt', unit: 'kg' },
    { name: 'Pink Salt', brand: 'Himalayan', weight: '500g', price: 175, description: 'Pure Himalayan pink salt', unit: 'g' }
  ],
  'Instant Noodles': [
    { name: 'Instant Noodles', brand: 'Maggi', weight: '280g', price: 40, description: 'Quick cook instant noodles', unit: 'g' },
    { name: 'Cup Noodles', brand: 'Top Ramen', weight: '65g', price: 25, description: 'Instant cup noodles', unit: 'g' },
    { name: 'Korean Noodles', brand: 'Samyang', weight: '140g', price: 85, description: 'Spicy Korean instant noodles', unit: 'g' }
  ],
  'Tomato Ketchup': [
    { name: 'Tomato Ketchup', brand: 'Pran', weight: '500g', price: 95, description: 'Delicious tomato ketchup', unit: 'g' },
    { name: 'Tomato Ketchup', brand: 'ACI', weight: '1kg', price: 175, description: 'Delicious tomato ketchup', unit: 'g' }
  ],
  'Chili Sauce': [
    { name: 'Chili Sauce', brand: 'Pran', weight: '340g', price: 85, description: 'Hot and spicy chili sauce', unit: 'g' },
    { name: 'Sweet Chili Sauce', brand: 'Ruchi', weight: '340g', price: 95, description: 'Sweet Thai chili sauce', unit: 'g' }
  ],
  'Butter': [
    { name: 'Butter', brand: 'Arla', weight: '200g', price: 295, description: 'Fresh dairy butter', unit: 'g' },
    { name: 'Salted Butter', brand: 'Milk Vita', weight: '200g', price: 245, description: 'Salted dairy butter', unit: 'g' }
  ],
  'Ghee': [
    { name: 'Pure Ghee', brand: 'Radhuni', weight: '500ml', price: 495, description: 'Pure cow ghee', unit: 'ml' },
    { name: 'Pure Ghee', brand: 'Fresh', weight: '1L', price: 945, description: 'Pure cow ghee', unit: 'ml' }
  ],
  'Vanilla Ice Cream': [
    { name: 'Vanilla Ice Cream', brand: 'Igloo', weight: '1L', price: 295, description: 'Creamy vanilla ice cream', unit: 'L' },
    { name: 'Vanilla Ice Cream', brand: 'Polar', weight: '500ml', price: 165, description: 'Creamy vanilla ice cream', unit: 'ml' }
  ],
  'Chocolate Ice Cream': [
    { name: 'Chocolate Ice Cream', brand: 'Igloo', weight: '1L', price: 315, description: 'Rich chocolate ice cream', unit: 'L' },
    { name: 'Belgian Chocolate Ice Cream', brand: 'Polar', weight: '1L', price: 395, description: 'Premium Belgian chocolate ice cream', unit: 'L' }
  ],
  'Cola': [
    { name: 'Coca Cola', brand: 'Coca Cola', weight: '250ml', price: 25, description: 'Original Coca Cola', unit: 'ml' },
    { name: 'Coca Cola', brand: 'Coca Cola', weight: '500ml', price: 40, description: 'Original Coca Cola', unit: 'ml' },
    { name: 'Coca Cola', brand: 'Coca Cola', weight: '1.25L', price: 75, description: 'Original Coca Cola', unit: 'L' },
    { name: 'Pepsi', brand: 'Pepsi', weight: '500ml', price: 40, description: 'Pepsi cola drink', unit: 'ml' }
  ],
  'Mango Juice': [
    { name: 'Mango Juice', brand: 'Pran', weight: '250ml', price: 30, description: 'Fresh mango juice', unit: 'ml' },
    { name: 'Mango Juice', brand: 'Shezan', weight: '1L', price: 95, description: 'Fresh mango juice', unit: 'L' },
    { name: 'Mango Frooto', brand: 'Pran', weight: '250ml', price: 35, description: 'Mango flavored drink', unit: 'ml' }
  ],
  'Black Tea': [
    { name: 'Black Tea', brand: 'Ispahani', weight: '200g', price: 140, description: 'Premium black tea leaves', unit: 'g' },
    { name: 'Black Tea', brand: 'Finlay', weight: '400g', price: 265, description: 'Premium black tea leaves', unit: 'g' }
  ],
  'Green Tea': [
    { name: 'Green Tea', brand: 'Lipton', weight: '25 bags', price: 195, description: 'Pure green tea bags', unit: 'bags' },
    { name: 'Tulsi Green Tea', brand: 'Typhoo', weight: '25 bags', price: 245, description: 'Green tea with tulsi', unit: 'bags' }
  ],
  'Instant Coffee': [
    { name: 'Instant Coffee', brand: 'Nescafe', weight: '50g', price: 245, description: 'Classic instant coffee', unit: 'g' },
    { name: '3-in-1 Coffee', brand: 'Nescafe', weight: '20 sticks', price: 195, description: 'Coffee with milk and sugar', unit: 'sticks' }
  ],
  'Cream Biscuits': [
    { name: 'Olympic Biscuit', brand: 'Olympic', weight: '300g', price: 75, description: 'Cream filled biscuits', unit: 'g' },
    { name: 'Lexus Biscuit', brand: 'Pran', weight: '300g', price: 70, description: 'Chocolate cream biscuits', unit: 'g' }
  ],
  'Potato Chips': [
    { name: 'Potato Chips', brand: 'Pringles', weight: '107g', price: 195, description: 'Crispy potato chips', unit: 'g' },
    { name: 'Potato Crackers', brand: 'Pran', weight: '25g', price: 10, description: 'Spicy potato crackers', unit: 'g' },
    { name: 'Masala Chips', brand: 'Mr. Twist', weight: '100g', price: 60, description: 'Masala flavored chips', unit: 'g' }
  ],
  'Milk Chocolate': [
    { name: 'Dairy Milk', brand: 'Cadbury', weight: '38g', price: 65, description: 'Smooth milk chocolate', unit: 'g' },
    { name: 'KitKat', brand: 'Nestle', weight: '41.5g', price: 55, description: 'Crispy wafer chocolate', unit: 'g' },
    { name: 'Snickers', brand: 'Mars', weight: '50g', price: 75, description: 'Chocolate with peanuts', unit: 'g' }
  ],
  'Beauty Soap': [
    { name: 'Lux Soap', brand: 'Lux', weight: '100g', price: 45, description: 'Beauty soap with fragrance', unit: 'g' },
    { name: 'Dettol Soap', brand: 'Dettol', weight: '100g', price: 50, description: 'Antibacterial soap', unit: 'g' },
    { name: 'Dove Soap', brand: 'Dove', weight: '100g', price: 85, description: 'Moisturizing beauty bar', unit: 'g' }
  ],
  'Anti-Dandruff Shampoo': [
    { name: 'Head & Shoulders', brand: 'Head & Shoulders', weight: '180ml', price: 245, description: 'Anti-dandruff shampoo', unit: 'ml' },
    { name: 'Clear Shampoo', brand: 'Clear', weight: '180ml', price: 215, description: 'Anti-dandruff shampoo for men', unit: 'ml' }
  ],
  'Fluoride Toothpaste': [
    { name: 'Pepsodent Toothpaste', brand: 'Pepsodent', weight: '200g', price: 145, description: 'Fluoride toothpaste', unit: 'g' },
    { name: 'Colgate Toothpaste', brand: 'Colgate', weight: '200g', price: 155, description: 'Complete care toothpaste', unit: 'g' },
    { name: 'Sensodyne Toothpaste', brand: 'Sensodyne', weight: '100g', price: 265, description: 'For sensitive teeth', unit: 'g' }
  ],
  'Cerelac': [
    { name: 'Cerelac Rice', brand: 'Nestle', weight: '350g', price: 325, description: 'Baby cereal with rice', unit: 'g' },
    { name: 'Cerelac Wheat', brand: 'Nestle', weight: '350g', price: 335, description: 'Baby cereal with wheat', unit: 'g' }
  ],
  'Newborn Diapers': [
    { name: 'Pampers Newborn', brand: 'Pampers', weight: '22 pcs', price: 395, description: 'Soft diapers for newborns', unit: 'pcs' },
    { name: 'Huggies Newborn', brand: 'Huggies', weight: '20 pcs', price: 385, description: 'Comfortable newborn diapers', unit: 'pcs' }
  ],
  'Wet Wipes': [
    { name: 'Baby Wipes', brand: 'Johnson\'s', weight: '80 pcs', price: 195, description: 'Gentle baby wipes', unit: 'pcs' },
    { name: 'Wet Wipes', brand: 'Pampers', weight: '64 pcs', price: 165, description: 'Soft cleaning wipes', unit: 'pcs' }
  ],
  'Dishwashing Liquid': [
    { name: 'Vim Liquid', brand: 'Vim', weight: '500ml', price: 95, description: 'Dishwashing liquid', unit: 'ml' },
    { name: 'Pril Liquid', brand: 'Pril', weight: '500ml', price: 105, description: 'Powerful dishwashing liquid', unit: 'ml' }
  ],
  'Washing Powder': [
    { name: 'Wheel Powder', brand: 'Wheel', weight: '1kg', price: 165, description: 'Washing detergent powder', unit: 'kg' },
    { name: 'Surf Excel', brand: 'Surf Excel', weight: '1kg', price: 195, description: 'Premium washing powder', unit: 'kg' }
  ],
  'Facial Tissue': [
    { name: 'Facial Tissue', brand: 'Fresh', weight: '200 sheets', price: 75, description: 'Soft facial tissues', unit: 'sheets' },
    { name: 'Premium Tissue', brand: 'Bashundhara', weight: '150 sheets', price: 95, description: 'Premium soft tissues', unit: 'sheets' }
  ],
  'Toilet Tissue': [
    { name: 'Toilet Paper', brand: 'Bashundhara', weight: '4 rolls', price: 145, description: 'Soft toilet tissue', unit: 'rolls' },
    { name: 'Premium Toilet Paper', brand: 'Fresh', weight: '6 rolls', price: 210, description: 'Premium soft toilet paper', unit: 'rolls' }
  ],
  'Phone Cases': [
    { name: 'Silicone Phone Case', brand: 'Generic', weight: '1 pc', price: 250, description: 'Protective silicone case', unit: 'pc' },
    { name: 'Clear Phone Case', brand: 'Generic', weight: '1 pc', price: 200, description: 'Transparent protective case', unit: 'pc' }
  ],
  'Earphones': [
    { name: 'Wired Earphones', brand: 'Realme', weight: '1 pc', price: 450, description: 'High quality earphones', unit: 'pc' },
    { name: 'TWS Earbuds', brand: 'Xiaomi', weight: '1 pc', price: 2500, description: 'True wireless earbuds', unit: 'pc' }
  ],
  'Fast Charger': [
    { name: 'Fast Charger 18W', brand: 'Samsung', weight: '1 pc', price: 850, description: 'Fast charging adapter', unit: 'pc' },
    { name: 'Type-C Charger', brand: 'Realme', weight: '1 pc', price: 750, description: 'USB Type-C charger', unit: 'pc' }
  ],
  '10000mAh': [
    { name: 'Power Bank 10000mAh', brand: 'Xiaomi', weight: '1 pc', price: 1450, description: 'Portable power bank', unit: 'pc' },
    { name: 'Power Bank 10000mAh', brand: 'Baseus', weight: '1 pc', price: 1650, description: 'Fast charging power bank', unit: 'pc' }
  ]
};

async function seedProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products\n');

    // Fetch all categories
    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    // Create category map for quick lookup
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat;
      categoryMap[cat.slug] = cat;
    });

    let totalProductsCreated = 0;
    let productIndex = 1;

    console.log('🌱 Starting product seeding...\n');

    // Iterate through each category in productTemplates
    for (const [categoryName, products] of Object.entries(productTemplates)) {
      const category = categoryMap[categoryName];
      
      if (!category) {
        console.log(`⚠️  Category "${categoryName}" not found in database, skipping...`);
        continue;
      }

      console.log(`📦 Creating products for: ${categoryName}`);

      for (const [index, productData] of products.entries()) {
        try {
          const slug = createSlug(productData.name + '-' + productData.weight + '-' + productData.brand);
          const sku = generateSKU(categoryName, productData.name, productIndex);

          // Determine if product is featured/new arrival randomly
          const isFeatured = Math.random() > 0.7;
          const isNewArrival = Math.random() > 0.8;
          const isBestSeller = Math.random() > 0.75;

          // Random stock between 50 to 500
          const stock = Math.floor(Math.random() * 450) + 50;

          // Calculate sale price (10-30% off for some products)
          let salePrice = null;
          if (Math.random() > 0.6) {
            const discount = Math.floor(Math.random() * 20) + 10; // 10-30% off
            salePrice = Math.round(productData.price * (100 - discount) / 100);
          }

          const product = new Product({
            name: productData.name,
            nameBn: productData.name, // In real scenario, add Bangla translation
            slug: slug,
            description: productData.description,
            descriptionBn: productData.description,
            shortDescription: `${productData.name} - ${productData.weight}`,
            categoryId: category._id,
            regularPrice: productData.price,
            salePrice: salePrice,
            sku: sku,
            stock: stock,
            images: [],
            thumbnail: '',
            brand: productData.brand,
            unit: productData.unit,
            weight: productData.weight,
            tags: [category.name, productData.brand, productData.unit],
            isFeatured: isFeatured,
            isNewArrival: isNewArrival,
            isBestSeller: isBestSeller,
            status: stock > 0 ? 'active' : 'out_of_stock',
            rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
            reviewCount: Math.floor(Math.random() * 100),
            soldCount: Math.floor(Math.random() * 500)
          });

          await product.save();
          totalProductsCreated++;
          productIndex++;
          console.log(`  ✅ ${productData.name} (${productData.weight})`);

        } catch (error) {
          console.error(`  ❌ Error creating product: ${error.message}`);
        }
      }

      console.log('');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Product seed completed successfully!');
    console.log('📊 Total products created:', totalProductsCreated);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed
seedProducts();
