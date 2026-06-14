const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Comprehensive product image mapping with appropriate, specific images
const productImageMapping = {
  // Rice & Grains
  'rice': '',
  'miniket': '',
  'najirshail': '',
  'basmati': '',
  'brown rice': '',
  'chinigura': '',
  
  // Vegetables
  'potato': '',
  'onion': '',
  'tomato': '',
  'carrot': '',
  'cabbage': '',
  'cauliflower': '',
  'brinjal': '',
  'eggplant': '',
  'green chili': '',
  'cucumber': '',
  'pepper': '',
  'beans': '',
  'spinach': '',
  'lettuce': '',
  
  // Fruits
  'banana': '',
  'apple': '',
  'green apple': '',
  'orange': '',
  'malta': '',
  'grapes': '',
  'mango': '',
  'papaya': '',
  'watermelon': '',
  'pineapple': '',
  'strawberry': '',
  'lemon': '',
  
  // Milk & Dairy
  'milk': '',
  'yogurt': '',
  'butter': '',
  'ghee': '',
  'cheese': '',
  'cheddar': '',
  'mozzarella': '',
  'paneer': '',
  'cream': '',
  
  // Meat & Poultry
  'chicken': '',
  'broiler': '',
  'breast': '',
  'drumstick': '',
  'wings': '',
  'beef': '',
  'mutton': '',
  'lamb': '',
  
  // Fish
  'fish': '',
  'rui': '',
  'katla': '',
  'hilsa': '',
  'salmon': '',
  'shrimp': '',
  'prawn': '',
  
  // Eggs
  'egg': '',
  'brown egg': '',
  'white egg': '',
  'duck egg': '',
  
  // Cooking Oil
  'soybean oil': '',
  'mustard oil': '',
  'sunflower oil': '',
  'olive oil': '',
  'palm oil': '',
  'coconut oil': '',
  
  // Sugar & Salt
  'sugar': '',
  'brown sugar': '',
  'salt': '',
  'pink salt': '',
  
  // Lentils/Dal
  'dal': '',
  'lentil': '',
  'masoor': '',
  'mung': '',
  'moong': '',
  'chana': '',
  'chickpea': '',
  
  // Spices
  'turmeric': '',
  'chili powder': '',
  'cumin': '',
  'coriander powder': '',
  'garam masala': '',
  'cinnamon': '',
  'cardamom': '',
  
  // Frozen Foods
  'frozen chicken': '',
  'frozen fish': '',
  'frozen vegetable': '',
  'frozen peas': '',
  'frozen corn': '',
  'frozen fries': '',
  'ice cream': '',
  
  // Noodles & Pasta
  'noodles': '',
  'pasta': '',
  'vermicelli': '',
  'spaghetti': '',
  
  // Sauces & Condiments
  'ketchup': '',
  'tomato sauce': '',
  'chili sauce': '',
  'soy sauce': '',
  'mayonnaise': '',
  'mustard': '',
  'vinegar': '',
  
  // Beverages
  'cola': '',
  'coca cola': '',
  'pepsi': '',
  'sprite': '',
  'fanta': '',
  'juice': '',
  'mango juice': '',
  'orange juice': '',
  'apple juice': '',
  'water': '',
  'mineral water': '',
  
  // Tea & Coffee
  'tea': '',
  'black tea': '',
  'green tea': '',
  'coffee': '',
  'nescafe': '',
  'instant coffee': '',
  
  // Snacks & Biscuits
  'biscuit': '',
  'cookie': '',
  'chips': '',
  'crackers': '',
  'pringles': '',
  'wafer': '',
  
  // Cakes & Bakery
  'cake': '',
  'muffin': '',
  'pastry': '',
  'bread': '',
  'bun': '',
  
  // Chocolates & Candy
  'chocolate': '',
  'dark chocolate': '',
  'candy': '',
  'jelly': '',
  'cadbury': '',
  'kitkat': '',
  'snickers': '',
  
  // Nuts
  'peanut': '',
  'cashew': '',
  'almond': '',
  'walnut': '',
  'pistachio': '',
  
  // Personal Care - Soap
  'soap': '',
  'liquid soap': '',
  'hand wash': '',
  
  // Shampoo & Hair Care
  'shampoo': '',
  'conditioner': '',
  'hair oil': '',
  
  // Oral Care
  'toothpaste': '',
  'toothbrush': '',
  'mouthwash': '',
  
  // Skincare
  'face wash': '',
  'lotion': '',
  'cream': '',
  'sunscreen': '',
  
  // Deodorant & Perfume
  'deodorant': '',
  'perfume': '',
  
  // Baby Care
  'diaper': '',
  'baby wipe': '',
  'baby food': '',
  'cerelac': '',
  'baby lotion': '',
  'baby shampoo': '',
  
  // Cleaning Products
  'detergent': '',
  'washing powder': '',
  'dish wash': '',
  'floor cleaner': '',
  'toilet cleaner': '',
  'fabric softener': '',
  'air freshener': '',
  
  // Paper Products
  'tissue': '',
  'toilet paper': '',
  'kitchen towel': '',
  'napkin': '',
  
  // Gadgets & Electronics
  'phone case': '',
  'screen protector': '',
  'earphone': '',
  'headphone': '',
  'charger': '',
  'power bank': '',
  'usb cable': '',
  'speaker': '',
  'memory card': '',
  'smart watch': '',
  'smart band': '',
};

// Function to find best matching image for a product
function getBestImageForProduct(productName) {
  const lowerName = productName.toLowerCase();
  
  // Try exact matches first
  for (const [keyword, imageUrl] of Object.entries(productImageMapping)) {
    if (lowerName.includes(keyword.toLowerCase())) {
      return imageUrl;
    }
  }
  
  // Return empty string if no match found
  return '';
}

async function fixProductImages() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update\n`);
    
    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        const bestImage = getBestImageForProduct(product.name);
        
        // Update product with better image
        await Product.findByIdAndUpdate(product._id, {
          images: [bestImage],
          thumbnail: bestImage
        });
        
        updatedCount++;
        console.log(`✅ ${updatedCount}/${products.length} - Updated: ${product.name}`);
        console.log(`   Image: ${bestImage.substring(0, 60)}...`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating ${product.name}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully updated: ${updatedCount} products`);
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

fixProductImages();
