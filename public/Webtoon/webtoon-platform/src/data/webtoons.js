const authorColors = [
  "from-pink-500 to-rose-600", "from-indigo-500 to-purple-600", "from-cyan-500 to-teal-600",
  "from-amber-500 to-orange-600", "from-green-500 to-emerald-600", "from-violet-500 to-purple-700",
  "from-blue-500 to-indigo-700", "from-red-500 to-rose-700", "from-teal-500 to-cyan-600",
  "from-orange-500 to-amber-600", "from-purple-500 to-violet-700", "from-emerald-500 to-green-600",
  "from-sky-500 to-blue-600", "from-fuchsia-500 to-pink-600", "from-lime-500 to-green-600",
  "from-rose-500 to-pink-600", "from-yellow-500 to-amber-600", "from-indigo-600 to-blue-700",
  "from-slate-500 to-gray-700", "from-cyan-600 to-teal-700",
];

const authorInitials = ["রা", "তা", "মি", "কা", "না", "সা", "প্রি", "র", "সু", "আ", "ফা", "তি", "ই", "রি", "আব", "সো", "না", "মা", "শা", "অ"];

export const authors = [
  { id: 1, name: "রাহেলা আক্তার", initials: "রা", avatarColor: authorColors[0], followers: 125000, bio: "রোমান্স ও ফ্যান্টাসি শিল্পী, ঢাকা" },
  { id: 2, name: "তানভীর হাসান", initials: "তা", avatarColor: authorColors[1], followers: 98000, bio: "অ্যাকশন ও অ্যাডভেঞ্চার গল্পকার" },
  { id: 3, name: "মিরা সুলতানা", initials: "মি", avatarColor: authorColors[2], followers: 87000, bio: "রহস্য ও থ্রিলার বিশেষজ্ঞ" },
  { id: 4, name: "কামরুল ইসলাম", initials: "কা", avatarColor: authorColors[3], followers: 210000, bio: "সায়েন্স ফিকশন ও সাইবারপাংক" },
  { id: 5, name: "নাদিয়া রহমান", initials: "না", avatarColor: authorColors[4], followers: 65000, bio: "ভৌতিক ও অতিপ্রাকৃত গল্পকার" },
  { id: 6, name: "সাজিদ আহমেদ", initials: "সা", avatarColor: authorColors[5], followers: 145000, bio: "কমেডি ও স্লাইস অফ লাইফ" },
  { id: 7, name: "প্রিয়া চক্রবর্তী", initials: "প্রি", avatarColor: authorColors[6], followers: 78000, bio: "ফ্যান্টাসি ও লোককাহিনী" },
  { id: 8, name: "রফিকুল হক", initials: "র", avatarColor: authorColors[7], followers: 190000, bio: "ক্রীড়া ও নাটক কমিকস" },
  { id: 9, name: "সুমাইয়া বেগম", initials: "সু", avatarColor: authorColors[8], followers: 230000, bio: "ঐতিহাসিক ও সাংস্কৃতিক গল্প" },
  { id: 10, name: "আরিফ হোসেন", initials: "আ", avatarColor: authorColors[9], followers: 115000, bio: "রোমান্স ও স্কুল লাইফ" },
  { id: 11, name: "ফারহান আলম", initials: "ফা", avatarColor: authorColors[10], followers: 55000, bio: "ডার্ক ফ্যান্টাসি ও গথিক" },
  { id: 12, name: "তিশা মাহমুদ", initials: "তি", avatarColor: authorColors[11], followers: 88000, bio: "কমেডি ও অ্যাডভেঞ্চার" },
  { id: 13, name: "ইমরান খান", initials: "ই", avatarColor: authorColors[12], followers: 174000, bio: "সাইবারপাংক ও নিয়ন নান্দনিকতা" },
  { id: 14, name: "রিমা দেব", initials: "রি", avatarColor: authorColors[13], followers: 92000, bio: "মার্শাল আর্টস ও অ্যাকশন" },
  { id: 15, name: "আবির চৌধুরী", initials: "আব", avatarColor: authorColors[14], followers: 67000, bio: "মনস্তাত্ত্বিক থ্রিলার শিল্পী" },
  { id: 16, name: "সোহানা ইসলাম", initials: "সো", avatarColor: authorColors[15], followers: 143000, bio: "সুপারহিরো ও পাওয়ার ফ্যান্টাসি" },
  { id: 17, name: "নাফিস উদ্দিন", initials: "না", avatarColor: authorColors[16], followers: 109000, bio: "স্লাইস অফ লাইফ ও হৃদয়গ্রাহী গল্প" },
  { id: 18, name: "মাহফুজা খানম", initials: "মা", avatarColor: authorColors[17], followers: 83000, bio: "অ্যাডভেঞ্চার ও অন্বেষণ" },
  { id: 19, name: "শাহরিয়ার রহমান", initials: "শা", avatarColor: authorColors[18], followers: 121000, bio: "রোমান্স ও নাটকীয় গল্প" },
  { id: 20, name: "অপূর্ব বিশ্বাস", initials: "অ", avatarColor: authorColors[19], followers: 158000, bio: "অ্যাকশন ও সায়েন্স ফিকশন" },
];

