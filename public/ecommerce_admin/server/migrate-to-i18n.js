/**
 * migrate-to-i18n.js
 *
 * One-time migration script:
 * Converts legacy flat multilingual fields to nested { en, bn } objects.
 *
 * BEFORE running: back up your MongoDB database.
 *
 * Usage:
 *   node migrate-to-i18n.js
 *
 * What it does:
 *   ① Products:  name/nameBn → name.en/name.bn
 *                description/descriptionBn → description.en/description.bn
 *                shortDescription/shortDescriptionBn → shortDescription.en/shortDescription.bn
 *   ② Categories: name/nameBn → name.en/name.bn
 *                 description/descriptionBn → description.en/description.bn
 *   ③ Banners:   title/titleBn → title.en/title.bn
 *                subtitle/subtitleBn → subtitle.en/subtitle.bn
 *                description/descriptionBn → description.en/description.bn
 *                linkText/linkTextBn → linkText.en/linkText.bn
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

// ── Raw collection names ───────────────────────────────────────────────────────
const COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  banners: 'banners',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeI18n(en, bn) {
  return { en: en || '', bn: bn || '' };
}

function needsMigration(doc, field) {
  // Already migrated if it's an object with en/bn keys
  return !doc[field] || typeof doc[field] !== 'object' || (!doc[field].en && !doc[field].bn);
}

// ── Migration functions ───────────────────────────────────────────────────────

async function migrateProducts(db) {
  const col = db.collection(COLLECTIONS.products);
  const products = await col.find({}).toArray();
  let migrated = 0;

  for (const doc of products) {
    const updates = {};

    // name
    if (needsMigration(doc, 'name')) {
      updates.name = makeI18n(doc.name, doc.nameBn);
    }
    // description
    if (needsMigration(doc, 'description')) {
      updates.description = makeI18n(doc.description, doc.descriptionBn);
    }
    // shortDescription
    if (needsMigration(doc, 'shortDescription')) {
      updates.shortDescription = makeI18n(doc.shortDescription, doc.shortDescriptionBn);
    }

    if (Object.keys(updates).length > 0) {
      await col.updateOne(
        { _id: doc._id },
        {
          $set: updates,
          $unset: { nameBn: '', descriptionBn: '', shortDescriptionBn: '' },
        }
      );
      migrated++;
    }
  }

  console.log(`✅  Products: ${migrated}/${products.length} documents migrated`);
}

async function migrateCategories(db) {
  const col = db.collection(COLLECTIONS.categories);
  const categories = await col.find({}).toArray();
  let migrated = 0;

  for (const doc of categories) {
    const updates = {};

    if (needsMigration(doc, 'name')) {
      updates.name = makeI18n(doc.name, doc.nameBn);
    }
    if (needsMigration(doc, 'description')) {
      updates.description = makeI18n(doc.description, doc.descriptionBn);
    }

    if (Object.keys(updates).length > 0) {
      await col.updateOne(
        { _id: doc._id },
        {
          $set: updates,
          $unset: { nameBn: '', descriptionBn: '' },
        }
      );
      migrated++;
    }
  }

  console.log(`✅  Categories: ${migrated}/${categories.length} documents migrated`);
}

async function migrateBanners(db) {
  const col = db.collection(COLLECTIONS.banners);
  const banners = await col.find({}).toArray();
  let migrated = 0;

  for (const doc of banners) {
    const updates = {};

    if (needsMigration(doc, 'title')) {
      updates.title = makeI18n(doc.title, doc.titleBn);
    }
    if (needsMigration(doc, 'subtitle')) {
      updates.subtitle = makeI18n(doc.subtitle, doc.subtitleBn);
    }
    if (needsMigration(doc, 'description')) {
      updates.description = makeI18n(doc.description, doc.descriptionBn);
    }
    if (needsMigration(doc, 'linkText')) {
      updates.linkText = makeI18n(doc.linkText, doc.linkTextBn);
    }

    if (Object.keys(updates).length > 0) {
      await col.updateOne(
        { _id: doc._id },
        {
          $set: updates,
          $unset: { titleBn: '', subtitleBn: '', descriptionBn: '', linkTextBn: '' },
        }
      );
      migrated++;
    }
  }

  console.log(`✅  Banners: ${migrated}/${banners.length} documents migrated`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀  Connecting to MongoDB…');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  console.log('✅  Connected.\n');

  console.log('📦  Migrating Products…');
  await migrateProducts(db);

  console.log('📂  Migrating Categories…');
  await migrateCategories(db);

  console.log('🖼️   Migrating Banners…');
  await migrateBanners(db);

  console.log('\n🎉  Migration complete! All fields are now in { en, bn } format.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
