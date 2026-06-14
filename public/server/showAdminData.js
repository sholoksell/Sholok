const mongoose = require('mongoose');
const Category = require('./models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function showAdminPanelData() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('\n' + '='.repeat(90));
    console.log('📊 ADMIN PANEL - CATEGORY MANAGEMENT DATA');
    console.log('='.repeat(90));

    const allCategories = await Category.find().populate('parentId', 'name').sort({ order: 1, name: 1 });

    console.log('\n📈 STATISTICS:');
    console.log('   Total Categories: ' + allCategories.length);
    console.log('   Main Categories: ' + allCategories.filter(c => !c.parentId).length);
    console.log('   Subcategories: ' + allCategories.filter(c => c.parentId).length);
    console.log('   Featured: ' + allCategories.filter(c => c.isFeatured).length);
    console.log('   Active: ' + allCategories.filter(c => c.isActive).length);

    console.log('\n' + '='.repeat(90));
    console.log('📋 SAMPLE ADMIN PANEL VIEW (First 20 Categories):');
    console.log('='.repeat(90));
    console.log('ID'.padEnd(26) + 'Name'.padEnd(30) + 'Parent'.padEnd(20) + 'Status');
    console.log('-'.repeat(90));

    allCategories.slice(0, 20).forEach(cat => {
      const id = cat._id.toString().substring(0, 8) + '...';
      const name = (cat.icon || '📦') + ' ' + cat.name;
      const parent = cat.parentId ? cat.parentId.name : 'ROOT';
      const status = (cat.isActive ? '✅' : '❌') + (cat.isFeatured ? ' ⭐' : '   ');
      
      console.log(
        id.padEnd(26) + 
        name.substring(0, 28).padEnd(30) + 
        parent.substring(0, 18).padEnd(20) + 
        status
      );
    });

    console.log('\n... and ' + (allCategories.length - 20) + ' more categories');

    console.log('\n' + '='.repeat(90));
    console.log('🌳 CATEGORY HIERARCHY (Sample):');
    console.log('='.repeat(90));

    const mainCategories = allCategories.filter(c => !c.parentId).slice(0, 5);
    
    for (const main of mainCategories) {
      console.log('\n' + (main.icon || '📦') + ' ' + main.name + ' [' + main.slug + ']');
      
      const children = allCategories.filter(
        c => c.parentId && c.parentId._id.toString() === main._id.toString()
      );
      
      children.slice(0, 5).forEach((child, idx) => {
        const isLast = idx === Math.min(children.length, 5) - 1;
        const prefix = isLast ? '└──' : '├──';
        console.log('   ' + prefix + ' ' + child.name + ' [' + child.slug + ']');
      });
      
      if (children.length > 5) {
        console.log('   └── ... and ' + (children.length - 5) + ' more subcategories');
      }
    }

    console.log('\n' + '='.repeat(90));
    console.log('🔍 SEARCH & FILTER EXAMPLES:');
    console.log('='.repeat(90));

    // Search example
    const searchResults = allCategories.filter(c => 
      c.name.toLowerCase().includes('food')
    );
    console.log(`\n📍 Search "food": ${searchResults.length} results`);
    searchResults.slice(0, 3).forEach(c => {
      console.log('   - ' + c.name + ' (' + c.slug + ')');
    });

    // Featured filter
    const featured = allCategories.filter(c => c.isFeatured);
    console.log(`\n⭐ Featured Categories: ${featured.length} items`);
    featured.slice(0, 3).forEach(c => {
      console.log('   - ' + (c.icon || '📦') + ' ' + c.name);
    });

    // By parent
    const foodCategory = allCategories.find(c => c.slug === 'food');
    if (foodCategory) {
      const foodChildren = allCategories.filter(
        c => c.parentId && c.parentId._id.toString() === foodCategory._id.toString()
      );
      console.log(`\n🍽️ Food Subcategories: ${foodChildren.length} items`);
      foodChildren.slice(0, 5).forEach(c => {
        console.log('   - ' + c.name);
      });
    }

    console.log('\n' + '='.repeat(90));
    console.log('💾 DATABASE OPERATIONS AVAILABLE IN ADMIN PANEL:');
    console.log('='.repeat(90));
    console.log('\n✅ CREATE:');
    console.log('   - Add new main category');
    console.log('   - Add subcategory under any parent');
    console.log('   - Auto-generate slug from name');
    console.log('   - Upload category image');
    console.log('   - Set icon, description, order');

    console.log('\n✅ READ:');
    console.log('   - View all categories (paginated)');
    console.log('   - Search by name/slug');
    console.log('   - Filter by parent, status, featured');
    console.log('   - Sort by name, order, created date');
    console.log('   - View category details');

    console.log('\n✅ UPDATE:');
    console.log('   - Edit any field (name, slug, description, etc.)');
    console.log('   - Change parent (move to different category)');
    console.log('   - Toggle active/featured status');
    console.log('   - Update order/priority');
    console.log('   - Change icon/image');

    console.log('\n✅ DELETE:');
    console.log('   - Delete single category');
    console.log('   - Bulk delete (multiple selection)');
    console.log('   - Cascade delete (with children warning)');
    console.log('   - Soft delete option available');

    console.log('\n' + '='.repeat(90));
    console.log('🎯 HOW TO ACCESS IN ADMIN PANEL:');
    console.log('='.repeat(90));
    console.log('\n1. Open Admin Panel: http://localhost:5173');
    console.log('2. Login with admin credentials');
    console.log('3. Navigate to "Categories" from sidebar');
    console.log('4. You will see a table with all ' + allCategories.length + ' categories');
    console.log('5. Use search, filter, and sort options');
    console.log('6. Click "Add Category" to create new');
    console.log('7. Click edit icon to modify existing');
    console.log('8. Select multiple for bulk operations');

    console.log('\n' + '='.repeat(90));
    console.log('✨ ALL DATA SUCCESSFULLY STORED & ACCESSIBLE! ✨');
    console.log('='.repeat(90) + '\n');

    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showAdminPanelData();
