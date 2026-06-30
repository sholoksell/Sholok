function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const tournaments = [
  { id: "t1", name: "বাংলাদেশ প্রিমিয়ার লীগ (BPL)", sport: "ক্রিকেট", status: "চলমান", teams: 7, icon: "🏏" },
  { id: "t2", name: "বাংলাদেশ প্রিমিয়ার ফুটবল লীগ", sport: "ফুটবল", status: "চলমান", teams: 12, icon: "⚽" },
  { id: "t3", name: "জাতীয় ক্রিকেট লীগ", sport: "ক্রিকেট", status: "আসন্ন", teams: 8, icon: "🏆" },
  { id: "t4", name: "ঢাকা প্রিমিয়ার লীগ", sport: "ক্রিকেট", status: "সম্পন্ন", teams: 12, icon: "🎖️" },
  { id: "t5", name: "এশিয়া কাপ", sport: "ক্রিকেট", status: "আসন্ন", teams: 6, icon: "🌏" },
  { id: "t6", name: "সাফ চ্যাম্পিয়নশিপ", sport: "ফুটবল", status: "আসন্ন", teams: 8, icon: "🥇" },
  { id: "t7", name: "জাতীয় হকি লীগ", sport: "হকি", status: "চলমান", teams: 6, icon: "🏑" },
  { id: "t8", name: "জাতীয় কাবাডি চ্যাম্পিয়নশিপ", sport: "কাবাডি", status: "চলমান", teams: 10, icon: "🤼" },
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `t${i + 9}`,
    name: `আঞ্চলিক টুর্নামেন্ট ${i + 1}`,
    sport: ["ব্যাডমিন্টন", "অ্যাথলেটিক্স", "ভলিবল"][i % 3],
    status: ["চলমান", "আসন্ন", "সম্পন্ন"][i % 3],
    teams: 4 + (i % 8),
    icon: "🏅",
  })),
];

export const videos = Array.from({ length: 100 }).map((_, i) => {
  const rand = seededRandom(i + 900);
  const types = ["হাইলাইটস", "সাক্ষাৎকার", "সংবাদ সম্মেলন", "অনুশীলন", "ফ্যান ভিডিও"];
  return {
    id: `video-${i + 1}`,
    title: `সেরা মুহূর্ত: ম্যাচ হাইলাইটস #${i + 1}`,
    type: types[Math.floor(rand() * types.length)],
    duration: `${Math.floor(rand() * 10) + 2}:${String(Math.floor(rand() * 60)).padStart(2, "0")}`,
    views: Math.floor(rand() * 200000),
    thumbnail: "🎬",
    date: new Date(Date.now() - rand() * 90 * 86400000).toISOString(),
  };
});

export const stadiums = [
  { id: "s1", name: "শের-ই-বাংলা জাতীয় ক্রিকেট স্টেডিয়াম", city: "ঢাকা", capacity: 25000 },
  { id: "s2", name: "জহুর আহমেদ চৌধুরী স্টেডিয়াম", city: "চট্টগ্রাম", capacity: 20000 },
  { id: "s3", name: "সিলেট আন্তর্জাতিক ক্রিকেট স্টেডিয়াম", city: "সিলেট", capacity: 18000 },
  { id: "s4", name: "বঙ্গবন্ধু জাতীয় স্টেডিয়াম", city: "ঢাকা", capacity: 36000 },
  { id: "s5", name: "বসুন্ধরা কিংস অ্যারেনা", city: "ঢাকা", capacity: 18000 },
  { id: "s6", name: "শেখ আবু নাসের স্টেডিয়াম", city: "খুলনা", capacity: 15000 },
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `s${i + 7}`,
    name: `জেলা স্টেডিয়াম ${i + 1}`,
    city: ["রাজশাহী", "বরিশাল", "রংপুর", "কুমিল্লা", "ময়মনসিংহ"][i % 5],
    capacity: 5000 + i * 500,
  })),
];

export const fanComments = Array.from({ length: 500 }).map((_, i) => {
  const rand = seededRandom(i + 1500);
  const texts = [
    "অসাধারণ পারফরম্যান্স! গর্বিত বাংলাদেশ 🇧🇩",
    "আজকের ম্যাচটা সত্যিই দেখার মতো ছিল",
    "পরের ম্যাচেও এই ছন্দ ধরে রাখুক টাইগাররা",
    "অধিনায়কের সিদ্ধান্তগুলো দারুণ ছিল",
    "তরুণ খেলোয়াড়দের পারফরম্যান্স আশাব্যঞ্জক",
  ];
  return {
    id: `comment-${i + 1}`,
    user: `ফ্যান${i + 1}`,
    text: texts[Math.floor(rand() * texts.length)],
    likes: Math.floor(rand() * 500),
    date: new Date(Date.now() - rand() * 30 * 86400000).toISOString(),
  };
});

export const polls = Array.from({ length: 100 }).map((_, i) => {
  const rand = seededRandom(i + 2000);
  return {
    id: `poll-${i + 1}`,
    question: `আজকের ম্যাচে কে জিতবে বলে আপনার মনে হয়? #${i + 1}`,
    options: [
      { label: "বাংলাদেশ", votes: Math.floor(rand() * 5000) },
      { label: "প্রতিপক্ষ", votes: Math.floor(rand() * 5000) },
    ],
  };
});

export const weather = {
  city: "ঢাকা",
  temp: 31,
  condition: "আংশিক মেঘলা",
  humidity: 78,
  wind: "১২ কিমি/ঘ",
  groundCondition: "ভালো, ব্যাটিং সহায়ক উইকেট",
  timeline: Array.from({ length: 8 }).map((_, i) => ({
    time: `${9 + i}:00`,
    temp: 28 + Math.floor(Math.sin(i) * 4) + 4,
  })),
};