const genreColors = {
  "রোমান্স": { bg: "from-pink-500 to-rose-600", text: "text-pink-300" },
  "ফ্যান্টাসি": { bg: "from-violet-500 to-purple-700", text: "text-violet-300" },
  "অ্যাকশন": { bg: "from-orange-500 to-red-600", text: "text-orange-300" },
  "নাটক": { bg: "from-blue-500 to-indigo-700", text: "text-blue-300" },
  "কমেডি": { bg: "from-yellow-400 to-amber-500", text: "text-yellow-300" },
  "ভৌতিক": { bg: "from-gray-700 to-gray-900", text: "text-gray-300" },
  "সায়েন্স ফিকশন": { bg: "from-cyan-500 to-teal-600", text: "text-cyan-300" },
  "থ্রিলার": { bg: "from-slate-600 to-slate-800", text: "text-slate-300" },
  "ক্রীড়া": { bg: "from-green-500 to-emerald-700", text: "text-green-300" },
  "অ্যাডভেঞ্চার": { bg: "from-amber-500 to-orange-600", text: "text-amber-300" },
  "জীবনকথা": { bg: "from-lime-400 to-green-500", text: "text-lime-300" },
  "রহস্য": { bg: "from-purple-600 to-indigo-800", text: "text-purple-300" },
  "ঐতিহাসিক": { bg: "from-amber-700 to-yellow-800", text: "text-amber-300" },
  "স্কুল জীবন": { bg: "from-sky-400 to-blue-500", text: "text-sky-300" },
};

const coverColors = [
  "from-violet-600 via-purple-700 to-indigo-800",
  "from-pink-500 via-rose-600 to-red-700",
  "from-cyan-500 via-teal-600 to-blue-700",
  "from-amber-500 via-orange-600 to-red-600",
  "from-green-500 via-emerald-600 to-teal-700",
  "from-indigo-500 via-purple-600 to-pink-600",
  "from-blue-600 via-indigo-700 to-violet-800",
  "from-rose-500 via-pink-600 to-fuchsia-700",
  "from-yellow-500 via-amber-600 to-orange-700",
  "from-teal-500 via-cyan-600 to-sky-700",
];


