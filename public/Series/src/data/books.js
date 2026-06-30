import { categories } from './categories';
import { authors } from './authors';
import { publishers } from './publishers';

const titleParts = {
  'বাংলা সাহিত্য': ['নীল জোছনার গল্প', 'শেষ বিকেলের আলো', 'হৃদয়ের ভাঙা সুর', 'মেঘে ঢাকা তারা', 'বর্ষার এক সন্ধ্যা', 'একটি কুয়াশার দিন', 'স্মৃতির ভেতর বাড়ি'],
  'মুক্তিযুদ্ধ': ['একাত্তরের ডায়েরি', 'রক্তে রাঙা মাটি', 'মুক্তির পথে', 'স্বাধীনতার গল্পগুলো', 'যুদ্ধদিনের কথা', 'বীরাঙ্গনার ডায়েরি'],
  'ইসলামিক': ['হৃদয়ের প্রশান্তি', 'ঈমানের আলো', 'নবীজির জীবনকথা', 'প্রার্থনার শক্তি', 'সিরাতের আলোকে', 'আত্মশুদ্ধির পথ'],
  'রহস্য': ['অন্ধকারের চাবি', 'গোপন কুঠুরি', 'নিখোঁজ রাত্রি', 'রহস্যময় চিঠি', 'হারানো দলিল', 'ছায়ার পেছনে'],
  'থ্রিলার': ['শেষ মুহূর্তের চাল', 'নিঃশব্দ ঘাতক', 'বিপদসংকেত', 'অন্তিম সাক্ষী', 'রক্তচক্ষু', 'ফাঁদে পড়া রাত'],
  'কিশোর সাহিত্য': ['টুনটুনির রাজ্য', 'ভূতের বাড়ির রহস্য', 'ছোট্ট বন্ধুর গল্প', 'হাসির রাজ্যে', 'খুদে গোয়েন্দা দল', 'রূপকথার দেশে'],
  'কবিতা': ['মনের কথা', 'বৃষ্টির পঙক্তি', 'আকাশের চিঠি', 'নদীর কবিতা', 'প্রেমের পঙক্তিমালা', 'নিঃশব্দ ভাষা'],
  'ইতিহাস': ['বাংলার ইতিহাস', 'প্রাচীন বাংলার কথা', 'সুলতানি আমলের গল্প', 'ঔপনিবেশিক বাংলা', 'বাংলার নবজাগরণ'],
  'বিজ্ঞান': ['মহাবিশ্বের রহস্য', 'বিজ্ঞানের অজানা কথা', 'প্রযুক্তির পথে', 'মস্তিষ্কের গোপন কথা', 'মহাকাশের গল্প'],
  'বিসিএস/চাকরি প্রস্তুতি': ['বিসিএস প্রস্তুতি গাইড', 'সাধারণ জ্ঞান সমগ্র', 'বাংলা ব্যাকরণ ও রচনা', 'গাণিতিক যুক্তি সমাধান', 'চাকরির পরীক্ষা সহায়িকা'],
  'ভ্রমণ': ['পাহাড়ের ডাকে', 'সমুদ্রতীরে কিছুদিন', 'বাংলার পথে প্রান্তরে', 'ভ্রমণকাহিনী সমগ্র', 'দূর পাহাড়ের দেশে'],
  'রান্না': ['ঘরোয়া রান্নার বই', 'বাঙালি রান্নার ঐতিহ্য', 'উৎসবের রেসিপি', 'রোজকার রান্নাবান্না', 'মিষ্টান্ন তৈরির কৌশল'],
  'জীবনী': ['একজন মানুষের গল্প', 'সংগ্রামী জীবনের কথা', 'আলোকিত জীবনের পথে', 'স্মৃতিকথা', 'জীবনের বাঁকে বাঁকে'],
  'লোককাহিনী': ['ঠাকুরমার ঝুলি থেকে', 'গ্রামবাংলার গল্প', 'রূপকথার রাজ্য', 'লোকজ গল্পসমগ্র', 'দাদুর মুখের গল্প'],
};

