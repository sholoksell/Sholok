const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Complete Bangladesh Grocery Category Structure
const categoryData = [
  {
    name: 'Grocery & Staples',
    icon: '🛒',
    description: 'Daily essentials and staple items',
    subcategories: [
      {
        name: 'Rice',
        subcategories: ['Miniket Rice', 'Najirshail Rice', 'Basmati Rice', 'Brown Rice', 'Chinigura Rice']
      },
      {
        name: 'Atta & Flour',
        subcategories: ['Wheat Flour', 'Maida', 'Suji', 'Gram Flour', 'Rice Flour']
      },
      {
        name: 'Lentils (Dal)',
        subcategories: ['Masoor Dal', 'Mung Dal', 'Chana Dal', 'Motor Dal', 'Musur Dal']
      },
      {
        name: 'Edible Oil',
        subcategories: ['Soybean Oil', 'Mustard Oil', 'Sunflower Oil', 'Palm Oil', 'Rice Bran Oil']
      },
      {
        name: 'Salt & Sugar',
        subcategories: ['Table Salt', 'Pink Salt', 'White Sugar', 'Brown Sugar', 'Rock Salt']
      },
      {
        name: 'Spices',
        subcategories: ['Turmeric Powder', 'Chili Powder', 'Cumin Powder', 'Coriander Powder', 'Garam Masala', 'Mixed Spices']
      },
      {
        name: 'Ready Mix',
        subcategories: ['Cake Mix', 'Haleem Mix', 'Khichuri Mix', 'Polao Mix', 'Pudding Mix']
      },
      {
        name: 'Noodles & Pasta',
        subcategories: ['Instant Noodles', 'Pasta', 'Vermicelli', 'Rice Noodles']
      },
      {
        name: 'Sauces & Ketchup',
        subcategories: ['Tomato Ketchup', 'Chili Sauce', 'Soy Sauce', 'Mayonnaise', 'Pasta Sauce']
      },
      {
        name: 'Baking Items',
        subcategories: ['Baking Powder', 'Baking Soda', 'Yeast', 'Vanilla Essence', 'Food Color']
      }
    ]
  },
  {
    name: 'Fresh Produce',
    icon: '🥬',
    description: 'Fresh vegetables, fruits, meat and fish',
    subcategories: [
      {
        name: 'Fresh Vegetables',
        subcategories: ['Potato', 'Onion', 'Tomato', 'Carrot', 'Cabbage', 'Cauliflower', 'Brinjal', 'Green Chili', 'Cucumber']
      },
      {
        name: 'Fresh Fruits',
        subcategories: ['Banana', 'Apple', 'Orange', 'Grapes', 'Mango', 'Papaya', 'Watermelon', 'Pineapple']
      },
      {
        name: 'Fresh Meat',
        subcategories: ['Beef', 'Mutton', 'Goat Meat', 'Lamb']
      },
      {
        name: 'Chicken',
        subcategories: ['Broiler Chicken', 'Deshi Chicken', 'Chicken Breast', 'Chicken Drumstick', 'Chicken Wings']
      },
      {
        name: 'Fish',
        subcategories: ['Hilsa', 'Rui', 'Katla', 'Pangash', 'Tilapia', 'Shrimp', 'Prawn']
      },
      {
        name: 'Eggs',
        subcategories: ['Brown Eggs', 'White Eggs', 'Duck Eggs', 'Quail Eggs']
      }
    ]
  },
  {
    name: 'Dairy & Frozen',
    icon: '🥛',
    description: 'Milk, dairy products and frozen items',
    subcategories: [
      {
        name: 'Milk',
        subcategories: ['Fresh Milk', 'UHT Milk', 'Powder Milk', 'Condensed Milk', 'Evaporated Milk']
      },
      {
        name: 'Yogurt',
        subcategories: ['Plain Yogurt', 'Flavored Yogurt', 'Greek Yogurt', 'Drinking Yogurt']
      },
      {
        name: 'Butter & Ghee',
        subcategories: ['Butter', 'Ghee', 'Margarine']
      },
      {
        name: 'Cheese',
        subcategories: ['Cheddar Cheese', 'Mozzarella Cheese', 'Cream Cheese', 'Cheese Spread']
      },
      {
        name: 'Ice Cream',
        subcategories: ['Vanilla Ice Cream', 'Chocolate Ice Cream', 'Strawberry Ice Cream', 'Kulfi', 'Ice Cream Bars']
      },
      {
        name: 'Frozen Snacks',
        subcategories: ['Samosa', 'Spring Roll', 'Paratha', 'Pizza', 'French Fries']
      },
      {
        name: 'Frozen Meat',
        subcategories: ['Frozen Chicken', 'Frozen Beef', 'Frozen Fish']
      },
      {
        name: 'Frozen Vegetables',
        subcategories: ['Mixed Vegetables', 'Green Peas', 'Corn', 'Spinach']
      }
    ]
  },
  {
    name: 'Beverages',
    icon: '🥤',
    description: 'Soft drinks, juice, tea, coffee and more',
    subcategories: [
      {
        name: 'Soft Drinks',
        subcategories: ['Cola', 'Lemon Drinks', 'Orange Drinks', 'Ginger Ale']
      },
      {
        name: 'Juice',
        subcategories: ['Mango Juice', 'Orange Juice', 'Apple Juice', 'Mixed Fruit Juice', 'Lemon Juice']
      },
      {
        name: 'Tea',
        subcategories: ['Black Tea', 'Green Tea', 'Herbal Tea', 'Tea Bags', 'Instant Tea']
      },
      {
        name: 'Coffee',
        subcategories: ['Instant Coffee', 'Ground Coffee', 'Coffee Beans', '3-in-1 Coffee']
      },
      {
        name: 'Energy Drinks',
        subcategories: ['Red Bull', 'Monster', 'Local Energy Drinks']
      },
      {
        name: 'Mineral Water',
        subcategories: ['500ml Bottle', '1 Liter Bottle', '2 Liter Bottle', '5 Liter Bottle']
      },
      {
        name: 'Powder Drinks',
        subcategories: ['Tang', 'Horlicks', 'Ovaltine', 'Milo', 'Boost']
      }
    ]
  },
  {
    name: 'Snacks & Confectionery',
    icon: '🍪',
    description: 'Biscuits, cakes, chips, chocolates and more',
    subcategories: [
      {
        name: 'Biscuits',
        subcategories: ['Cream Biscuits', 'Glucose Biscuits', 'Marie Biscuits', 'Crackers', 'Cookies', 'Digestive Biscuits']
      },
      {
        name: 'Cakes',
        subcategories: ['Pound Cake', 'Cupcakes', 'Muffins', 'Pastries', 'Cake Rusk']
      },
      {
        name: 'Chips',
        subcategories: ['Potato Chips', 'Tortilla Chips', 'Corn Chips', 'Namkeen']
      },
      {
        name: 'Chocolates',
        subcategories: ['Milk Chocolate', 'Dark Chocolate', 'White Chocolate', 'Chocolate Bars', 'Chocolate Box']
      },
      {
        name: 'Candy',
        subcategories: ['Hard Candy', 'Soft Candy', 'Lollipop', 'Jelly', 'Mint Candy']
      },
      {
        name: 'Nuts',
        subcategories: ['Peanuts', 'Cashew Nuts', 'Almonds', 'Walnuts', 'Mixed Nuts']
      }
    ]
  },
  {
    name: 'Personal Care',
    icon: '🧴',
    description: 'Personal hygiene and beauty products',
    subcategories: [
      {
        name: 'Soap',
        subcategories: ['Beauty Soap', 'Antibacterial Soap', 'Ayurvedic Soap', 'Liquid Soap']
      },
      {
        name: 'Shampoo',
        subcategories: ['Anti-Dandruff Shampoo', 'Hair Fall Control', 'Herbal Shampoo', '2-in-1 Shampoo']
      },
      {
        name: 'Conditioner',
        subcategories: ['Hair Conditioner', 'Leave-in Conditioner', 'Deep Conditioning Mask']
      },
      {
        name: 'Toothpaste',
        subcategories: ['Fluoride Toothpaste', 'Herbal Toothpaste', 'Whitening Toothpaste', 'Sensitive Toothpaste']
      },
      {
        name: 'Toothbrush',
        subcategories: ['Soft Bristle', 'Medium Bristle', 'Electric Toothbrush', 'Kids Toothbrush']
      },
      {
        name: 'Face Wash',
        subcategories: ['Oil Control Face Wash', 'Acne Face Wash', 'Brightening Face Wash', 'Charcoal Face Wash']
      },
      {
        name: 'Body Lotion',
        subcategories: ['Moisturizing Lotion', 'Whitening Lotion', 'Herbal Lotion', 'Baby Lotion']
      },
      {
        name: 'Deodorant',
        subcategories: ['Spray Deodorant', 'Roll-on Deodorant', 'Stick Deodorant']
      },
      {
        name: 'Shaving Items',
        subcategories: ['Shaving Cream', 'Aftershave', 'Razor', 'Shaving Gel']
      },
      {
        name: 'Sanitary Napkins',
        subcategories: ['Day Pads', 'Night Pads', 'Panty Liners', 'Menstrual Cup']
      }
    ]
  },
  {
    name: 'Baby Care',
    icon: '👶',
    description: 'Baby food, diapers and care products',
    subcategories: [
      {
        name: 'Baby Food',
        subcategories: ['Cerelac', 'Baby Formula', 'Baby Snacks', 'Baby Juice']
      },
      {
        name: 'Baby Diapers',
        subcategories: ['Newborn Diapers', 'Small Size', 'Medium Size', 'Large Size', 'XL Size']
      },
      {
        name: 'Baby Wipes',
        subcategories: ['Wet Wipes', 'Dry Wipes', 'Hand & Face Wipes']
      },
      {
        name: 'Baby Lotion',
        subcategories: ['Baby Moisturizer', 'Baby Oil', 'Baby Powder']
      },
      {
        name: 'Baby Soap',
        subcategories: ['Baby Bar Soap', 'Baby Liquid Soap']
      },
      {
        name: 'Baby Shampoo',
        subcategories: ['Tear-Free Shampoo', 'Baby Hair Oil', '2-in-1 Baby Wash']
      }
    ]
  },
  {
    name: 'Household & Cleaning',
    icon: '🧹',
    description: 'Cleaning supplies and household items',
    subcategories: [
      {
        name: 'Dishwashing',
        subcategories: ['Dishwashing Liquid', 'Dishwashing Bar', 'Dishwasher Tablets', 'Scouring Pad']
      },
      {
        name: 'Floor Cleaner',
        subcategories: ['Tile Cleaner', 'Wood Floor Cleaner', 'Disinfectant Cleaner']
      },
      {
        name: 'Toilet Cleaner',
        subcategories: ['Liquid Toilet Cleaner', 'Toilet Bowl Cleaner', 'Toilet Rim Block']
      },
      {
        name: 'Detergent',
        subcategories: ['Washing Powder', 'Liquid Detergent', 'Detergent Bar', 'Fabric Softener']
      },
      {
        name: 'Tissue & Napkins',
        subcategories: ['Facial Tissue', 'Toilet Tissue', 'Kitchen Towel', 'Paper Napkin']
      },
      {
        name: 'Garbage Bags',
        subcategories: ['Small Bags', 'Medium Bags', 'Large Bags', 'Biodegradable Bags']
      },
      {
        name: 'Air Freshener',
        subcategories: ['Spray Air Freshener', 'Automatic Air Freshener', 'Gel Air Freshener']
      }
    ]
  },
  {
    name: 'Home & Kitchen',
    icon: '🏠',
    description: 'Kitchen tools and home essentials',
    subcategories: [
      {
        name: 'Storage Containers',
        subcategories: ['Plastic Containers', 'Glass Containers', 'Steel Containers', 'Food Jars']
      },
      {
        name: 'Kitchen Tools',
        subcategories: ['Knife Set', 'Cutting Board', 'Peeler', 'Grater', 'Measuring Cups']
      },
      {
        name: 'Cookware',
        subcategories: ['Non-Stick Pans', 'Pressure Cooker', 'Pots', 'Kadai', 'Frying Pan']
      },
      {
        name: 'Plates & Glasses',
        subcategories: ['Dinner Plates', 'Bowls', 'Glasses', 'Cups', 'Serving Dishes']
      },
      {
        name: 'Cleaning Tools',
        subcategories: ['Mop', 'Broom', 'Dustpan', 'Scrubber', 'Cleaning Cloth']
      }
    ]
  },
  {
    name: 'Health & Wellness',
    icon: '💊',
    description: 'Health products and wellness items',
    subcategories: [
      {
        name: 'Vitamins',
        subcategories: ['Vitamin C', 'Vitamin D', 'Multivitamins', 'Calcium Tablets', 'Iron Supplements']
      },
      {
        name: 'First Aid',
        subcategories: ['Bandages', 'Antiseptic', 'Cotton', 'Medical Tape', 'First Aid Kit']
      },
      {
        name: 'Hand Sanitizer',
        subcategories: ['Gel Sanitizer', 'Liquid Sanitizer', 'Spray Sanitizer']
      },
      {
        name: 'Masks',
        subcategories: ['Surgical Masks', 'N95 Masks', 'Cloth Masks', 'Face Shield']
      },
      {
        name: 'Thermometer',
        subcategories: ['Digital Thermometer', 'Infrared Thermometer', 'Strip Thermometer']
      }
    ]
  },
  {
    name: 'Gadget',
    icon: '📱',
    description: 'Mobile accessories and small electronics',
    subcategories: [
      {
        name: 'Mobile Accessories',
        subcategories: ['Phone Cases', 'Screen Protector', 'Phone Stand', 'Pop Socket']
      },
      {
        name: 'Headphones',
        subcategories: ['Earphones', 'Wireless Headphones', 'Gaming Headset', 'TWS Earbuds']
      },
      {
        name: 'Chargers',
        subcategories: ['Fast Charger', 'Type-C Charger', 'Micro USB Charger', 'Wireless Charger']
      },
      {
        name: 'Power Bank',
        subcategories: ['5000mAh', '10000mAh', '20000mAh', '30000mAh']
      },
      {
        name: 'Smart Watch',
        subcategories: ['Fitness Tracker', 'Smart Band', 'Smart Watch']
      },
      {
        name: 'Small Electronics',
        subcategories: ['USB Cable', 'OTG Cable', 'Memory Card', 'Card Reader', 'Bluetooth Speaker']
      }
    ]
  }
];