const titles = [
  "পদ্মার পাড়ে", "ঢাকার রাতে", "সোনালি স্বপ্ন", "বাঘের ডাক", "নদীর টান",
  "মুক্তিযুদ্ধের বীর", "সুন্দরবনের রহস্য", "ঢাকার অন্ধকারে", "আলোর পথে", "রাজশাহীর মেয়ে",
  "চট্টগ্রামের সন্ধ্যা", "মেঘনার স্রোত", "বরিশালের জেলে", "সিলেটের চা বাগান", "কুমিল্লার প্রেম",
  "খুলনার বাঘ", "ময়মনসিংহের গান", "ফরিদপুরের মাঠ", "টাঙ্গাইলের তাঁতি", "নোয়াখালীর ঢেউ",
  "শীতলক্ষ্যার কান্না", "ব্রহ্মপুত্রের বুকে", "তিস্তার জলে", "কর্ণফুলীর স্বপ্ন", "হালদার রহস্য",
  "একাত্তরের আগুন", "বঙ্গবন্ধুর স্বপ্ন", "ভাষার লড়াই", "লাল-সবুজের পতাকা", "মার বুলবুলি",
  "নীল আকাশের নিচে", "সোনার বাংলা", "পাটের সুতো", "হলুদ সরিষার মাঠ", "বাঁশের বাঁশরি",
  "গ্রামের ছেলে", "শহরের মায়া", "রিকশাওয়ালার স্বপ্ন", "চায়ের দোকান", "নৌকার গান",
  "ইলিশের গন্ধ", "শাপলার হাসি", "কাঁঠালের ছায়া", "আমের মুকুল", "লিচুর বাগান",
  "বর্ষার প্রেম", "শরতের মেঘ", "হেমন্তের ধান", "শীতের কুয়াশা", "বসন্তের ফুল",
  "ঢাকার জ্যামে", "বাসের ছাদে", "ট্রেনের জানালা", "লঞ্চের ডেকে", "নৌকাবাইচ",
  "কবাডি মাঠে", "হাডুডুর লড়াই", "ক্রিকেটের স্বপ্ন", "ফুটবলের মাঠ", "দাবার চাল",
  "রঙ তুলির গান", "মাটির পুতুল", "জামদানির সুতো", "মসলিনের স্বপ্ন", "নকশিকাঁথার গল্প",
  "বাউলের সুর", "লালনের পথে", "রবির আলো", "নজরুলের আগুন", "জীবনানন্দের মাঠ",
  "মদিনার পথে", "হজের স্বপ্ন", "ঈদের আনন্দ", "রমজানের রাত", "শবে বরাত",
  "দুর্গাপূজার মেলা", "ঈদুল আজহার ভোর", "পহেলা বৈশাখ", "একুশের শহীদ", "স্বাধীনতার সূর্য",
  "রানার ছেলে", "দস্যু বনহুর", "মাসুদ রানা", "তিন গোয়েন্দা", "ক্যাপ্টেন মুসা",
  "ব্লাড স্টোন", "ধূমকেতু", "কালো বজ্র", "আলোর ফাঁদ", "লোহার মানুষ",
  "রাজার মেয়ে", "রাজকুমারের পথ", "সোনার কাঠি", "রুপার বাঁশি", "নীলমণি হার",
  "জাদুকরের খেলা", "পরীর দেশ", "দৈত্যের গুহা", "রাক্ষসের রাজ্য", "মায়াবী বন",
  "গোয়েন্দা শফিক", "ডিটেক্টিভ রানা", "গোয়েন্দা মিতা", "তদন্তকারী", "রহস্যভেদী",
];

const descriptions = [
  "একজন তরুণ মুক্তিযোদ্ধার সন্তান যে তার বাবার হারানো ডায়েরি খুঁজতে গিয়ে একাত্তরের অজানা সত্য আবিষ্কার করে — যা দেশের ইতিহাস বদলে দিতে পারে।",
  "ঢাকার পুরান ঢাকায় বেড়ে ওঠা এক মেয়ে যে স্বপ্ন দেখে বড় শিল্পী হওয়ার, কিন্তু পথে পদে বাধা আসে পরিবার, সমাজ আর নিজের সংশয়।",
  "সুন্দরবনের গভীরে হারিয়ে যাওয়া এক গোয়েন্দা যে বাঘ ও মানুষ উভয়ের মাঝে লুকিয়ে থাকা রহস্যের সন্ধান করে।",
  "মুক্তিযুদ্ধের সময়কালে দুই পরিবারের মাঝে গড়ে ওঠা প্রেম এবং বিচ্ছেদের এক মর্মস্পর্শী গল্প।",
  "পদ্মার চরে জন্ম নেওয়া এক ছেলে যে নদীর টানে ভেসে যায় শহর থেকে শহরে, জীবনের মানে খুঁজতে খুঁজতে।",
  "ঢাকার ব্যস্ত রাস্তায় রিকশা চালানো এক যুবক যার ভেতরে লুকিয়ে আছে অসাধারণ এক প্রতিভা — শুধু সুযোগের অপেক্ষা।",
  "চট্টগ্রামের পাহাড়ি পথে এক আদিবাসী মেয়ের লড়াইয়ের গল্প — নিজের সংস্কৃতি ও পরিচয় রক্ষার জন্য।",
  "ঢাকার একটি সরকারি স্কুলের ছাত্রছাত্রীরা যখন তাদের স্কুল বাঁচাতে অসম্ভব লড়াইয়ে নামে।",
  "একজন বাংলাদেশি বিজ্ঞানী যে এমন একটি আবিষ্কার করেন যা পুরো পৃথিবীর ভাগ্য বদলে দিতে পারে — কিন্তু এর পেছনে ধাওয়া করছে বহুজাতিক কোম্পানি।",
  "গ্রামের সহজ-সরল এক মেয়ে যে ঢাকায় আসে স্বপ্ন নিয়ে, কিন্তু শহরের জটিলতায় হারিয়ে যেতে যেতে নিজেকে নতুন করে খুঁজে পায়।",
];

