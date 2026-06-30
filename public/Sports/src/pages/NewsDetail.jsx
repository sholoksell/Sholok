import { useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Eye, Clock } from "lucide-react";
import { getNewsById, news } from "../data/news";
import { useApp } from "../context/AppContext";
import NewsCard from "../components/common/NewsCard";

export default function NewsDetail() {
  const { newsId } = useParams();
  const item = getNewsById(newsId);
  const { bookmarks, toggleBookmark, addRecentlyViewed } = useApp();

  useEffect(() => {
    if (item) addRecentlyViewed({ id: item.id, type: "news", title: item.title });
  }, [item]); // eslint-disable-line

  if (!item) return <Navigate to="/news" replace />;

  const isBookmarked = bookmarks?.includes(item.id);
  const related = news.filter((n) => n.category === item.category && n.id !== item.id).slice(0, 3);
  const dt = new Date(item.date);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs font-semibold text-[#F2B705]">{item.category}</span>
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mt-2 leading-tight">{item.title}</h1>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
          <span>✍️ {item.author}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {dt.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} /> {item.views.toLocaleString("bn-BD")}
          </span>
          <span>📖 {item.readTime} মিনিট পড়া</span>
          <button
            onClick={() => toggleBookmark(item.id)}
            className={`ml-auto flex items-center gap-1 ${isBookmarked ? "text-[#F2B705]" : "text-gray-400 hover:text-white"}`}
          >
            <Bookmark size={16} fill={isBookmarked ? "#F2B705" : "none"} />
          </button>
        </div>

        <div className="h-72 rounded-2xl bg-gradient-to-br from-[#006A4E]/30 to-[#F2B705]/20 flex items-center justify-center text-8xl my-6">
          {item.image}
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
          <p>{item.excerpt}</p>
          <p>
            বাংলাদেশের ক্রীড়াঙ্গনে এই ঘটনাটি ব্যাপক আলোচনার জন্ম দিয়েছে। বিশেষজ্ঞরা মনে করছেন আগামী
            দিনগুলোতে এর প্রভাব আরও স্পষ্ট হবে। সমর্থকরা ইতিমধ্যে সামাজিক যোগাযোগমাধ্যমে তাদের প্রতিক্রিয়া
            জানাতে শুরু করেছেন।
          </p>
          <p>
            সংশ্লিষ্ট কর্তৃপক্ষ জানিয়েছে, আগামী সপ্তাহে এই বিষয়ে আরও বিস্তারিত তথ্য প্রকাশ করা হবে। খেলারবাংলা
            টিম বিষয়টি গভীরভাবে পর্যবেক্ষণ করছে এবং সর্বশেষ আপডেট পাঠকদের কাছে পৌঁছে দেবে।
          </p>
        </div>
      </motion.article>

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">সম্পর্কিত সংবাদ</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((n) => (
              <NewsCard key={n.id} item={n} />
            ))}
          </div>
        </section>
      )}

      <Link to="/news" className="inline-block text-sm text-[#F2B705] hover:underline">
        ← সকল সংবাদে ফিরে যান
      </Link>
    </div>
  );
}
