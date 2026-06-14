const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Helper function to create slug
function createSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Snacks & Sweets products to add
const snackProducts = [
  // Chips & Crisps
  { name: 'Lays Classic Salted', categoryPattern: /snacks/i, brand: 'Lays', weight: '52g', price: 30, description: 'Classic salted potato chips' },
  { name: 'Lays Magic Masala', categoryPattern: /snacks/i, brand: 'Lays', weight: '52g', price: 30, description: 'Spicy masala potato chips' },
  { name: 'Pringles Original', categoryPattern: /snacks/i, brand: 'Pringles', weight: '107g', price: 185, description: 'Original flavor stacked chips' },
  { name: 'Kurkure Masala Munch', categoryPattern: /snacks/i, brand: 'Kurkure', weight: '55g', price: 20, description: 'Crunchy masala snack' },
  { name: 'Cheetos Cheddar', categoryPattern: /snacks/i, brand: 'Cheetos', weight: '38g', price: 35, description: 'Cheesy cheddar puffs' },
  { name: 'Mister Potato Chips', categoryPattern: /snacks/i, brand: 'Mister Potato', weight: '75g', price: 45, description: 'BBQ flavored chips' },
  
  // Biscuits & Cookies
  { name: 'Oreo Original Cookies', categoryPattern: /biscuit.*cookie/i, brand: 'Oreo', weight: '133g', price: 70, description: 'Classic chocolate sandwich cookies' },
  { name: 'Oreo Strawberry', categoryPattern: /biscuit.*cookie/i, brand: 'Oreo', weight: '133g', price: 75, description: 'Strawberry cream cookies' },
  { name: 'Good Day Butter Cookies', categoryPattern: /biscuit.*cookie/i, brand: 'Britannia', weight: '216g', price: 65, description: 'Rich butter cookies' },
  { name: 'Hide & Seek Biscuits', categoryPattern: /biscuit.*cookie/i, brand: 'Parle', weight: '100g', price: 35, description: 'Chocolate chip cookies' },
  { name: 'Marie Biscuits', categoryPattern: /biscuit.*cookie/i, brand: 'LU', weight: '250g', price: 45, description: 'Light tea biscuits' },
  { name: 'Digestive Biscuits', categoryPattern: /biscuit.*cookie/i, brand: 'McVities', weight: '200g', price: 85, description: 'Healthy digestive biscuits' },
  { name: 'Coconut Cookies', categoryPattern: /biscuit.*cookie/i, brand: 'Pran', weight: '350g', price: 125, description: 'Coconut flavored cookies' },
  { name: 'Butter Cream Biscuits', categoryPattern: /biscuit.*cookie/i, brand: 'Pran', weight: '300g', price: 95, description: 'Cream filled butter biscuits' },
  
  // Chocolates & Candies
  { name: 'Dairy Milk Chocolate', categoryPattern: /snacks/i, brand: 'Cadbury', weight: '38g', price: 65, description: 'Classic milk chocolate bar' },
  { name: 'KitKat Chocolate', categoryPattern: /snacks/i, brand: 'Nestle', weight: '41.5g', price: 55, description: 'Crispy wafer chocolate' },
  { name: 'Snickers Bar', categoryPattern: /snacks/i, brand: 'Snickers', weight: '50g', price: 75, description: 'Peanut caramel chocolate' },
  { name: 'Mars Bar', categoryPattern: /snacks/i, brand: 'Mars', weight: '51g', price: 70, description: 'Caramel nougat chocolate' },
  { name: 'Ferrero Rocher', categoryPattern: /snacks/i, brand: 'Ferrero', weight: '3 pcs', price: 195, description: 'Premium hazelnut chocolate' },
  { name: 'M&Ms Chocolate', categoryPattern: /snacks/i, brand: 'M&Ms', weight: '45g', price: 85, description: 'Colorful chocolate candies' },
  
  // Sweet Snacks & Wafers
  { name: 'Wafer Rolls Chocolate', categoryPattern: /snacks/i, brand: 'Pran', weight: '200g', price: 75, description: 'Chocolate cream wafer rolls' },
  { name: 'Wafer Sticks Vanilla', categoryPattern: /snacks/i, brand: 'Pran', weight: '250g', price: 85, description: 'Vanilla cream wafer sticks' },
  { name: 'Jelly Candy Mix', categoryPattern: /snacks/i, brand: 'Pran', weight: '200g', price: 65, description: 'Mixed fruit jelly candies' },
  { name: 'Toffee Assorted', categoryPattern: /snacks/i, brand: 'Pran', weight: '150g', price: 55, description: 'Assorted toffee flavors' },
  
  // Traditional Sweets
  { name: 'Rasgulla Sweet', categoryPattern: /snacks/i, brand: 'Aarong', weight: '500g', price: 245, description: 'Traditional Bengali sweet' },
  { name: 'Gulab Jamun', categoryPattern: /snacks/i, brand: 'Pran', weight: '1kg', price: 385, description: 'Sweet syrup-soaked balls' },
  { name: 'Mixed Sweets Box', categoryPattern: /snacks/i, brand: 'Aarong', weight: '500g', price: 395, description: 'Assorted traditional sweets' },
  
  // Cakes & Pastries
  { name: 'Pound Cake Vanilla', categoryPattern: /cake/i, brand: 'Well Food', weight: '250g', price: 145, description: 'Soft vanilla pound cake' },
  { name: 'Chocolate Cupcake', categoryPattern: /cake/i, brand: 'Well Food', weight: '4 pcs', price: 180, description: 'Rich chocolate cupcakes' },
  { name: 'Muffin Blueberry', categoryPattern: /cake/i, brand: 'Well Food', weight: '4 pcs', price: 195, description: 'Fresh blueberry muffins' }
];

