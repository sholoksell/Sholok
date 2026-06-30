const publisherNames = [
  'অনন্যা প্রকাশনী', 'কথাপ্রকাশ', 'সময় প্রকাশন', 'প্রথমা প্রকাশন', 'অন্যপ্রকাশ',
  'বাতিঘর প্রকাশনী', 'আগামী প্রকাশনী', 'ঐতিহ্য প্রকাশনী', 'মাওলা ব্রাদার্স',
  'পাঞ্জেরী পাবলিকেশন্স', 'নওরোজ কিতাবিস্তান', 'চারুলিপি প্রকাশন', 'দিব্য প্রকাশ',
  'ইত্যাদি গ্রন্থ প্রকাশ', 'অক্ষরবৃত্ত প্রকাশনী',
];

function generatePublishers(count = 15) {
  return publisherNames.slice(0, count).map((name, i) => ({
    id: `pub-${i + 1}`,
    name,
    slug: `pub-${i + 1}`,
    establishedYear: 1965 + ((i * 5) % 50),
    description: `${name} বাংলাদেশের একটি স্বনামধন্য প্রকাশনা প্রতিষ্ঠান, যা মানসম্মত সাহিত্য, গবেষণাধর্মী গ্রন্থ ও জনপ্রিয় বই প্রকাশের মাধ্যমে পাঠকসমাজে বিশেষ স্থান করে নিয়েছে।`,
    booksCount: 0,
    gradient: ['from-brand-700 to-brand-900', 'from-gold-600 to-gold-800', 'from-emerald2-700 to-emerald2-900'][i % 3],
  }));
}

export const publishers = generatePublishers(15);