const descTemplates = [
  (t) => `"${t}" একটি হৃদয়স্পর্শী রচনা যা পাঠককে এক ভিন্ন জগতে নিয়ে যায়। লেখকের সাবলীল ভাষাশৈলী ও গভীর পর্যবেক্ষণ এই বইটিকে করে তুলেছে অনন্য। প্রতিটি অধ্যায়ে রয়েছে নতুন উপলব্ধির ছোঁয়া।`,
  (t) => `"${t}" বইটিতে লেখক তুলে ধরেছেন জীবনের নানা রঙ ও বাস্তবতা। এটি এমন একটি রচনা যা পাঠ শেষেও মনের মধ্যে রেখাপাত করে। বাংলা সাহিত্যের অন্যতম উল্লেখযোগ্য সংযোজন।`,
  (t) => `গভীর মমত্ববোধ ও নিখুঁত বর্ণনায় রচিত "${t}" বইটি পাঠকপ্রিয়তার শীর্ষে অবস্থান করছে। এতে রয়েছে চরিত্রের গভীরতা ও কাহিনির অনবদ্য বুনন।`,
  (t) => `"${t}" এক অসাধারণ পাঠ অভিজ্ঞতা প্রদান করে। লেখকের পর্যবেক্ষণ ক্ষমতা ও বর্ণনাভঙ্গি বইটিকে করে তুলেছে আকর্ষণীয় ও চিন্তাশীল পাঠকদের জন্য আবশ্যক পাঠ্য।`,
];

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const gradients = [
  'from-brand-600 via-brand-700 to-brand-900',
  'from-gold-500 via-gold-600 to-brand-700',
  'from-emerald2-600 via-emerald2-700 to-brand-800',
  'from-brand-500 via-gold-600 to-brand-800',
  'from-emerald2-500 via-brand-600 to-brand-900',
  'from-gold-400 via-brand-600 to-brand-900',
];

function generateBooks(count = 60) {
  const books = [];
  let idx = 0;
  for (const cat of categories) {
    const titles = titleParts[cat.name] || ['নাম না জানা বই'];
    const perCat = Math.ceil(count / categories.length);
    for (let i = 0; i < perCat && books.length < count; i++) {
      const title = titles[i % titles.length] + (i >= titles.length ? ` - ${Math.floor(i / titles.length) + 1}` : '');
      const author = seededShuffle(authors, idx + 3)[0];
      const publisher = seededShuffle(publishers, idx + 7)[0];
      const desc = descTemplates[idx % descTemplates.length](title);
      const rating = (3.5 + ((idx * 13) % 15) / 10).toFixed(1);
      const reviewCount = 5 + ((idx * 17) % 250);
      const pages = 80 + ((idx * 23) % 400);
      const price = [120, 150, 180, 200, 250, 300, 350, 400][idx % 8];
      const isFree = idx % 11 === 0;
      const isDiscounted = idx % 5 === 0;
      const discountPercent = isDiscounted ? [10, 15, 20, 25, 30][idx % 5] : 0;
      const isNew = idx % 6 === 0;
      const isPopular = idx % 4 === 0;
      const isEditorChoice = idx % 7 === 0;
      const year = 2018 + (idx % 7);

      books.push({
        id: `book-${idx + 1}`,
        title,
        slug: `book-${idx + 1}`,
        authorId: author.id,
        authorName: author.name,
        publisherId: publisher.id,
        publisherName: publisher.name,
        category: cat.name,
        categorySlug: cat.slug,
        description: desc,
        longDescription: `${desc} এছাড়াও বইটিতে রয়েছে একাধিক উপ-কাহিনি যা মূল গল্পের সাথে নিবিড়ভাবে সম্পর্কিত। লেখক অত্যন্ত যত্ন সহকারে প্রতিটি চরিত্র অঙ্কন করেছেন, যা পাঠকের মনে দীর্ঘস্থায়ী প্রভাব ফেলে।`,
        rating: Number(rating),
        reviewCount,
        pages,
        price,
        isFree,
        isDiscounted,
        discountPercent,
        discountedPrice: isDiscounted ? Math.round(price * (1 - discountPercent / 100)) : price,
        isNew,
        isPopular,
        isEditorChoice,
        year,
        language: 'বাংলা',
        gradient: gradients[idx % gradients.length],
        tableOfContents: Array.from({ length: 8 + (idx % 6) }, (_, ci) => `অধ্যায় ${ci + 1}: ${['শুরুর কথা', 'নতুন মোড়', 'অন্ধকার সময়', 'আশার আলো', 'বিপর্যয়', 'সিদ্ধান্তের মুহূর্ত', 'পরিণতির পথে', 'শেষ কথা', 'উপসংহার', 'পরিশিষ্ট'][ci % 10]}`),
      });
      idx++;
    }
  }
  return books.slice(0, count);
}

export const books = generateBooks(60);

books.forEach((b) => {
  const author = authors.find((a) => a.id === b.authorId);
  if (author) author.booksCount++;
  const publisher = publishers.find((p) => p.id === b.publisherId);
  if (publisher) publisher.booksCount++;
});