const tags = ["রোমান্স", "ফ্যান্টাসি", "অ্যাকশন", "নাটক", "কমেডি", "রহস্য", "থ্রিলার", "ভৌতিক", "সায়েন্স ফিকশন", "স্কুল জীবন", "ক্রীড়া", "অ্যাডভেঞ্চার", "ঐতিহাসিক", "জীবনকথা"];
const days = ["সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"];

export const webtoons = Array.from({ length: 100 }, (_, i) => {
  const genre = tags[i % tags.length];
  const authorId = (i % 20) + 1;
  const author = authors[authorId - 1];
  return {
    id: i + 1,
    title: titles[i] || `বাংলা কমিক ${i + 1}`,
    slug: `comic-${i + 1}`,
    author: author.name,
    authorId,
    genre,
    genres: [genre, tags[(i + 3) % tags.length]],
    coverGradient: coverColors[i % coverColors.length],
    genreColors: genreColors[genre] || genreColors["ফ্যান্টাসি"],
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    views: Math.floor(10000 + Math.random() * 2000000),
    likes: Math.floor(1000 + Math.random() * 500000),
    subscribers: Math.floor(500 + Math.random() * 300000),
    episodeCount: Math.floor(10 + Math.random() * 150),
    status: i % 5 === 0 ? "সম্পূর্ণ" : "চলমান",
    isOriginal: i % 3 === 0,
    isChallenge: i % 7 === 0,
    isFeatured: i < 10,
    isTrending: i % 4 === 0,
    isNew: i % 8 === 0,
    updateDay: days[i % 7],
    description: descriptions[i % descriptions.length],
    tags: [genre, tags[(i + 1) % tags.length], tags[(i + 2) % tags.length]],
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    ageRating: i % 6 === 0 ? "১৮+" : i % 3 === 0 ? "১৩+" : "সবার জন্য",
    language: "বাংলা",
  };
});

export const generateEpisodes = (webtoonId, count) => {
  const epTitles = ["নতুন সূচনা", "অন্ধকারের ডাক", "লুকানো সত্য", "অদৃশ্য শক্তি", "শেষ লড়াই", "নতুন আশা", "উন্মোচন", "ঝড়ের আগে", "চূড়ান্ত যুদ্ধ", "নতুন পৃথিবী"];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    webtoonId,
    number: i + 1,
    title: `পর্ব ${i + 1}: ${epTitles[i % 10]}`,
    thumbnail: null,
    views: Math.floor(5000 + Math.random() * 500000),
    likes: Math.floor(100 + Math.random() * 50000),
    comments: Math.floor(10 + Math.random() * 5000),
    releaseDate: new Date(Date.now() - (count - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    isFree: i < 5 || Math.random() > 0.3,
    duration: `${Math.floor(3 + Math.random() * 10)} মিনিট`,
    panels: Array.from({ length: Math.floor(8 + Math.random() * 15) }, (_, j) => ({
      id: j + 1,
      image: null,
      width: 800,
      height: 1200,
    })),
  }));
};

