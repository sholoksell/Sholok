require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Category = require('./models/Category');

const uri = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

// Path to frontend storefront's categories.json
const FRONTEND_CATEGORIES_JSON = path.resolve(
  __dirname,
  '..', '..', 'vite-project', 'src', 'data', 'categories.json'
);

async function loadCategoriesData() {
  if (!fs.existsSync(FRONTEND_CATEGORIES_JSON)) {
    throw new Error(`categories.json not found at: ${FRONTEND_CATEGORIES_JSON}`);
  }
  const raw = fs.readFileSync(FRONTEND_CATEGORIES_JSON, 'utf-8');
  const json = JSON.parse(raw);
  if (!json || !Array.isArray(json.categories)) {
    throw new Error('Invalid categories.json structure (expected { categories: [...] })');
  }
  return json.categories;
}

async function upsertCategory(filter, data) {
  // Update if exists, otherwise create. Returns the document.
  const updated = await Category.findOneAndUpdate(
    filter,
    { $set: data },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return updated;
}

async function seedCategories() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });
    console.log('✅ MongoDB Connected');

    // Drop stale name_1 unique index if it exists (not in current schema)
    try {
      await Category.collection.dropIndex('name_1');
      console.log('🗑️  Dropped stale name_1 index');
    } catch (_) { /* index may not exist – ignore */ }

    const rootCategories = await loadCategoriesData();
    console.log(`📦 Loaded ${rootCategories.length} root categories from frontend JSON`);

    let createdRoots = 0, updatedRoots = 0;
    let createdSubs = 0, updatedSubs = 0;

    for (let i = 0; i < rootCategories.length; i++) {
      const c = rootCategories[i];

      const existingRoot = await Category.findOne({ slug: c.slug });
      const rootDoc = await upsertCategory(
        { slug: c.slug },
        {
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          icon: c.icon || '',
          parentId: null,
          order: i + 1,
          isActive: true,
          featured: true,
          showOnMenu: true,
          showOnHomepage: true,
          showInSearch: true,
        }
      );
      if (existingRoot) updatedRoots++; else createdRoots++;
      console.log(`${existingRoot ? '🔄' : '✨'} Root: ${rootDoc.name} (${rootDoc.slug})`);

      const subs = Array.isArray(c.subcategories) ? c.subcategories : [];
      for (let j = 0; j < subs.length; j++) {
        const sub = subs[j];
        const existingSub = await Category.findOne({ slug: sub.slug });
        const subDoc = await upsertCategory(
          { slug: sub.slug },
          {
            name: sub.name,
            slug: sub.slug,
            description: Array.isArray(sub.children) ? sub.children.join(', ') : '',
            icon: '',
            parentId: rootDoc._id,
            order: j + 1,
            isActive: true,
            featured: false,
            showOnMenu: true,
            showOnHomepage: false,
            showInSearch: true,
          }
        );
        if (existingSub) updatedSubs++; else createdSubs++;
        console.log(`   ${existingSub ? '🔄' : '✨'} Sub: ${subDoc.name} (${subDoc.slug})`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Roots:    created ${createdRoots}, updated ${updatedRoots}`);
    console.log(`✅ Subs:     created ${createdSubs}, updated ${updatedSubs}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    try { await mongoose.connection.close(); } catch (_) {}
    process.exit(1);
  }
}

seedCategories();
