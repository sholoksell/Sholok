import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import SectionTitle from "../components/common/SectionTitle";
import MatchCard from "../components/common/MatchCard";
import NewsCard from "../components/common/NewsCard";
import AnimatedCounter from "../components/common/AnimatedCounter";

import { liveMatches, upcomingMatches, recentResults, matches } from "../data/matches";
import { trendingNews, news } from "../data/news";
import { videos, tournaments } from "../data/misc";
import { teams } from "../data/teams";
import { players } from "../data/players";

const heroSlides = [
  {
    title: "বাংলাদেশ প্রিমিয়ার লীগ ২০২৬",
    subtitle: "সেরা তারকাদের লড়াই, দেখুন লাইভ স্কোর সাথে সাথে",
    emoji: "🏏",
    gradient: "from-[#006A4E] to-[#0b1220]",
  },
  {
    title: "এশিয়া কাপের প্রস্তুতিতে বাংলাদেশ",
    subtitle: "জাতীয় দলের সর্বশেষ খবর ও বিশ্লেষণ",
    emoji: "🌏",
    gradient: "from-[#F42A41] to-[#0b1220]",
  },
  {
    title: "বসুন্ধরা কিংসের অপরাজেয় যাত্রা",
    subtitle: "ফুটবল লীগের পূর্ণাঙ্গ আপডেট",
    emoji: "⚽",
    gradient: "from-[#F2B705] to-[#0b1220]",
  },
];

const bdMatches = matches.filter((m) => m.home.id.startsWith("bd-") || m.away.id.startsWith("bd-")).slice(0, 6);

export default function Home() {
  return (
    <div className="space-y-16 pb-10">
      {/* Hero */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="rounded-b-3xl overflow-hidden"
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className={`bg-gradient-to-br ${slide.gradient} h-[420px] md:h-[480px] flex items-center`}>
                <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-4">
                      🔴 খেলারবাংলা এক্সক্লুসিভ
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-white/80 mb-6 max-w-md">{slide.subtitle}</p>
                    <div className="flex gap-3">
                      <Link
                        to="/live-score"
                        className="px-5 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:scale-105 transition-transform"
                      >
                        লাইভ দেখুন
                      </Link>
                      <Link
                        to="/news"
                        className="px-5 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        সর্বশেষ খবর
                      </Link>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.7 }}
                    className="hidden md:flex justify-center text-[200px] drop-shadow-2xl select-none"
                  >
                    {slide.emoji}
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Stats counters */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "মোট ম্যাচ", value: matches.length },
            { label: "নিবন্ধিত দল", value: teams.length },
            { label: "খেলোয়াড়", value: players.length },
            { label: "সংবাদ প্রতিবেদন", value: news.length },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <p className="text-3xl font-extrabold text-gradient-bd">
                <AnimatedCounter value={s.value} suffix="+" />
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Score */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionTitle icon="🔴" title="লাইভ স্কোর" subtitle="এই মুহূর্তে চলছে যেসব ম্যাচ" viewAllTo="/live-score" />
        {liveMatches.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">
            এই মুহূর্তে কোনো লাইভ ম্যাচ নেই। আজকের ম্যাচগুলো দেখুন নিচে।
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.slice(0, 6).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* Today's matches */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionTitle icon="📅" title="আজকের ম্যাচ" subtitle="আসন্ন ও আজকের সকল ম্যাচসূচি" viewAllTo="/schedule" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMatches.slice(0, 6).map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* Bangladesh section */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionTitle icon="🇧🇩" title="বাংলাদেশের খেলা" subtitle="জাতীয় দলের ম্যাচ ও পারফরম্যান্স" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bdMatches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* Trending news */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionTitle icon="🔥" title="ট্রেন্ডিং সংবাদ" subtitle="সবচেয়ে বেশি পঠিত প্রতিবেদন" viewAllTo="/news" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingNews.slice(0, 8).map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </div>
      </section>

      {/* Popular videos */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionTitle icon="🎬" title="জনপ্রিয় ভিডিও" subtitle="সেরা হাইলাইটস ও সাক্ষাৎকার" viewAllTo="/videos" />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
          {videos.slice(0, 10).map((v) => (
            <motion.div
              key={v.id}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-3 min-w-[220px] shrink-0"
            >
              <div className="h-32 rounded-xl bg-gradient-to-br from-[#006A4E]/30 to-[#F2B705]/20 flex items-center justify-center text-4xl mb-2 relative">
                {v.thumbnail}
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/70 px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-2">{v.title}</p>
              <p className="text-[11px] text-gray-500 mt-1">{v.views.toLocaleString("bn-BD")} ভিউ</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent results / Upcoming */}
      <section className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8">
        <div>
          <SectionTitle icon="✅" title="সাম্প্রতিক ফলাফল" />
          <div className="space-y-3">
            {recentResults.slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
        <div>
          <SectionTitle icon="⏳" title="আগামী ম্যাচ" />
          <div className="space-y-3">
            {upcomingMatches.slice(6, 10).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured tournaments */}
      <section className="max-w-7xl mx-auto px-4">
        <SectionTitle icon="🏆" title="ফিচারড টুর্নামেন্ট" subtitle="চলমান ও আসন্ন টুর্নামেন্টসমূহ" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tournaments.slice(0, 8).map((t) => (
            <motion.div key={t.id} whileHover={{ y: -4 }} className="glass rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">{t.icon}</div>
              <h3 className="text-sm font-bold text-white">{t.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.sport} • {t.teams} দল</p>
              <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-[#006A4E]/30 text-[#2dd4a7]">
                {t.status}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fan favorites teaser */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="glass rounded-3xl p-8 text-center bg-gradient-to-br from-[#006A4E]/10 to-[#F2B705]/10">
          <h2 className="text-2xl font-bold text-white mb-2">ফ্যানদের পছন্দ</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            পোল দিন, আলোচনায় অংশ নিন এবং প্রিয় দল-খেলোয়াড়দের সমর্থন করুন ফ্যান জোনে।
          </p>
          <Link
            to="/fan-zone"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#006A4E] to-[#F2B705] text-white font-semibold hover:scale-105 transition-transform"
          >
            ফ্যান জোনে যান
          </Link>
        </div>
      </section>
    </div>
  );
}