export const genres = [
  { id: 1, name: "রোমান্স", icon: "💕", color: "from-pink-500 to-rose-600", count: 234, description: "হৃদয় ছুঁয়ে যাওয়া প্রেমের গল্প" },
  { id: 2, name: "ফ্যান্টাসি", icon: "🔮", color: "from-violet-500 to-purple-700", count: 312, description: "অসম্ভব সুন্দর কল্পনার জগত" },
  { id: 3, name: "অ্যাকশন", icon: "⚡", color: "from-orange-500 to-red-600", count: 289, description: "রোমাঞ্চকর যুদ্ধ ও অ্যাডভেঞ্চার" },
  { id: 4, name: "নাটক", icon: "🎭", color: "from-blue-500 to-indigo-700", count: 198, description: "আবেগময় গল্প যা মনকে নাড়ায়" },
  { id: 5, name: "কমেডি", icon: "😂", color: "from-yellow-400 to-amber-500", count: 167, description: "হাসিতে ভরা মজার গল্প" },
  { id: 6, name: "ভৌতিক", icon: "👻", color: "from-gray-700 to-gray-900", count: 143, description: "ভয়ের রাতে রোমহর্ষক কাহিনী" },
  { id: 7, name: "সায়েন্স ফিকশন", icon: "🚀", color: "from-cyan-500 to-teal-600", count: 178, description: "বিজ্ঞানের অসাধারণ ভবিষ্যৎ জগত" },
  { id: 8, name: "থ্রিলার", icon: "🔍", color: "from-slate-600 to-slate-800", count: 156, description: "রহস্যময় সাসপেন্সের গল্প" },
  { id: 9, name: "ক্রীড়া", icon: "⚽", color: "from-green-500 to-emerald-700", count: 89, description: "মাঠে জয়-পরাজয়ের গল্প" },
  { id: 10, name: "অ্যাডভেঞ্চার", icon: "🗺️", color: "from-amber-500 to-orange-600", count: 267, description: "অজানার পথে দুঃসাহসী যাত্রা" },
  { id: 11, name: "জীবনকথা", icon: "🌸", color: "from-lime-400 to-green-500", count: 134, description: "সাধারণ জীবনের অসাধারণ মুহূর্ত" },
  { id: 12, name: "রহস্য", icon: "🕵️", color: "from-purple-600 to-indigo-800", count: 112, description: "অসম্ভব রহস্য সমাধানের গল্প" },
  { id: 13, name: "ঐতিহাসিক", icon: "📜", color: "from-amber-700 to-yellow-800", count: 78, description: "বাংলার গৌরবময় ইতিহাসের গল্প" },
  { id: 14, name: "স্কুল জীবন", icon: "🎒", color: "from-sky-400 to-blue-500", count: 203, description: "বন্ধুত্ব ও শৈশবের স্মৃতি" },
];

export const comments = [
  {
    id: 1, user: "মিনহাজ_০৭", avatarColor: "from-indigo-500 to-purple-600", initials: "মি",
    text: "ওরে বাবা! এই পর্বটা পড়ে চোখে পানি চলে এলো। লেখক সত্যিই অসাধারণ! ❤️",
    likes: 234, time: "২ ঘণ্টা আগে", isPinned: true,
    replies: [
      { id: 11, user: "সুমাইয়া_আক্তার", avatarColor: "from-pink-500 to-rose-600", initials: "সু", text: "একদম সত্যি বলেছ! আমিও কাঁদলাম 😭", likes: 89, time: "১ ঘণ্টা আগে" },
      { id: 12, user: "রাজিব_হাসান", avatarColor: "from-cyan-500 to-teal-600", initials: "রা", text: "আর্টওয়ার্কটাও অনেক সুন্দর হয়েছে 🎨", likes: 45, time: "৩০ মিনিট আগে" },
    ],
  },
  {
    id: 2, user: "তামান্না_বিথি", avatarColor: "from-amber-500 to-orange-600", initials: "তা",
    text: "শেষের twist টা দেখে মাথা ঘুরে গেল! এটা আগে থেকে বুঝতেই পারিনি 😱",
    likes: 178, time: "৪ ঘণ্টা আগে", replies: [],
  },
  {
    id: 3, user: "নাফিস_পাগলা", avatarColor: "from-green-500 to-emerald-600", initials: "না",
    text: "রাত ৩টা পর্যন্ত পড়লাম, ঘুমাতেই পারলাম না। কোনো অনুশোচনা নেই! 😂",
    likes: 456, time: "১ দিন আগে",
    replies: [
      { id: 31, user: "নিশাত_জাহান", avatarColor: "from-violet-500 to-purple-600", initials: "নি", text: "আমিও একই কাজ করেছি ভাই 🤣", likes: 123, time: "২০ ঘণ্টা আগে" },
    ],
  },
  {
    id: 4, user: "সজীব_মাহমুদ", avatarColor: "from-blue-500 to-indigo-600", initials: "স",
    text: "বাংলাদেশের ওয়েবটুনও যে এতটা ভালো হতে পারে — আগে ভাবিনি। গর্বিত! 🇧🇩",
    likes: 312, time: "২ দিন আগে", replies: [],
  },
  {
    id: 5, user: "আফরিন_নুর", avatarColor: "from-rose-500 to-pink-600", initials: "আ",
    text: "এই কমিকটা সবার পড়া উচিত। মুক্তিযুদ্ধের ইতিহাস এভাবে তুলে ধরা সত্যিই অনন্য 🌹",
    likes: 567, time: "৩ দিন আগে", replies: [],
  },
];

