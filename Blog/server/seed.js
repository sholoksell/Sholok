require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./config/db');

async function seed() {
  // Categories
  await pool.execute(`
    INSERT IGNORE INTO categories (name, name_bn, name_en, slug, description, icon, color, \`group\`, is_active, order_num)
    VALUES
      ('Entertainment','বিনোদন','Entertainment','entertainment','Movies, music, art and pop culture','🎨','#ec4899','entertainment',1,1),
      ('Lifestyle','জীবনযাপন','Lifestyle','lifestyle','Fashion, food, health and daily life','🛍️','#8b5cf6','lifestyle',1,2),
      ('Hobbies & Travel','শখ ও ভ্রমণ','Hobbies & Travel','hobbies-travel','Adventures, travel tips and hobbies','🧭','#3b82f6','hobbies',1,3),
      ('Knowledge','জ্ঞান','Knowledge','knowledge','Science, tech, history and education','🧠','#10b981','knowledge',1,4)
  `);
  console.log('✅ Categories seeded');

  // Admin user (password: Admin@1234)
  const hash = await bcrypt.hash('Admin@1234', 12);
  await pool.execute(`
    INSERT IGNORE INTO users (username, email, password, display_name, bio, role, is_verified, is_active)
    VALUES ('sholok_admin','admin@sholok.blog','${hash}','Sholok Admin','Blog administrator',
            'admin',1,1)
  `);
  console.log('✅ Admin user: admin@sholok.blog / Admin@1234');

  // Sample author
  const authorHash = await bcrypt.hash('Author@1234', 12);
  await pool.execute(`
    INSERT IGNORE INTO users (username, email, password, display_name, bio, role, is_verified, is_active)
    VALUES ('john_doe','john@sholok.blog','${authorHash}','John Doe',
            'Passionate writer and storyteller sharing thoughts on life and culture.',
            'user',1,1)
  `);

  const [[{ id: authorId }]] = await pool.execute(`SELECT id FROM users WHERE username='john_doe'`);
  const [[{ id: entId }]]    = await pool.execute(`SELECT id FROM categories WHERE slug='entertainment'`);
  const [[{ id: lifeId }]]   = await pool.execute(`SELECT id FROM categories WHERE slug='lifestyle'`);
  const [[{ id: knowId }]]   = await pool.execute(`SELECT id FROM categories WHERE slug='knowledge'`);

  // Sample posts
  const posts = [
    {
      title: 'Welcome to Sholok Blog',
      slug: 'welcome-to-sholok-blog',
      excerpt: 'Discover stories, ideas and expertise from writers on any topic. A platform built for writers and readers alike.',
      content: '<h2>Welcome!</h2><p>Sholok Blog is your home for amazing stories, insightful articles and creative expression. Join thousands of writers sharing their passion every day.</p><p>Whether you love entertainment, lifestyle, travel or knowledge — there is something here for everyone. Start exploring today!</p>',
      catId: entId, featured: 1, status: 'published', readTime: 2,
    },
    {
      title: 'Top 10 Travel Destinations for 2025',
      slug: 'top-10-travel-destinations-2025',
      excerpt: 'From the beaches of Southeast Asia to the mountains of Europe, here are the must-visit places this year.',
      content: '<h2>Travel the World</h2><p>2025 is the year to explore. With travel restrictions eased globally, these destinations top our list for adventure seekers and culture lovers alike.</p><ul><li>Bali, Indonesia</li><li>Santorini, Greece</li><li>Kyoto, Japan</li><li>Patagonia, Argentina</li><li>Marrakech, Morocco</li></ul>',
      catId: lifeId, featured: 0, status: 'published', readTime: 4,
    },
    {
      title: 'How AI is Changing the Way We Write',
      slug: 'how-ai-is-changing-the-way-we-write',
      excerpt: 'Artificial intelligence tools are transforming content creation. Here is what writers need to know.',
      content: '<h2>The AI Writing Revolution</h2><p>From grammar checkers to full-article generators, AI tools are now part of every writer\'s toolkit. But how do they affect creativity, authenticity and the future of storytelling?</p><p>In this piece we explore the tools, the trends and what it means to write in an AI-assisted world.</p>',
      catId: knowId, featured: 1, status: 'published', readTime: 5,
    },
    {
      title: 'Mindful Living: Simple Habits That Transform Your Day',
      slug: 'mindful-living-simple-habits',
      excerpt: 'Small daily habits can make a big difference. Discover how mindfulness can bring balance to your busy life.',
      content: '<h2>Start Small, Think Big</h2><p>Mindfulness doesn\'t require hours of meditation. Even five minutes of intentional breathing, a gratitude journal or a short walk can reset your mindset.</p><p>Here are five habits to weave into your daily routine for a more focused, calmer you.</p>',
      catId: lifeId, featured: 0, status: 'published', readTime: 3,
    },
  ];

  for (const p of posts) {
    await pool.execute(`
      INSERT IGNORE INTO posts
        (title, title_en, slug, excerpt, excerpt_en, content, author_id, category_id,
         is_featured, status, published_at, read_time, views)
      VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),?,?)
    `, [p.title, p.title, p.slug, p.excerpt, p.excerpt, p.content,
        authorId, p.catId, p.featured, p.status, p.readTime, Math.floor(Math.random()*500+50)]);
  }
  console.log('✅ Sample posts seeded');

  process.exit(0);
}

seed().catch(e => { console.error('Seed error:', e.message); process.exit(1); });