// Function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Recursive function to create categories
async function createCategoriesRecursive(categories, parentId = null, level = 1) {
  let createdCount = 0;
  
  for (const categoryData of categories) {
    try {
      const slug = createSlug(categoryData.name);
      
      const category = new Category({
        name: categoryData.name,
        slug: slug,
        description: categoryData.description || `Browse ${categoryData.name}`,
        icon: categoryData.icon || '📦',
        parentId: parentId,
        level: level,
        isActive: true,
        isFeatured: level === 1,
        order: createdCount
      });
      
      const savedCategory = await category.save();
      createdCount++;
      
      console.log(`✅ Created: ${categoryData.name} (Level ${level})`);
      
      // Create subcategories if they exist
      if (categoryData.subcategories && categoryData.subcategories.length > 0) {
        // Convert subcategories to proper format if they're strings
        const subcategoriesArray = categoryData.subcategories.map(sub => {
          if (typeof sub === 'string') {
            return { name: sub };
          } else if (typeof sub === 'object') {
            return sub;
          }
          return null;
        }).filter(Boolean);
        
        const subCount = await createCategoriesRecursive(
          subcategoriesArray,
          savedCategory._id,
          level + 1
        );
        createdCount += subCount;
      }
    } catch (error) {
      console.error(`❌ Error creating category "${categoryData.name}":`, error.message);
    }
  }
  
  return createdCount;
}

// Main seed function
async function seedCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing categories
    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    console.log('✅ Cleared existing categories\n');
    
    console.log('🌱 Starting category seeding...\n');
    const totalCreated = await createCategoriesRecursive(categoryData);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Seed completed successfully!');
    console.log('📊 Total categories created:', totalCreated);
    
    // Count by level
    const level1Count = await Category.countDocuments({ level: 1 });
    const level2Count = await Category.countDocuments({ level: 2 });
    const level3Count = await Category.countDocuments({ level: 3 });
    
    console.log('\n📂 Breakdown by level:');
    console.log(`   Level 1 (Main Categories): ${level1Count}`);
    console.log(`   Level 2 (Sub Categories): ${level2Count}`);
    console.log(`   Level 3 (Child Categories): ${level3Count}`);
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
seedCategories();