async function seedSnackProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching categories from database...');
    const allCategories = await Category.find({ isActive: true }).lean();
    console.log(`✅ Found ${allCategories.length} categories\n`);

    let totalProductsCreated = 0;
    let totalProductsSkipped = 0;
    console.log('🌱 Starting snack product seeding...\n');

    // Process each product
    for (const [index, productData] of snackProducts.entries()) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          console.log(`⏭️  Skipped (already exists): ${productData.name}`);
          totalProductsSkipped++;
          continue;
        }

        // Find matching category using pattern
        const category = allCategories.find(cat => 
          productData.categoryPattern.test(cat.name) || 
          productData.categoryPattern.test(cat.slug)
        );

        if (!category) {
          console.log(`⚠️  No category match for: ${productData.name}`);
          continue;
        }

        const slug = createSlug(`${productData.name}-${productData.weight}-${productData.brand}`);
        const sku = `SNACK-${String(Date.now() + index).slice(-6)}`;

        // Randomize some properties
        const isFeatured = Math.random() > 0.6;
        const isNewArrival = Math.random() > 0.7;
        const isBestSeller = Math.random() > 0.6;
        const stock = Math.floor(Math.random() * 500) + 100;

        // Calculate sale price (random discount for some products)
        let salePrice = null;
        if (Math.random() > 0.5) {
          const discount = Math.floor(Math.random() * 20) + 5;
          salePrice = Math.round(productData.price * (100 - discount) / 100);
        }

        const product = new Product({
          name: productData.name,
          nameBn: productData.name,
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
          unit: 'pcs',
          weight: productData.weight,
          tags: [category.name, productData.brand, 'snack', 'sweet'],
          isFeatured: isFeatured,
          isNewArrival: isNewArrival,
          isBestSeller: isBestSeller,
          status: stock > 0 ? 'active' : 'out_of_stock',
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          reviewCount: Math.floor(Math.random() * 120) + 20,
          soldCount: Math.floor(Math.random() * 600) + 80
        });

        await product.save();
        totalProductsCreated++;
        console.log(`✅ [${totalProductsCreated}] ${productData.name} → ${category.name}`);

      } catch (error) {
        console.error(`❌ Error creating product ${productData.name}: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Snack product seed completed successfully!');
    console.log('📊 Total products created:', totalProductsCreated);
    console.log('⏭️  Total products skipped:', totalProductsSkipped);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

seedSnackProducts();
