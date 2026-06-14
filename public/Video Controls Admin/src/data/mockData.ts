import t1 from "@/assets/thumb-1.jpg";
import t2 from "@/assets/thumb-2.jpg";
import t3 from "@/assets/thumb-3.jpg";
import t4 from "@/assets/thumb-4.jpg";
import t5 from "@/assets/thumb-5.jpg";
import t6 from "@/assets/thumb-6.jpg";
import t7 from "@/assets/thumb-7.jpg";
import t8 from "@/assets/thumb-8.jpg";

export const thumbs = [t1, t2, t3, t4, t5, t6, t7, t8];

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  channelAvatar: string;
  views: string;
  uploaded: string;
  duration: string;
  category: string;
}

const channels = [
  { name: "CinemaVerse", avatar: "🎬" },
  { name: "GameZone HD", avatar: "🎮" },
  { name: "MelodyLive", avatar: "🎵" },
  { name: "TastyBites", avatar: "🍳" },
  { name: "Wanderlust", avatar: "✈️" },
  { name: "TechTalks", avatar: "💻" },
  { name: "FitFlow", avatar: "💪" },
  { name: "K-Drama Hub", avatar: "🎭" },
];

const titles = [
  "Behind the Scenes: Hollywood's Biggest Hit of the Year",
  "INSANE Pro Gameplay - Tournament Finals Highlights",
  "Live Concert: Acoustic Sessions Under The Stars",
  "30-Min Healthy Dinner Recipes That Will Change Your Life",
  "Hidden Paradise Islands You've Never Heard Of",
  "MacBook Pro M4 Review - Is It Worth The Upgrade?",
  "Full Body HIIT Workout - Burn 500 Calories at Home",
  "Top 10 Korean Dramas You Must Watch in 2025",
];

const categories = ["All", "Music", "Gaming", "Movies", "K-Drama", "Software Related", "Natural Related"];

export const CATEGORIES = categories;

export const videos: Video[] = Array.from({ length: 24 }, (_, i) => ({
  id: `v${i + 1}`,
  title: titles[i % titles.length],
  thumbnail: thumbs[i % thumbs.length],
  channel: channels[i % channels.length].name,
  channelAvatar: channels[i % channels.length].avatar,
  views: `${(Math.random() * 20).toFixed(1)}M views`,
  uploaded: `${Math.floor(Math.random() * 11) + 1} ${["days", "weeks", "months"][i % 3]} ago`,
  duration: `${Math.floor(Math.random() * 15) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
  category: categories[(i % (categories.length - 1)) + 1],
}));

export const shorts: { id: string; title: string; thumbnail: string; channel: string; likes: string }[] = [];

export const comments = [
  { id: "c1", user: "Alex Morgan", avatar: "AM", text: "This is absolutely incredible! The production quality is top-tier 🔥", time: "2 hours ago", likes: 1240 },
  { id: "c2", user: "Priya Sharma", avatar: "PS", text: "Been waiting for this drop all week. Worth every second!", time: "5 hours ago", likes: 832 },
  { id: "c3", user: "Kenji Tanaka", avatar: "KT", text: "The cinematography here is next level. Who's the DP?", time: "1 day ago", likes: 421 },
  { id: "c4", user: "Sofia Reyes", avatar: "SR", text: "Came for the title, stayed for the vibe ✨", time: "2 days ago", likes: 198 },
];
