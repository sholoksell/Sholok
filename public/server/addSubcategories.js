const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

function createSlug(name) {
  return name.toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Subcategories for each main category
const subcategoriesData = {
  'food': [
    'Cooking Oil', 'Salt & Sugar', 'Rice & Flour', 'Spices & Masala', 
    'Tea & Coffee', 'Dal & Lentils', 'Nuts & Dry Fruits', 'Honey & Jam',
    'Pickles & Chutney', 'Noodles & Pasta', 'Biscuits & Cookies', 'Snacks',
    'Breakfast Cereals', 'Canned Food', 'Sauces & Condiments'
  ],
  'baby-food-and-care': [
    'Baby Food', 'Baby Diapers', 'Baby Wipes', 'Baby Bath & Skin', 
    'Baby Powder & Oil', 'Baby Shampoo', 'Feeding Bottles', 'Baby Toys',
    'Baby Clothes', 'Baby Health Care'
  ],
  'home-cleaning': [
    'Dishwashing', 'Laundry Detergent', 'Floor Cleaner', 'Toilet Cleaner',
    'Glass Cleaner', 'Air Freshener', 'Disinfectant', 'Kitchen Cleaner',
    'Cleaning Tools', 'Garbage Bags', 'Tissue & Paper'
  ],
  'pet-care': [
    'Dog Food', 'Cat Food', 'Bird Food', 'Fish Food',
    'Pet Accessories', 'Pet Toys', 'Pet Grooming', 'Pet Health Care'
  ],
  'beauty-and-health': [
    'Skin Care', 'Hair Care', 'Face Care', 'Body Care',
    'Makeup', 'Perfume & Deodorant', 'Shampoo & Conditioner', 'Face Wash',
    'Moisturizer & Cream', 'Sunscreen', 'Hand Wash', 'Body Wash',
    'Oral Care', 'Sanitary Napkins', 'Health Supplements', 'First Aid'
  ],
  'fashion-and-lifestyle': [
    'Men Fashion', 'Women Fashion', 'Kids Fashion', 'Bags & Luggage',
    'Watches', 'Jewelry', 'Sunglasses', 'Belts & Wallets',
    'Shoes & Footwear', 'Fashion Accessories'
  ],
  'home-and-kitchen': [
    'Kitchen Utensils', 'Cookware', 'Storage Containers', 'Kitchen Tools',
    'Dinner Set', 'Glassware', 'Water Bottles', 'Lunch Box',
    'Home Decor', 'Bedding', 'Curtains', 'Lights & Lamps',
    'Furniture', 'Organizers'
  ],
  'stationeries': [
    'Notebooks & Diaries', 'Pens & Pencils', 'Art & Craft', 'School Supplies',
    'Office Supplies', 'Calculators', 'Files & Folders', 'Markers & Highlighters',
    'Staplers & Clips', 'Adhesives', 'Drawing Tools', 'Paper Products'
  ],
  'toys-and-sports': [
    'Action Figures', 'Dolls & Soft Toys', 'Building Blocks', 'Board Games',
    'Puzzles', 'Remote Control Toys', 'Musical Toys', 'Educational Toys',
    'Sports Equipment', 'Cycling', 'Badminton', 'Cricket',
    'Football', 'Indoor Games', 'Outdoor Games'
  ],
  'gadget': [
    'Mobile Phones', 'Mobile Accessories', 'Headphones & Earphones', 'Power Banks',
    'Chargers & Cables', 'Smart Watches', 'Bluetooth Speakers', 'Phone Cases',
    'Screen Protectors', 'Memory Cards', 'USB Drives', 'Computer Accessories',
    'Gaming Accessories', 'Camera & Photography', 'Smart Home Devices'
  ]
};

async function addSubcategories() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📂 Fetching parent categories...\n');
    
    let totalAdded = 0;
    let totalSkipped = 0;

    for (const [parentSlug, subcategoryNames] of Object.entries(subcategoriesData)) {
      const parentCategory = await Category.findOne({ slug: parentSlug, parentId: null });
      
      if (!parentCategory) {
        console.log(`❌ Parent category not found: ${parentSlug}\n`);
        continue;
      }

      console.log(`\n${'='.repeat(70)}`);
      console.log(`${parentCategory.icon || '📦'} ${parentCategory.name.toUpperCase()}`);
      console.log('='.repeat(70));

      for (const subName of subcategoryNames) {
        const slug = createSlug(subName);
        
        try {
          // Check if subcategory already exists (by slug anywhere, not just under this parent)
          const existing = await Category.findOne({ slug: slug });

          if (existing) {
            // Update parent if needed
            if (existing.parentId?.toString() !== parentCategory._id.toString()) {
              await Category.updateOne(
                { _id: existing._id },
                { $set: { parentId: parentCategory._id, isActive: true } }
              );
              console.log(`🔄 ${subName} (moved to ${parentCategory.name})`);
              totalAdded++;
            } else {
              console.log(`⏭️  ${subName}`);
              totalSkipped++;
            }
          } else {
            // Create new subcategory
            const newSubcategory = new Category({
              name: subName,
              nameBn: subName, // You can translate later
              slug: slug,
              parentId: parentCategory._id,
              isActive: true,
              isFeatured: false,
              order: 0
            });

            await newSubcategory.save();
            console.log(`✅ ${subName} → ${slug}`);
            totalAdded++;
          }
        } catch (error) {
          console.log(`❌ ${subName}: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ Subcategories addition completed!`);
    console.log(`📊 Added: ${totalAdded} new subcategories`);
    console.log(`⏭️  Skipped: ${totalSkipped} existing subcategories`);

    // Show summary
    console.log('\n📋 Category Summary:');
    console.log('='.repeat(70));
    
    const parentCategories = await Category.find({ parentId: null, isFeatured: true }).sort('order name');
    
    for (const parent of parentCategories) {
      const subCount = await Category.countDocuments({ parentId: parent._id, isActive: true });
      console.log(`${parent.icon || '📦'} ${parent.name.padEnd(30)} → ${subCount} subcategories`);
    }
    
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

addSubcategories();
