import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { Newspaper, ChevronRight, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// Categories with ID and bilingual labels
const categories = [
    { id: "Bangladesh", en: "Bangladesh", bn: "বাংলাদেশ" },
    { id: "Politics", en: "Politics", bn: "রাজনীতি" },
    { id: "Technology", en: "Technology", bn: "প্রযুক্তি" },
    { id: "Sports", en: "Sports", bn: "খেলাধুলা" },
    { id: "Business", en: "Business", bn: "ব্যবসা" },
    { id: "Entertainment", en: "Entertainment", bn: "বিনোদন" },
    { id: "Health", en: "Health", bn: "স্বাস্থ্য" },
    { id: "Science", en: "Science", bn: "বিজ্ঞান" }
];

// Bangladesh News Data
const bdHeroEn = {
    title: "Bangladesh Celebrates 55th Independence Day with Grand National Parade",
    desc: "Dhaka lit up with celebrations as Bangladesh marked its 55th Independence Day. A grand military parade at the National Parade Ground and cultural events were held across all 64 districts.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000&auto=format&fit=crop"
};
const bdHeroBn = {
    title: "বিশাল জাতীয় কুচকাওয়াজে বাংলাদেশ ৫৫তম স্বাধীনতা দিবস উদযাপন করল",
    desc: "জাতীয় প্যারেড গ্রাউন্ডে বিশাল সামরিক কুচকাওয়াজ এবং সারাদেশের ৬৪ জেলায় সাংস্কৃতিক অনুষ্ঠানের মধ্য দিয়ে বাংলাদেশ ৫৫তম স্বাধীনতা দিবস উদযাপন করেছে।",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2000&auto=format&fit=crop"
};

const bdNewsEn = [
    { title: "Bangladesh Economy Grows 6.8% in FY 2025-26, Exceeding IMF Forecast", desc: "Bangladesh's GDP growth rate reached 6.8% in the fiscal year 2025-26, surpassing the IMF's projected 6.2%, driven by strong RMG exports and remittances.", time: "1h ago", category: "Business", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop" },
    { title: "Dhaka Metro Rail Line 6 Extension to Gazipur Officially Opens", desc: "The extended Dhaka Metro Rail Line 6 from Uttara to Gazipur has officially opened, cutting travel time between the two cities to just 35 minutes.", time: "2h ago", category: "Infrastructure", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop" },
    { title: "Bangladesh Cricket Team's Historic T20 Series Win Against India", desc: "Bangladesh clinched the 3-match T20I series 2-1 against India at the Sher-e-Bangla National Cricket Stadium with Shakib Al Hasan named Man of the Series.", time: "3h ago", category: "Sports", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop" },
    { title: "Bangladesh Garment Exports Hit All-Time Record of $50 Billion", desc: "Bangladesh's readymade garment (RMG) sector has achieved a record $50 billion in annual exports, cementing its position as the world's second-largest apparel exporter.", time: "4h ago", category: "Business", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop" },
    { title: "New Digital Security Act Amendment Passed in Bangladesh Parliament", desc: "Bangladesh parliament passed significant amendments to the Digital Security Act, incorporating international human rights standards and tightening data protection clauses.", time: "5h ago", category: "Politics", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000&auto=format&fit=crop" },
    { title: "Sundarban Mangrove Forest Gets UNESCO Emergency Conservation Fund", desc: "UNESCO has allocated a $20 million emergency conservation fund for the Sundarbans as rising sea levels threaten the world's largest mangrove forest.", time: "6h ago", category: "Environment", image: "https://images.unsplash.com/photo-1574607383476-f517f562d0f2?q=80&w=1000&auto=format&fit=crop" },
    { title: "Bangladesh Launches First Locally Made Electric Bus Fleet in Dhaka", desc: "Bangladesh Autobus and Minibus Owners Association launched 50 locally manufactured electric buses on Dhaka's busiest routes, a milestone for green transport.", time: "7h ago", category: "Environment", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1000&auto=format&fit=crop" },
    { title: "Chandpur to Get Bangladesh's First Smart City Infrastructure by 2027", desc: "The government has announced Chandpur as Bangladesh's first smart city pilot project, with AI-driven traffic management, solar grid and digital public services.", time: "8h ago", category: "Technology", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1000&auto=format&fit=crop" },
    { title: "Bangladesh Ranks 1st in South Asia for Financial Inclusion Growth", desc: "A new World Bank report ranks Bangladesh first in South Asia for financial inclusion growth, with mobile banking accounts reaching 110 million users.", time: "9h ago", category: "Finance", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1000&auto=format&fit=crop" },
    { title: "Padma Bridge Rail Link Boosts Southwest Bangladesh Economy by 22%", desc: "A new study shows the Padma Bridge rail link has boosted the economy of southwestern Bangladesh by 22%, with agricultural exports growing fastest.", time: "10h ago", category: "Infrastructure", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop" },
    { title: "Bangladesh Wins Bid to Host 2028 T20 Women's World Cup", desc: "The ICC has awarded Bangladesh the hosting rights for the 2028 ICC Women's T20 World Cup, marking a massive milestone for women's cricket in the country.", time: "11h ago", category: "Sports", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop" },
    { title: "New 1000MW Solar Power Plant Inaugurated in Mymensingh", desc: "Bangladesh's largest solar power plant with a 1000MW capacity has been inaugurated in Mymensingh, adding 15% to the national grid's renewable energy share.", time: "12h ago", category: "Energy", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop" },
];

const bdNewsBn = [
    { title: "আইএমএফের পূর্বাভাসকে ছাড়িয়ে ২০২৫-২৬ অর্থবছরে বাংলাদেশের জিডিপি প্রবৃদ্ধি ৬.৮%", desc: "শক্তিশালী পোশাক রপ্তানি ও রেমিট্যান্সের কারণে ২০২৫-২৬ অর্থবছরে বাংলাদেশের জিডিপি প্রবৃদ্ধি আইএমএফের ৬.২% পূর্বাভাসকে ছাড়িয়ে ৬.৮%-এ পৌঁছেছে।", time: "১ ঘণ্টা আগে", category: "ব্যবসা", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop" },
    { title: "ঢাকা মেট্রোরেল লাইন ৬-এর গাজীপুর পর্যন্ত বর্ধিতাংশ আনুষ্ঠানিকভাবে উদ্বোধন", desc: "উত্তরা থেকে গাজীপুর পর্যন্ত ঢাকা মেট্রোরেল লাইন ৬-এর বর্ধিতাংশ আনুষ্ঠানিকভাবে চালু হয়েছে, যা দুই শহরের মধ্যে যাত্রাসময় মাত্র ৩৫ মিনিটে নামিয়ে এনেছে।", time: "২ ঘণ্টা আগে", category: "অবকাঠামো", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop" },
    { title: "ভারতের বিপক্ষে ঐতিহাসিক টি২০ সিরিজ জয় বাংলাদেশ ক্রিকেট দলের", desc: "শের-ই-বাংলা জাতীয় ক্রিকেট স্টেডিয়ামে ৩ ম্যাচের টি২০আই সিরিজ ২-১ ব্যবধানে জিতেছে বাংলাদেশ, সিরিজ সেরা শাকিব আল হাসান।", time: "৩ ঘণ্টা আগে", category: "খেলাধুলা", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop" },
    { title: "বাংলাদেশের পোশাক রপ্তানি সর্বকালীন রেকর্ড ৫০ বিলিয়ন ডলার ছুঁয়েছে", desc: "বাংলাদেশের তৈরি পোশাক খাত বার্ষিক রপ্তানিতে রেকর্ড ৫০ বিলিয়ন ডলার অর্জন করেছে এবং বিশ্বের দ্বিতীয় বৃহত্তম পোশাক রপ্তানিকারক হিসেবে অবস্থান সুদৃঢ় করেছে।", time: "৪ ঘণ্টা আগে", category: "ব্যবসা", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop" },
    { title: "বাংলাদেশ জাতীয় সংসদে ডিজিটাল নিরাপত্তা আইন সংশোধনী পাস", desc: "বাংলাদেশ জাতীয় সংসদ ডিজিটাল নিরাপত্তা আইনে গুরুত্বপূর্ণ সংশোধনী পাস করেছে, যেখানে আন্তর্জাতিক মানবাধিকার মান এবং কঠোর তথ্য সুরক্ষা ধারা অন্তর্ভুক্ত করা হয়েছে।", time: "৫ ঘণ্টা আগে", category: "রাজনীতি", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000&auto=format&fit=crop" },
    { title: "সুন্দরবনের জন্য ইউনেস্কোর জরুরি সংরক্ষণ তহবিল বরাদ্দ", desc: "সমুদ্রপৃষ্ঠের উচ্চতা বৃদ্ধির কারণে বিশ্বের বৃহত্তম ম্যানগ্রোভ বন হুমকিতে পড়ায় ইউনেস্কো সুন্দরবনের জন্য ২০ মিলিয়ন ডলার জরুরি সংরক্ষণ তহবিল বরাদ্দ করেছে।", time: "৬ ঘণ্টা আগে", category: "পরিবেশ", image: "https://images.unsplash.com/photo-1574607383476-f517f562d0f2?q=80&w=1000&auto=format&fit=crop" },
    { title: "ঢাকায় দেশে তৈরি প্রথম বৈদ্যুতিক বাসের বহর চালু", desc: "বাংলাদেশ অটোবাস-মিনিবাস মালিক সমিতি ঢাকার ব্যস্ততম রুটগুলোতে ৫০টি দেশীয় বৈদ্যুতিক বাস চালু করেছে, যা সবুজ পরিবহনে মাইলফলক।", time: "৭ ঘণ্টা আগে", category: "পরিবেশ", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1000&auto=format&fit=crop" },
    { title: "চাঁদপুর পাবে ২০২৭ সালের মধ্যে বাংলাদেশের প্রথম স্মার্ট সিটি অবকাঠামো", desc: "সরকার চাঁদপুরকে বাংলাদেশের প্রথম স্মার্ট সিটি পাইলট প্রকল্প হিসেবে ঘোষণা করেছে, যেখানে এআই-চালিত ট্রাফিক ব্যবস্থাপনা, সোলার গ্রিড ও ডিজিটাল পাবলিক সেবা থাকবে।", time: "৮ ঘণ্টা আগে", category: "প্রযুক্তি", image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1000&auto=format&fit=crop" },
    { title: "আর্থিক অন্তর্ভুক্তি বৃদ্ধিতে দক্ষিণ এশিয়ায় প্রথম বাংলাদেশ", desc: "বিশ্বব্যাংকের নতুন প্রতিবেদনে বাংলাদেশ দক্ষিণ এশিয়ায় আর্থিক অন্তর্ভুক্তি বৃদ্ধিতে প্রথম স্থানে উঠে এসেছে, মোবাইল ব্যাংকিং অ্যাকাউন্ট ১১ কোটি ছাড়িয়েছে।", time: "৯ ঘণ্টা আগে", category: "অর্থনীতি", image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=1000&auto=format&fit=crop" },
    { title: "পদ্মা সেতু রেল সংযোগ দক্ষিণ-পশ্চিম বাংলাদেশের অর্থনীতি ২২% বৃদ্ধি করেছে", desc: "নতুন এক গবেষণায় দেখা গেছে পদ্মা সেতু রেল সংযোগ দক্ষিণ-পশ্চিম বাংলাদেশের অর্থনীতি ২২% বৃদ্ধি করেছে, কৃষিপণ্য রপ্তানি সবচেয়ে দ্রুত বেড়েছে।", time: "১০ ঘণ্টা আগে", category: "অবকাঠামো", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1000&auto=format&fit=crop" },
    { title: "২০২৮ টি২০ নারী বিশ্বকাপ আয়োজনের দায়িত্ব পেল বাংলাদেশ", desc: "আইসিসি বাংলাদেশকে ২০২৮ আইসিসি নারী টি২০ বিশ্বকাপ আয়োজনের অধিকার দিয়েছে, যা দেশের নারী ক্রিকেটে এক বিশাল মাইলফলক।", time: "১১ ঘণ্টা আগে", category: "খেলাধুলা", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000&auto=format&fit=crop" },
    { title: "ময়মনসিংহে ১০০০ মেগাওয়াটের নতুন সোলার পাওয়ার প্লান্ট উদ্বোধন", desc: "বাংলাদেশের সবচেয়ে বড় সোলার পাওয়ার প্লান্ট ময়মনসিংহে উদ্বোধন হয়েছে, জাতীয় গ্রিডে নবায়নযোগ্য শক্তির অংশ ১৫% বৃদ্ধি পেয়েছে।", time: "১২ ঘণ্টা আগে", category: "জ্বালানি", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop" },
];

const topStoriesEn = [
    { id: 1, title: "Global Summit Agrees on New Climate Goals", category: "Politics", time: "2h ago", author: "BBC News" },
    { id: 2, title: "Revolutionary Battery Tech Promises 1000km Range", category: "Technology", time: "4h ago", author: "TechCrunch" },
    { id: 3, title: "Championship Finals: The Underdog Wins!", category: "Sports", time: "5h ago", author: "ESPN" },
    { id: 4, title: "Stock Market Hits All-Time High", category: "Business", time: "1h ago", author: "Bloomberg" },
    { id: 5, title: "New Space Telescope Sends Back First Images", category: "Science", time: "6h ago", author: "NASA" },
];

const topStoriesBen = [
    { id: 1, title: "বিশ্ব জলবায়ু সম্মেলনে নতুন লক্ষ্যমাত্রায় ঐকমত্য", category: "রাজনীতি", time: "২ ঘণ্টা আগে", author: "বিবিসি বাংলা" },
    { id: 2, title: "নতুন ব্যাটারি প্রযুক্তি: ১০০০ কিমি রেঞ্জের প্রতিশ্রুতি", category: "প্রযুক্তি", time: "৪ ঘণ্টা আগে", author: "টেকক্রাঞ্চ" },
    { id: 3, title: "চ্যাম্পিয়নশিপ ফাইনাল: আন্ডারডগের জয়!", category: "খেলাধুলা", time: "৫ ঘণ্টা আগে", author: "ইএসপিএন" },
    { id: 4, title: "শেয়ার বাজারে সর্বকালের সর্বোচ্চ উত্থান", category: "ব্যবসা", time: "১ ঘণ্টা আগে", author: "ব্লুমবার্গ" },
    { id: 5, title: "নতুন স্পেস টেলিস্কোপ পাঠাল প্রথম ছবি", category: "বিজ্ঞান", time: "৬ ঘণ্টা আগে", author: "নাসা" },
];

import { useLanguage } from "@/contexts/LanguageContext";

const News = () => {
    const { language } = useLanguage();
    const [activeCategory, setActiveCategory] = useState("All");

    const currentTopStories = language === "BN" ? topStoriesBen : topStoriesEn;

    // Static Text Translations
    const localT = {
        news: language === "BN" ? "খবর" : "NEWS",
        all: language === "BN" ? "সব" : "All",
        breaking: language === "BN" ? "ব্রেকিং" : "Breaking",
        latestHeadlines: language === "BN" ? "সর্বশেষ শিরোনাম" : "Latest Headlines",
        viewAll: language === "BN" ? "সব দেখুন" : "View All",
        trendingTopics: language === "BN" ? "জনপ্রিয় বিষয়" : "Trending Topics",
        advertisement: language === "BN" ? "বিজ্ঞাপন" : "Advertisement",
        adSpace: language === "BN" ? "বিজ্ঞাপনের স্থান" : "Ad Space",
        heroTitle: language === "BN" ? "আজ বড় বৈজ্ঞানিক সাফল্যের ঘোষণা" : "Major Scientific Breakthrough Announced Today",
        heroDesc: language === "BN" ? "বিজ্ঞানীরা পরিচ্ছন্ন শক্তি উৎপাদনের একটি নতুন পদ্ধতি আবিষ্কার করেছেন যা পৃথিবীকে চিরতরে বদলে দিতে পারে..." : "Scientists have discovered a new method for clean energy production that could change the world forever...",
    };

    // Technology View Data (Bengali)
    const techHero = {
        title: "ডিআইএমএফএফ-ইনফেনিক্সের উদ্যোগে ‘প্রাউড বাংলাদেশ’ মোবাইল ফিল্মমেকিং ওয়ার্কশপ",
        desc: "ঢাকা ইন্টারন্যাশনাল মোবাইল ফিল্ম ফেস্টিভ্যাল (ডিআইএমএফএফ) এর উদ্যোগে এবং ইউনিভার্সিটি অব লিবারেল আর্টস বাংলাদেশ (ইউল্যাব)-এর মিডিয়া স্টাডিজ অ্যান্ড জার্নালিজম বিভাগের সহযোগিতায়...",
        image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2000&auto=format&fit=crop"
    };

    const techSideBen = [
        { title: "মোবাইল অ্যাপে মেট্রোরেলের কার্ড রিচার্জ", image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=1000&auto=format&fit=crop" },
        { title: "ফ্রিল্যান্সার পাবেন আইডি কার্ড-আর্থিক সুবিধা", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" }
    ];

    const techGridBen = [
        { title: "ফ্রিল্যান্সার আইডি ম্যানেজমেন্ট সাইট আসছে: ফয়েজ আহমেদ তৈয়ব", desc: "দেশের ফ্রিল্যান্সারদের জন্য সুখবর দিয়েছেন প্রধান উপদেষ্টার ডাক, টেলিযোগাযোগ...", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" },
        { title: "বিশেষ সহকারীকে ‘কলুর বলদ’ বানিয়ে এনআইআর বাস্তবায়নের চেষ্টা", desc: "প্রধান উপদেষ্টার ডাক, টেলিযোগাযোগ ও তথ্য প্রযুক্তি বিষয়ক বিশেষ সহকারী...", image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1000&auto=format&fit=crop" },
        { title: "বাংলাদেশে স্মার্টফোনের দাম বেড়ে যাওয়ার কারণ কী", desc: "২০২৫ সাল থেকে বৈশ্বিক বাজারে মেমোরি চিপের দাম উর্ধ্বমুখী হতে শুরু করে...", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop" },
        { title: "একই দামে তিন গুণ দ্রুত গতির ইন্টারনেট", desc: "গ্রাহকদের উন্নত ডিজিটাল সেবা নিশ্চিত করার লক্ষ্যে মাসিক মূল্য সম্পূর্ণ অপরিবর্তিত...", image: "https://images.unsplash.com/photo-1601931835711-2df8d03091be?q=80&w=1000&auto=format&fit=crop" },
        { title: "আইসিটি বিভাগের শ্বেতপত্র প্রকাশ", desc: "তথ্য ও যোগাযোগ প্রযুক্তি (আইসিটি) বিভাগের শ্বেতপত্র বৃহস্পতিবার (৮ জানুয়ারি)...", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" },
        { title: "গ্রাহক তথ্যের সুরক্ষা নিশ্চিত আইএসও সনদ পেল বাংলালিংক", desc: "বৈশ্বিক তথ্য নিরাপত্তা মানদণ্ড বজায় রাখার স্বীকৃতি স্বরূপ আবার আন্তর্জাতিকভাবে...", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop" },
        { title: "স্যাটেলাইট কোম্পানির সক্ষমতা আরও বাড়ানো প্রয়োজন: রিজওয়ানা হাসান", desc: "রাষ্ট্রীয় নিরাপত্তা, পানি সম্পদ ব্যবস্থাপনা ও নগর পরিকল্পনার জন্য স্যাটেলাইট...", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" },
        { title: "এক এনআইডিতে অধিক সিম-হ্যান্ডসেট, বিটিআরসি কী বলে?", desc: "অবৈধ ও ক্লোন ফোন রোধে বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি)...", image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1000&auto=format&fit=crop" },
    ];

    // Technology View Data (English)
    const techSideEng = [
        { title: "Metro Rail Card Recharge via Mobile App", image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=1000&auto=format&fit=crop" },
        { title: "Freelancers to Get ID Cards & Financial Benefits", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" }
    ];

    const techGridEng = [
        { title: "Freelancer ID Management Site Coming Soon: Foyez Ahmed Tayyeb", desc: "Good news for the country's freelancers given by the Chief Advisor's Post, Telecommunication...", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" },
        { title: "Attempt to Implement NIR by Making Special Assistant a 'Scapegoat'", desc: "Chief Advisor's Special Assistant on Post, Telecommunication and Information Technology...", image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1000&auto=format&fit=crop" },
        { title: "Why Are Smartphone Prices Rising in Bangladesh?", desc: "From 2025, memory chip prices in the global market started to rise...", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000&auto=format&fit=crop" },
        { title: "Three Times Faster Internet at the Same Price", desc: "Monthly price remains completely unchanged to ensure advanced digital services for customers...", image: "https://images.unsplash.com/photo-1601931835711-2df8d03091be?q=80&w=1000&auto=format&fit=crop" },
        { title: "ICT Division White Paper Published", desc: "The Information and Communication Technology (ICT) Division's white paper published on Thursday (January 8)...", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" },
        { title: "Banglalink Receives ISO Certificate Ensuring Customer Data Protection", desc: "Again globally recognized for maintaining global information security standards...", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop" },
        { title: "Satellite Company Capacity Needs to Be Increased: Rizwana Hasan", desc: "Satellite for national security, water resource management, and urban planning...", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" },
        { title: "More SIMs & Handsets on One NID, What Does BTRC Say?", desc: "Bangladesh Telecommunication Regulatory Commission (BTRC) to prevent illegal and clone phones...", image: "https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1000&auto=format&fit=crop" },
    ];

    const currentTechSide = language === "BN" ? techSideBen : techSideEng;
    const currentTechGrid = language === "BN" ? techGridBen : techGridEng;
    const currentBdNews = language === "BN" ? bdNewsBn : bdNewsEn;
    const currentBdHero = language === "BN" ? bdHeroBn : bdHeroEn;

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Header />

            {/* News Navigation */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
                    <div className="flex items-center gap-6 h-12">
                        <span className="font-bold text-portal-red flex items-center gap-2">
                            <Newspaper className="w-5 h-5" />
                            {localT.news}
                        </span>
                        <div className="w-px h-6 bg-border mx-2"></div>
                        <button
                            onClick={() => setActiveCategory("All")}
                            className={`text-sm font-medium whitespace-nowrap ${activeCategory === "All" ? "text-portal-red" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {localT.all}
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`text-sm font-medium whitespace-nowrap ${activeCategory === cat.id ? "text-portal-red" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                {language === "BN" ? cat.bn : cat.en}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">

                {activeCategory === "Bangladesh" ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Hero */}
                        <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 cursor-pointer group">
                            <img src={currentBdHero.image} alt={currentBdHero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                                    {language === "BN" ? "বাংলাদেশ" : "BANGLADESH"}
                                </span>
                                <h2 className="text-white text-xl md:text-3xl font-bold leading-tight">{currentBdHero.title}</h2>
                                <p className="text-white/80 text-sm mt-2 line-clamp-2">{currentBdHero.desc}</p>
                            </div>
                        </div>
                        {/* News Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {currentBdNews.map((item, idx) => (
                                <div key={idx} className="group cursor-pointer bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all">
                                    <div className="aspect-video w-full bg-muted overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="p-3 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-portal-red uppercase">{item.category}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                                        </div>
                                        <h3 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-3">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeCategory === "Technology" ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Combined Grid (All items) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Tech Side Items (Now in Grid) */}
                            {currentTechSide.map((item, idx) => (
                                <div key={`side-${idx}`} className="group cursor-pointer space-y-2">
                                    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <h3 className="font-bold text-sm leading-snug group-hover:text-blue-600 line-clamp-2">
                                        {item.title}
                                    </h3>
                                </div>
                            ))}

                            {/* Main Tech Grid Items */}
                            {currentTechGrid.map((item, idx) => (
                                <div key={`grid-${idx}`} className="group cursor-pointer space-y-2">
                                    <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <h3 className="font-bold text-sm leading-snug group-hover:text-blue-600 line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-3">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeCategory === "Bangladesh" ? null : (
                    /* Default/All View */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Hero Article */}
                            <div className="bg-card rounded-xl border border-border overflow-hidden">
                                <div className="aspect-video bg-muted relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary">
                                        <span className="text-6xl">📰</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                        <span className="bg-portal-red px-2 py-1 text-xs font-bold rounded mb-2 inline-block">{localT.breaking}</span>
                                        <h1 className="text-3xl font-bold mb-2">{localT.heroTitle}</h1>
                                        <p className="text-gray-200 line-clamp-2">{localT.heroDesc}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Latest News List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h2 className="text-xl font-bold">{localT.latestHeadlines}</h2>
                                    <Link to="#" className="text-sm text-primary">{localT.viewAll}</Link>
                                </div>
                                {currentTopStories.map((story) => (
                                    <div key={story.id} className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer">
                                        <div className="w-24 h-24 bg-secondary rounded-md flex-shrink-0 flex items-center justify-center text-2xl">⚡</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-portal-red uppercase">{story.category}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {story.time}</span>
                                            </div>
                                            <h3 className="text-lg font-bold mb-1 hover:text-primary transition-colors">{story.title}</h3>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <User className="w-3 h-3" /> {story.author}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-card rounded-xl p-4 border border-border">
                                <h3 className="font-bold mb-4">{localT.trendingTopics}</h3>
                                <div className="space-y-3">
                                    {["#ClimateAction", "#TechTrends2026", "#WorldCup", "#SpaceX"].map((tag, i) => (
                                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                                            <span className="text-sm text-muted-foreground group-hover:text-primary">{tag}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-secondary/50 rounded-xl p-6 text-center border border-dashed border-border">
                                <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">{localT.advertisement}</span>
                                <div className="h-48 bg-muted rounded flex items-center justify-center">
                                    <span className="text-muted-foreground font-bold">{localT.adSpace}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default News;
