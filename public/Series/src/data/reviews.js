import { books } from './books';

const reviewerNames = [
  'রাফসান আহমেদ', 'সাবরিনা ইসলাম', 'তাহমিদ হাসান', 'নুসরাত জাহান', 'ফাহিম রহমান',
  'মৌমিতা সরকার', 'আরিফুল ইসলাম', 'সাদিয়া আক্তার', 'রাকিব হোসেন', 'তানজিলা খাতুন',
  'ইমরান কবির', 'নাফিসা চৌধুরী', 'শাহরিয়ার নাফিজ', 'লামিয়া হক', 'মাহফুজুর রহমান',
];

const comments = [
  'অসাধারণ একটি বই। লেখকের বর্ণনাভঙ্গি সত্যিই মুগ্ধ করার মতো। শেষ পাতা পর্যন্ত আগ্রহ ধরে রেখেছে।',
  'বইটি পড়ে অনেক কিছু শিখলাম। ভাষা সহজ-সরল হলেও ভাবনার গভীরতা অনেক বেশি।',
  'প্রথমে একটু ধীরগতির মনে হলেও পরের দিকে কাহিনি দারুণভাবে জমে ওঠে। রিকমেন্ড করছি।',
  'লেখকের অন্যান্য বইয়ের তুলনায় এটি আমার কাছে কিছুটা কম ভালো লেগেছে, তবে মন্দ নয়।',
  'চরিত্রগুলো এত জীবন্ত যে মনে হচ্ছিল আমিও গল্পের একটা অংশ। দারুণ লেখনী।',
  'বইটির প্রচ্ছদ যেমন সুন্দর, ভেতরের কন্টেন্টও তেমনি সমৃদ্ধ। মূল্যবান সংগ্রহ।',
  'একবার পড়া শুরু করলে শেষ না করে ওঠা যায় না। দারুণ একটি অভিজ্ঞতা।',
  'কিছু জায়গায় কাহিনি একটু টানা মনে হয়েছে, কিন্তু সামগ্রিকভাবে ভালো লেগেছে।',
  'নতুন পাঠকদের জন্য এটি একটি চমৎকার সূচনা হতে পারে। সহজবোধ্য ও আকর্ষণীয়।',
  'লেখকের গবেষণা ও পরিশ্রম স্পষ্ট বোঝা যায় প্রতিটি পাতায়। শ্রদ্ধা জানাই।',
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

function generateReviews(count = 80) {
  const list = [];
  const targetBooks = seededShuffle(books, 99).slice(0, Math.min(count, books.length));
  for (let i = 0; i < count; i++) {
    const book = targetBooks[i % targetBooks.length];
    const reviewer = reviewerNames[i % reviewerNames.length];
    const rating = 3 + ((i * 7) % 3);
    list.push({
      id: `review-${i + 1}`,
      bookId: book.id,
      reviewerName: reviewer,
      rating,
      comment: comments[i % comments.length],
      date: `২০২৪-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
      helpfulCount: (i * 13) % 80,
    });
  }
  return list;
}

export const reviews = generateReviews(80);

export function getReviewsForBook(bookId) {
  return reviews.filter((r) => r.bookId === bookId);
}
