import { teams } from "./teams";

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const cricketTeams = teams.filter((t) => t.sport === "ক্রিকেট");
const footballTeams = teams.filter((t) => t.sport === "ফুটবল");

const venues = [
  "শের-ই-বাংলা জাতীয় ক্রিকেট স্টেডিয়াম, ঢাকা",
  "জহুর আহমেদ চৌধুরী স্টেডিয়াম, চট্টগ্রাম",
  "সিলেট আন্তর্জাতিক ক্রিকেট স্টেডিয়াম",
  "শেখ আবু নাসের স্টেডিয়াম, খুলনা",
  "বঙ্গবন্ধু জাতীয় স্টেডিয়াম, ঢাকা",
  "বসুন্ধরা কিংস অ্যারেনা",
];

function makeMatch(i) {
  const rand = seededRandom(i + 100);
  const isCricket = i % 2 === 0;
  const pool = isCricket ? cricketTeams : footballTeams;
  let home = pool[Math.floor(rand() * pool.length)];
  let away = pool[Math.floor(rand() * pool.length)];
  while (away.id === home.id) away = pool[Math.floor(rand() * pool.length)];

  const dayOffset = Math.floor(rand() * 60) - 20;
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);

  const statusRoll = rand();
  const status = dayOffset < 0 ? "সম্পন্ন" : statusRoll > 0.85 ? "লাইভ" : "আসন্ন";

  const homeScore = isCricket
    ? `${120 + Math.floor(rand() * 100)}/${Math.floor(rand() * 10)}`
    : Math.floor(rand() * 5);
  const awayScore = isCricket
    ? `${110 + Math.floor(rand() * 100)}/${Math.floor(rand() * 10)}`
    : Math.floor(rand() * 5);

  return {
    id: `match-${i + 1}`,
    sport: isCricket ? "ক্রিকেট" : "ফুটবল",
    tournament: isCricket ? "বাংলাদেশ প্রিমিয়ার লীগ (BPL)" : "বাংলাদেশ প্রিমিয়ার ফুটবল লীগ",
    home,
    away,
    venue: venues[Math.floor(rand() * venues.length)],
    date: date.toISOString(),
    status,
    homeScore: status === "আসন্ন" ? null : homeScore,
    awayScore: status === "আসন্ন" ? null : awayScore,
    overs: isCricket && status === "লাইভ" ? `${(8 + rand() * 10).toFixed(1)} ওভার` : null,
    time: status === "ফুটবল" ? null : null,
    matchType: isCricket ? "টি-টোয়েন্টি" : "লীগ ম্যাচ",
    playerOfMatch: home.captain,
    winProbability: { home: Math.floor(30 + rand() * 40), away: 0 },
  };
}

export const matches = Array.from({ length: 300 }).map((_, i) => makeMatch(i));
matches.forEach((m) => (m.winProbability.away = 100 - m.winProbability.home));

export const liveMatches = matches.filter((m) => m.status === "লাইভ");
export const upcomingMatches = matches
  .filter((m) => m.status === "আসন্ন")
  .sort((a, b) => new Date(a.date) - new Date(b.date));
export const recentResults = matches
  .filter((m) => m.status === "সম্পন্ন")
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const getMatchById = (id) => matches.find((m) => m.id === id);
