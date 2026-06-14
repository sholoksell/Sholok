
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Share2 } from "lucide-react";
import { useState } from "react";

const Health = () => {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'latest' | 'read'>('latest');

    // Mock Data (Static for design match)
    const heroArticle = {
        title: language === 'BN' ? "শৈশবের আনন্দ এবং বিকাশ" : "Childhood Joy and Development",
        time: language === 'BN' ? "৫ ঘণ্টা আগে" : "5 hours ago",
        image: "/images/childhood_boy_girl_no_animal.png"
    };

    const sideArticle = {
        title: language === 'BN' ? "ভালো থাকুন • নবজাতকের চোখে পানি ঝরলে" : "Stay Well • When Newborns Have Watery Eyes",
        desc: language === 'BN' ? "নেত্রনালী হলো চোখের সঙ্গে নাকের একধরনের সংযোগ, যার মাধ্যমে চোখের অতিরিক্ত পানি নাকের ভেতরে নিষ্কাশিত হয়..." : "The tear duct is a connection between the eyes and nose through which excess water drains...",
        time: language === 'BN' ? "৯ ঘণ্টা আগে" : "9 hours ago",
        image: "/images/newborn_baby_face.png"
    };

    const bottomArticles = [
        {
            title: language === 'BN' ? "পুষ্টিবিদদের মতে, এই ৭ বাদাম নিয়মিত খেলে নানা রোগের ঝুঁকি কমবে" : "According to Nutritionists, Eating These 7 Nuts Regularly Reduce Disease Risk",
            desc: language === 'BN' ? "হৃদযন্ত্রের স্বাস্থ্য থেকে মস্তিষ্কের কার্যকারিতা, ওজন নিয়ন্ত্রণ থেকে ত্বকের উজ্জ্বলতা বাড়াতে বাদামের অবদান প্রমাণিত।" : "From heart health to brain function, weight control to skin brightness, the contribution of nuts is proven.",
            date: language === 'BN' ? "১৭ জানুয়ারি ২০২৬" : "17 January 2026",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: language === 'BN' ? "ওজন কমানোর ওষুধ খেলে কী হয়" : "What Happens When You Take Weight Loss Pills",
            desc: language === 'BN' ? "ওজন কমাতে অনেকে নানা ধরনের ওষুধ গ্রহণ করে থাকেন। এগুলো গ্রহণ করা ভালো?" : "Many people take various medicines to lose weight. Is it good to take these?",
            date: language === 'BN' ? "১৭ জানুয়ারি ২০২৬" : "17 January 2026",
            image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop"
        },
        {
            title: language === 'BN' ? "শীতে ফ্লু নিরাময়ে যা খাবেন" : "Foods to Cure Flu in Winter",
            desc: language === 'BN' ? "শীতকালে পানি খাওয়া কম হয় বলে পানিশূন্যতা (ডিহাইড্রেশন) হয়। এর ফলে ফুসফুসের শ্বাসপ্রশ্বাস চলাচল বাধাগ্রস্ত হতে পারে।" : "Dehydration occurs in winter due to low water intake. This can obstruct lung respiration.",
            date: language === 'BN' ? "১৭ জানুয়ারি ২০২৬" : "17 January 2026",
            image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    const sidebarList = [
        { title: language === 'BN' ? "স্বপ্নের সম্মেলনে বক্তারা • আন্দোলনে সামনের কাতারে থাকলেও শ্রমজীবীরা বঞ্চিত থাকেন" : "Speakers at Dream Conference • Workers Deprived Despite Being at Frontline" },
        { title: language === 'BN' ? "স্মরণ • সংকটকালের নেতৃত্ব ও একজন জিয়াউর রহমান" : "Remembrance • Crisis Leadership and One Ziaur Rahman" },
        { title: language === 'BN' ? "সফলভাবে নির্বাচন আয়োজন নিয়ে চীনের রাষ্ট্রদূতের শুভকামনা" : "Chinese Ambassador's Best Wishes on Successful Election Hosting" },
        { title: language === 'BN' ? "ওবায়দুল কাদেরসহ ৭ আসামির বিরুদ্ধে অভিযোগ গঠনের আদেশ ২২ জানুয়ারি" : "Charge Framing Order Against 7 Accused Including Quader on Jan 22" },
        { title: language === 'BN' ? "মেস থেকে জগন্নাথ বিশ্ববিদ্যালয়ের শিক্ষার্থীর ঝুলন্ত মরদেহ উদ্ধার" : "Hanging Body of JnU Student Recovered from Mess" },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                {/* Page Title for Context */}
                <h1 className="text-3xl font-bold mb-6 border-l-4 border-portal-green pl-3">
                    {language === 'BN' ? "স্বাস্থ্য" : "Health"}
                </h1>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left Content Column (9 Cols) */}
                    <div className="col-span-12 space-y-8">

                        {/* Top Hero Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Hero Article (2/3) */}
                            <div className="md:col-span-2 relative group cursor-pointer overflow-hidden rounded-lg">
                                <div className="aspect-[4/3] w-full overflow-hidden">
                                    <img src={heroArticle.image} alt={heroArticle.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight hover:underline">{heroArticle.title}</h2>
                                    <div className="flex items-center text-gray-300 text-sm gap-4">
                                        <span>{heroArticle.time}</span>
                                        <Share2 className="w-4 h-4 cursor-pointer hover:text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Side Highlight Article (1/3) */}
                            <div className="md:col-span-1 border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                                <div className="w-20 h-20 md:w-full md:h-40 overflow-hidden rounded-lg mb-3 mx-auto">
                                    <img src={sideArticle.image} alt="Newborn" className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-lg font-bold text-red-600 mb-2">{sideArticle.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed mb-2">
                                    {sideArticle.desc}
                                </p>
                                <span className="text-xs text-muted-foreground">{sideArticle.time}</span>
                            </div>
                        </div>

                        {/* Bottom Grid Articles */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {bottomArticles.map((article, index) => (
                                <div key={index} className="flex flex-col group cursor-pointer">
                                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-3">
                                        <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2 flex-grow">{article.desc}</p>
                                    <span className="text-xs text-muted-foreground">{article.date}</span>
                                </div>
                            ))}
                        </div>

                    </div>


                </div>

            </main>
            <Footer />
        </div>
    );
};

export default Health;
