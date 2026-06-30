const names = [
  "সাকিব আল হাসান", "তামিম ইকবাল", "মুশফিকুর রহিম", "মাহমুদউল্লাহ রিয়াদ",
  "লিটন দাস", "মেহেদী হাসান মিরাজ", "তাসকিন আহমেদ", "মুস্তাফিজুর রহমান",
  "নাজমুল হোসেন শান্ত", "তাওহীদ হৃদয়", "শরিফুল ইসলাম", "নুরুল হাসান সোহান",
  "এবাদত হোসেন", "ইয়াসির আলী চৌধুরী", "আফিফ হোসেন", "শামীম হোসেন পাটোয়ারী",
  "জামাল ভূঁইয়া", "তপু বর্মণ", "রাকিব হোসেন", "মোরসালিন",
  "ইব্রাহিম হোসেন সোহাগ", "সাদ উদ্দিন", "মতিন মিয়া", "রহমত মিয়া",
  "এনামুল হক বিজয়", "মোসাদ্দেক হোসেন সৈকত", "নাসুম আহমেদ", "হাসান মাহমুদ",
  "শহিদুল ইসলাম", "তানজিম হাসান সাকিব",
];

const sports = ["ক্রিকেট", "ফুটবল"];
const positions = {
  "ক্রিকেট": ["ব্যাটসম্যান", "বোলার", "অলরাউন্ডার", "উইকেটরক্ষক"],
  "ফুটবল": ["ফরোয়ার্ড", "মিডফিল্ডার", "ডিফেন্ডার", "গোলরক্ষক"],
};
const cities = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর", "কুমিল্লা"];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const players = Array.from({ length: 150 }).map((_, i) => {
  const rand = seededRandom(i + 1);
  const sport = sports[i % 2];
  const name = names[i % names.length] + (i >= names.length ? ` (${Math.floor(i / names.length) + 1})` : "");
  return {
    id: `player-${i + 1}`,
    name,
    sport,
    position: positions[sport][Math.floor(rand() * positions[sport].length)],
    age: 19 + Math.floor(rand() * 18),
    city: cities[Math.floor(rand() * cities.length)],
    jersey: 1 + Math.floor(rand() * 99),
    matches: 20 + Math.floor(rand() * 280),
    runs: sport === "ক্রিকেট" ? Math.floor(rand() * 8000) : null,
    wickets: sport === "ক্রিকেট" ? Math.floor(rand() * 200) : null,
    goals: sport === "ফুটবল" ? Math.floor(rand() * 80) : null,
    assists: sport === "ফুটবল" ? Math.floor(rand() * 60) : null,
    average: (20 + rand() * 35).toFixed(2),
    rating: (6 + rand() * 3.9).toFixed(1),
    avatar: "🏃",
    form: Array.from({ length: 6 }).map(() => Math.floor(rand() * 100)),
  };
});

export const getPlayerById = (id) => players.find((p) => p.id === id);