export const notifications = [
  { id: 1, type: "episode", title: "নতুন পর্ব এসেছে!", message: "পদ্মার পাড়ে — পর্ব ৪৭ প্রকাশিত হয়েছে!", time: "৫ মিনিট আগে", isRead: false, icon: "🎉", webtoonId: 1 },
  { id: 2, type: "trending", title: "ট্রেন্ডিং এখন", message: "ঢাকার রাতে আপনার এলাকায় ট্রেন্ড করছে!", time: "১ ঘণ্টা আগে", isRead: false, icon: "🔥", webtoonId: 2 },
  { id: 3, type: "recommendation", title: "আপনার জন্য", message: "আপনার পছন্দ অনুযায়ী: সুন্দরবনের রহস্য", time: "৩ ঘণ্টা আগে", isRead: true, icon: "⭐", webtoonId: 7 },
  { id: 4, type: "episode", title: "নতুন পর্ব!", message: "মুক্তিযুদ্ধের বীর — পর্ব ২৩ প্রকাশিত!", time: "১ দিন আগে", isRead: true, icon: "📖", webtoonId: 6 },
  { id: 5, type: "milestone", title: "অর্জন আনলক!", message: "আপনি ৫০টি পর্ব পড়েছেন! অসাধারণ! 🏆", time: "২ দিন আগে", isRead: true, icon: "🏆", webtoonId: null },
  { id: 6, type: "episode", title: "নতুন পর্ব!", message: "সোনালি স্বপ্ন — পর্ব ৩১ এসে গেছে!", time: "৩ দিন আগে", isRead: true, icon: "🎭", webtoonId: 3 },
];

export const rankings = {
  daily: webtoons.slice(0, 20).sort((a, b) => b.views - a.views),
  weekly: webtoons.slice(5, 25).sort((a, b) => b.likes - a.likes),
  monthly: webtoons.slice(10, 30).sort((a, b) => b.subscribers - a.subscribers),
  allTime: webtoons.slice(0, 30).sort((a, b) => b.rating - a.rating),
};

export const popularSearches = [
  "মুক্তিযুদ্ধ", "ঢাকার রাত", "রোমান্টিক", "ভৌতিক গল্প", "সুন্দরবন",
  "স্কুল জীবন", "ঐতিহাসিক", "রহস্য গোয়েন্দা", "পদ্মার পাড়", "বাংলাদেশ"
];

export const moodTags = [
  { label: "হাসির গল্প", color: "bg-yellow-500" },
  { label: "মাথা ঘোরানো", color: "bg-purple-500" },
  { label: "হৃদয়গ্রাহী", color: "bg-pink-500" },
  { label: "রোমাঞ্চকর", color: "bg-red-500" },
  { label: "মজাদার", color: "bg-amber-500" },
  { label: "আবেগময়", color: "bg-blue-500" },
  { label: "মহাকাব্যিক", color: "bg-indigo-500" },
  { label: "শান্তিময়", color: "bg-green-500" },
  { label: "রহস্যময়", color: "bg-gray-700" },
  { label: "অনুপ্রেরণাদায়ক", color: "bg-teal-500" },
];
