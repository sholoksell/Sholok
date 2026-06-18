import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  bn: {
    // Nav
    home: 'হোম',
    trending: 'ট্রেন্ডিং',
    shortClips: 'শর্ট ক্লিপস',
    write: 'লিখুন',
    writePost: 'পোস্ট লিখুন',
    signIn: 'সাইন ইন',
    signOut: 'সাইন আউট',
    getStarted: 'শুরু করুন',
    register: 'রেজিস্টার',
    profile: 'প্রোফাইল',
    dashboard: 'ড্যাশবোর্ড',
    timeline: 'টাইমলাইন',
    adminPanel: 'অ্যাডমিন প্যানেল',
    notifications: 'বিজ্ঞপ্তি',
    markAllRead: 'সব পঠিত হিসেবে চিহ্নিত করুন',
    noNotifications: 'কোনো বিজ্ঞপ্তি নেই',
    searchPlaceholder: 'ব্লগ, বিষয়, লেখক খুঁজুন...',
    tags: 'ট্যাগ',
    posts: 'পোস্ট',
    platform: 'প্ল্যাটফর্ম',
    categories: 'বিভাগসমূহ',
    account: 'অ্যাকাউন্ট',
    brandTagline: 'অসাধারণ গল্প আবিষ্কার করুন, আপনার চিন্তাভাবনা শেয়ার করুন, এবং বিশ্বের ব্লগারদের সাথে সংযুক্ত হন। আপনার গল্পই গুরুত্বপূর্ণ।',
    entertainment: 'বিনোদন',
    lifestyle: 'লাইফস্টাইল',
    hobbiesTravel: 'শখ ও ভ্রমণ',
    knowledge: 'জ্ঞান',
    readMore: 'আরও পড়ুন',
    relatedPosts: 'সম্পর্কিত পোস্ট',
    comments: 'মন্তব্য',
    addComment: 'মন্তব্য যোগ করুন',
    submit: 'জমা দিন',
    loading: 'লোড হচ্ছে...',
    notFound: 'পৃষ্ঠা পাওয়া যায়নি',
    backHome: 'হোমে ফিরে যান',
    views: 'ভিউ',
    likes: 'লাইক',
    share: 'শেয়ার',
    by: 'লিখেছেন',
    minRead: 'মিনিট পড়া',
    // Hero
    featuredPlatform: '🔥 ফিচার্ড প্ল্যাটফর্ম',
    heroTitle1: 'আপনার গল্প শেয়ার করুন',
    heroTitle2: 'বিশ্বের সাথে',
    heroDescription: 'অসাধারণ গল্প আবিষ্কার করুন, আপনার আবেগ শেয়ার করুন, লক্ষ লক্ষ ব্লগারদের সাথে সংযুক্ত হন। এখানে আপনার কণ্ঠস্বর গুরুত্বপূর্ণ।',
    startWriting: 'লেখা শুরু করুন',
    exploreTrending: 'ট্রেন্ডিং দেখুন',
    activeBloggers: 'সক্রিয় ব্লগার',
    blogPosts: 'ব্লগ পোস্ট',
    monthlyReaders: 'মাসিক পাঠক',
    // Home sections
    exploreCategories: 'বিভাগ অন্বেষণ করুন',
    explore: 'অন্বেষণ করুন',
    trendingNow: '🔥 এখন ট্রেন্ডিং',
    latestPosts: '✨ সর্বশেষ পোস্ট',
    seeAll: 'সব দেখুন',
    noTrendingYet: 'এখনো কোনো ট্রেন্ডিং পোস্ট নেই। প্রথম লেখক হন!',
    loadMore: 'আরও লোড করুন',
    topBloggers: 'শীর্ষ ব্লগার',
    follow: 'ফলো করুন',
    unfollow: 'আনফলো',
    followers: 'ফলোয়ার',
    following: 'ফলোয়িং',
    // Category descriptions
    entDesc: 'সিনেমা, সংগীত, শিল্প',
    lifeDesc: 'ফ্যাশন, খাবার, গৃহ',
    hobbiesDesc: 'ভ্রমণ, খেলাধুলা, গেমস',
    knowledgeDesc: 'প্রযুক্তি, স্বাস্থ্য, ব্যবসা',
    // Login
    welcomeBack: 'স্বাগতম ফিরে',
    loginPanelText: 'আপনার যাত্রা চালিয়ে যান। হাজার হাজার ব্লগারদের সাথে লিখুন, শেয়ার করুন এবং সংযুক্ত হন।',
    bloggers: 'ব্লগার',
    readers: 'পাঠক',
    signInToAccount: 'আপনার অ্যাকাউন্টে সাইন ইন করুন',
    noAccount: 'অ্যাকাউন্ট নেই?',
    signUpFree: 'বিনামূল্যে সাইন আপ',
    emailAddress: 'ইমেইল ঠিকানা',
    passwordLabel: 'পাসওয়ার্ড',
    signingIn: 'সাইন ইন হচ্ছে...',
    signInBtn: 'সাইন ইন',
    agreeTerms: 'সাইন ইন করে আপনি আমাদের',
    termsOfService: 'সেবার শর্তাবলী',
    agreeTermsEnd: 'সম্মতি দিচ্ছেন',
    // Register
    createYourAccount: 'আপনার অ্যাকাউন্ট তৈরি করুন',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    displayNameLabel: 'প্রদর্শন নাম',
    usernameLabel: 'ব্যবহারকারী নাম',
    minSixChars: 'কমপক্ষে ৬ অক্ষর',
    passwordStrengthTip: 'শক্তিশালী পাসওয়ার্ডের জন্য বড় হাতের অক্ষর, সংখ্যা ও চিহ্ন ব্যবহার করুন',
    creatingAccount: 'অ্যাকাউন্ট তৈরি হচ্ছে...',
    createAccountBtn: 'অ্যাকাউন্ট তৈরি করুন',
    agreeCreate: 'অ্যাকাউন্ট তৈরি করে আপনি আমাদের',
    // Search
    searchPostsWriters: 'পোস্ট, ট্যাগ, লেখক খুঁজুন...',
    searchBtn: 'খুঁজুন',
    postsTab: 'পোস্ট',
    bloggersTab: 'ব্লগার',
    mostRelevant: 'সবচেয়ে প্রাসঙ্গিক',
    latestSort: 'সর্বশেষ',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
    allCategories: 'সকল বিভাগ',
    foundFor: 'পাওয়া গেছে',
    noResultsFor: 'এর জন্য কোনো ফলাফল নেই',
    searchSomething: 'কিছু খুঁজুন',
    tryDifferentKeywords: 'ভিন্ন কীওয়ার্ড বা বিভাগ ব্রাউজ করুন',
    // NotFound
    notFoundDescription: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই বা সরিয়ে নেওয়া হয়েছে। চিন্তা করবেন না, আমাদের ব্লগে প্রচুর দুর্দান্ত কন্টেন্ট পাবেন!',
    searchPosts: 'পোস্ট খুঁজুন',
    // BlogCard / Badges
    featuredBadge: '⭐ ফিচার্ড',
    // Dashboard
    dashboardTitle: 'ড্যাশবোর্ড',
    welcomeBackUser: 'স্বাগতম ফিরে',
    totalViews30d: 'মোট ভিউ (৩০ দিন)',
    totalReactions: 'মোট প্রতিক্রিয়া',
    commentsLabel: 'মন্তব্য',
    publishedPosts: 'প্রকাশিত পোস্ট',
    topPerformingPosts: 'শীর্ষ পারফর্মিং পোস্ট',
    draftLabel: 'ড্রাফট',
    noPostsYet: 'এখনো পোস্ট নেই।',
    writeFirstPost: 'আপনার প্রথম পোস্ট লিখুন!',
    writeFirstPostBtn: 'প্রথম পোস্ট লিখুন',
    postsTotal: 'পোস্ট মোট',
    overviewTab: '📊 সংক্ষিপ্ত বিবরণ',
    myPostsTab: '📝 আমার পোস্ট',
    editProfileTab: '👤 প্রোফাইল সম্পাদনা',
    profilePicture: 'প্রোফাইল ছবি',
    clickCameraToChange: 'ছবি পরিবর্তন করতে ক্যামেরা আইকনে ক্লিক করুন',
    profileInformation: 'প্রোফাইল তথ্য',
    bioLabel: 'পরিচিতি',
    websiteLabel: 'ওয়েবসাইট',
    locationLabel: 'অবস্থান',
    saving: 'সংরক্ষণ হচ্ছে...',
    saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
    deletePostConfirm: 'এই পোস্টটি স্থায়ীভাবে মুছে ফেলবেন?',
    // Profile
    editProfile: 'প্রোফাইল সম্পাদনা',
    followingStatus: 'ফলো করছেন',
    followBtn: 'ফলো করুন',
    postsLabel: 'পোস্ট',
    followersLabel: 'ফলোয়ার',
    followingLabel: 'ফলোয়িং',
    totalViews: 'মোট ভিউ',
    noPostsOwn: 'আপনি এখনো কোনো পোস্ট প্রকাশ করেননি।',
    noFollowersYet: 'এখনো কোনো ফলোয়ার নেই',
    noFollowingYet: 'এখনো কাউকে ফলো করা হয়নি',
    // CategoryPage
    categoryNotFound: 'বিভাগ পাওয়া যায়নি',
    goHome: 'হোমে যান',
    allFilter: 'সব',
    postsCount: 'পোস্ট',
    noCategoryPosts: 'এই বিভাগে এখনো কোনো পোস্ট নেই',
    beFirstToWrite: 'প্রথম লেখক হন!',
    // Timeline
    myTimeline: 'আমার টাইমলাইন',
    timelineSubtitle: 'আপনি যাদের ফলো করেন তাদের পোস্ট',
    followingCount: 'ফলোয়িং',
    timelineEmpty: 'আপনার টাইমলাইন খালি',
    timelineEmptyDesc: 'পোস্ট দেখতে ব্লগারদের ফলো করুন',
    discoverBloggers: 'ব্লগার আবিষ্কার করুন',
    timelineEnd: 'টাইমলাইনের সব পোস্ট দেখা হয়ে গেছে ✓',
    // BlogDetail
    relatedPosts: 'সম্পর্কিত পোস্ট',
    followBlogger: 'ব্লগার ফলো করুন',
    unfollow: 'আনফলো',
  },
  en: {
    home: 'Home',
    trending: 'Trending',
    shortClips: 'Short Clips',
    write: 'Write',
    writePost: 'Write Post',
    signIn: 'Sign in',
    signOut: 'Sign out',
    getStarted: 'Get Started',
    register: 'Register',
    profile: 'Profile',
    dashboard: 'Dashboard',
    timeline: 'Timeline',
    adminPanel: 'Admin Panel',
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications',
    searchPlaceholder: 'Search blogs, topics, writers...',
    tags: 'Tags',
    posts: 'Posts',
    platform: 'Platform',
    categories: 'Categories',
    account: 'Account',
    brandTagline: 'Discover amazing stories, share your thoughts, and connect with bloggers from around the world. Your story matters.',
    entertainment: 'Entertainment',
    lifestyle: 'Lifestyle',
    hobbiesTravel: 'Hobbies & Travel',
    knowledge: 'Knowledge',
    readMore: 'Read More',
    relatedPosts: 'Related Posts',
    comments: 'Comments',
    addComment: 'Add a comment',
    submit: 'Submit',
    loading: 'Loading...',
    notFound: 'Page not found',
    backHome: 'Back to Home',
    views: 'views',
    likes: 'likes',
    share: 'Share',
    by: 'by',
    minRead: 'min read',
    // Hero
    featuredPlatform: '🔥 Featured Platform',
    heroTitle1: 'Share Your Story',
    heroTitle2: 'With The World',
    heroDescription: 'Discover amazing stories, share your passions, connect with millions of bloggers. Your voice matters here.',
    startWriting: 'Start Writing',
    exploreTrending: 'Explore Trending',
    activeBloggers: 'Active Bloggers',
    blogPosts: 'Blog Posts',
    monthlyReaders: 'Monthly Readers',
    // Home sections
    exploreCategories: 'Explore Categories',
    explore: 'Explore',
    trendingNow: '🔥 Trending Now',
    latestPosts: '✨ Latest Posts',
    seeAll: 'See all',
    noTrendingYet: 'No trending posts yet. Be the first to write!',
    loadMore: 'Load More',
    topBloggers: 'Top Bloggers',
    follow: 'Follow',
    unfollow: 'Unfollow',
    followers: 'Followers',
    following: 'Following',
    entDesc: 'Movies, Music, Art',
    lifeDesc: 'Fashion, Food, Home',
    hobbiesDesc: 'Travel, Sports, Games',
    knowledgeDesc: 'Tech, Health, Business',
    // Login
    welcomeBack: 'Welcome Back',
    loginPanelText: 'Continue your journey. Write, share, and connect with thousands of bloggers.',
    bloggers: 'Bloggers',
    readers: 'Readers',
    signInToAccount: 'Sign in to your account',
    noAccount: "Don't have an account?",
    signUpFree: 'Sign up free',
    emailAddress: 'Email address',
    passwordLabel: 'Password',
    signingIn: 'Signing in...',
    signInBtn: 'Sign In',
    agreeTerms: 'By signing in, you agree to our',
    termsOfService: 'Terms of Service',
    agreeTermsEnd: '',
    // Register
    createYourAccount: 'Create your account',
    alreadyHaveAccount: 'Already have an account?',
    displayNameLabel: 'Display Name',
    usernameLabel: 'Username',
    minSixChars: 'Min. 6 characters',
    passwordStrengthTip: 'Use uppercase, numbers & symbols for a stronger password',
    creatingAccount: 'Creating account...',
    createAccountBtn: 'Create Account',
    agreeCreate: 'By creating an account, you agree to our',
    // Search
    searchPostsWriters: 'Search posts, tags, writers...',
    searchBtn: 'Search',
    postsTab: 'Posts',
    bloggersTab: 'Bloggers',
    mostRelevant: 'Most Relevant',
    latestSort: 'Latest',
    mostPopular: 'Most Popular',
    allCategories: 'All Categories',
    foundFor: 'found for',
    noResultsFor: 'No results for',
    searchSomething: 'Search for something',
    tryDifferentKeywords: 'Try different keywords or browse categories',
    // NotFound
    notFoundDescription: "The page you're looking for doesn't exist or has been moved. Don't worry, you can find plenty of great content on our blog!",
    searchPosts: 'Search Posts',
    // BlogCard
    featuredBadge: '⭐ Featured',
    // Dashboard
    dashboardTitle: 'Dashboard',
    welcomeBackUser: 'Welcome back',
    totalViews30d: 'Total Views (30d)',
    totalReactions: 'Total Reactions',
    commentsLabel: 'Comments',
    publishedPosts: 'Published Posts',
    topPerformingPosts: 'Top Performing Posts',
    draftLabel: 'Draft',
    noPostsYet: 'No posts yet.',
    writeFirstPost: 'Write your first post!',
    writeFirstPostBtn: 'Write First Post',
    postsTotal: 'posts total',
    overviewTab: '📊 Overview',
    myPostsTab: '📝 My Posts',
    editProfileTab: '👤 Edit Profile',
    profilePicture: 'Profile Picture',
    clickCameraToChange: 'Click camera icon to change photo',
    profileInformation: 'Profile Information',
    bioLabel: 'Bio',
    websiteLabel: 'Website',
    locationLabel: 'Location',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    deletePostConfirm: 'Delete this post permanently?',
    // Profile
    editProfile: 'Edit Profile',
    followingStatus: 'Following',
    followBtn: 'Follow',
    postsLabel: 'Posts',
    followersLabel: 'Followers',
    followingLabel: 'Following',
    totalViews: 'Total Views',
    noPostsOwn: "You haven't published any posts yet.",
    noFollowersYet: 'No followers yet',
    noFollowingYet: 'No following yet',
    // CategoryPage
    categoryNotFound: 'Category not found',
    goHome: 'Go Home',
    allFilter: 'All',
    postsCount: 'posts',
    noCategoryPosts: 'No posts in this category yet',
    beFirstToWrite: 'Be the first to write!',
    // Timeline
    myTimeline: 'My Timeline',
    timelineSubtitle: 'Posts from bloggers you follow',
    followingCount: 'Following',
    timelineEmpty: 'Your timeline is empty',
    timelineEmptyDesc: 'Follow bloggers to see their latest posts here',
    discoverBloggers: 'Discover Bloggers',
    timelineEnd: "You've seen all posts from your timeline ✓",
    // BlogDetail
    relatedPosts: 'Related Posts',
    followBlogger: 'Follow Blogger',
    unfollow: 'Unfollow',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('preferredLanguage') || 'bn');

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'bn' ? 'en' : 'bn'));

  const t = (key) => translations[language]?.[key] ?? translations.bn[key] ?? key;

  /** Resolve a localized string from a nested { en, bn } object or legacy flat field */
  const translateField = (field, lang = language) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.bn || field.en || '';
  };

  const getLocalizedField = (obj, fieldName) => {
    if (!obj) return '';
    const raw = obj[fieldName];
    if (raw && typeof raw === 'object' && ('en' in raw || 'bn' in raw)) return translateField(raw);
    const suffix = language === 'bn' ? 'Bn' : 'En';
    const localized = obj[`${fieldName}${suffix}`];
    if (localized) return localized;
    return obj[fieldName] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateField, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
