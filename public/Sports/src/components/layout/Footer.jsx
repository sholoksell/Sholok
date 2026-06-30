import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

const cols = [
  {
    title: "খেলা",
    links: [
      { to: "/teams", label: "ক্রিকেট" },
      { to: "/teams", label: "ফুটবল" },
      { to: "/teams", label: "হকি" },
      { to: "/teams", label: "কাবাডি" },
    ],
  },
  {
    title: "প্ল্যাটফর্ম",
    links: [
      { to: "/live-score", label: "লাইভ স্কোর" },
      { to: "/schedule", label: "সময়সূচি" },
      { to: "/league-table", label: "লিগ টেবিল" },
      { to: "/news", label: "সংবাদ" },
    ],
  },
  {
    title: "কমিউনিটি",
    links: [
      { to: "/fan-zone", label: "ফ্যান জোন" },
      { to: "/videos", label: "ভিডিও" },
      { to: "/analysis", label: "বিশ্লেষণ" },
      { to: "/search", label: "সার্চ" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 glass border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🐯</span>
            <span className="text-lg font-bold text-gradient-bd">খেলারবাংলা</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            বাংলাদেশের সবচেয়ে বড় স্পোর্টস মিডিয়া প্ল্যাটফর্ম। সর্বশেষ স্কোর, খবর ও বিশ্লেষণ।
          </p>
          <div className="flex gap-3 mt-4">
            {[FaFacebookF, FaTwitter, FaYoutube, FaInstagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#F2B705] hover:text-black transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white mb-3">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-[#F2B705] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
