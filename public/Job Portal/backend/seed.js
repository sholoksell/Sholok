// Comprehensive seed script: populates ALL data into MongoDB
// Run: node seed.js

import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Company from "./models/Company.js";
import Category from "./models/Category.js";
import Location from "./models/Location.js";
import Job from "./models/Job.js";

const MONGO_URI = process.env.MONGO_URI;

// ====================== SEED DATA ======================

const companiesData = [
  {
    name: "Grameenphone Ltd.",
    logo: "🟒",
    industry: "টেলিযোগাযোগ",
    location: "ঢাকা, বাংলাদেশ",
    size: "5000+ কর্মী",
    founded: "1997",
    website: "grameenphone.com",
    description: "গ্রামীণফোন বাংলাদেশের শীর্ষস্থানীয় টেলিযোগাযোগ কোম্পানি। আমরা ডিজিটাল বাংলাদেশ গড়ার স্বপ্ন নিয়ে কাজ করি।",
    benefits: ["প্রভিডেন্ট ফান্ড", "গ্রুপ ইন্স্যুরেন্স", "মোবাইল সিম সুবিধা", "বার্ষিক বোনাস", "উচ্চশিক্ষা সুবিধা"],
    rating: 4.2,
    reviews: 312,
  },
  {
    name: "BRAC",
    logo: "🔴",
    industry: "এনজিও / উন্নয়ন সংস্থা",
    location: "ঢাকা, বাংলাদেশ",
    size: "100,000+ কর্মী",
    founded: "1972",
    website: "brac.net",
    description: "ব্র্যাক বিশ্বের বৃহত্তম এনজিও। আমরা দারিদ্র্য বিমোচন, শিক্ষা ও স্বাস্থ্য খাতে কাজ করি।",
    benefits: ["প্রভিডেন্ট ফান্ড", "স্বাস্থ্য বীমা", "বার্ষিক ছুটি", "গ্রুপ ইন্স্যুরেন্স", "প্রশিক্ষণ সুবিধা"],
    rating: 4.0,
    reviews: 890,
  },
  {
    name: "Dutch-Bangla Bank Limited",
    logo: "🔵",
    industry: "ব্যাংকিং ও আর্থিক সেবা",
    location: "ঢাকা, বাংলাদেশ",
    size: "3000+ কর্মী",
    founded: "1995",
    website: "dutchbanglabank.com",
    description: "ডাচ-বাংলা ব্যাংক বাংলাদেশের অন্যতম শীর্ষ বেসরকারি বাণিজ্যিক ব্যাংক। আমরা প্রযুক্তিগত উদ্ভাবনে পথিকৃৎ।",
    benefits: ["প্রভিডেন্ট ফান্ড", "গ্রাচুইটি", "গ্রুপ ইন্স্যুরেন্স", "কার লোন সুবিধা", "হোম লোন সুবিধা"],
    rating: 3.9,
    reviews: 245,
  },
  {
    name: "Shajgoj",
    logo: "🟣",
    industry: "ই-কমার্স / বিউটি টেক",
    location: "ঢাকা, বাংলাদেশ",
    size: "200+ কর্মী",
    founded: "2012",
    website: "shajgoj.com",
    description: "শাজগোজ বাংলাদেশের সর্ববৃহৎ বিউটি ও স্কিনকেয়ার ই-কমার্স প্ল্যাটফর্ম। আমরা নারীদের সৌন্দর্য চর্চায় সহায়তা করি।",
    benefits: ["ফ্লেক্সিবল কাজের সময়", "বোনাস", "পণ্য ছাড়", "দলীয় আউটিং", "দ্রুত ক্যারিয়ার বৃদ্ধি"],
    rating: 4.1,
    reviews: 67,
  },
  {
    name: "Square Pharmaceuticals",
    logo: "🟠",
    industry: "ফার্মাসিউটিক্যালস",
    location: "ঢাকা, বাংলাদেশ",
    size: "10,000+ কর্মী",
    founded: "1958",
    website: "squarepharma.com.bd",
    description: "স্কয়ার ফার্মাসিউটিক্যালস বাংলাদেশের শীর্ষ ফার্মাসিউটিক্যাল কোম্পানি। আমরা মানসম্পন্ন ওষুধ উৎপাদন করি।",
    benefits: ["প্রভিডেন্ট ফান্ড", "গ্রাচুইটি", "চিকিৎসা ভাতা", "উৎসব বোনাস", "আবাসন সুবিধা"],
    rating: 4.3,
    reviews: 556,
  },
  {
    name: "Chaldal",
    logo: "🟢",
    industry: "অনলাইন গ্রোসারি / টেক",
    location: "ঢাকা, বাংলাদেশ",
    size: "500+ কর্মী",
    founded: "2013",
    website: "chaldal.com",
    description: "চালডাল বাংলাদেশের প্রথম অনলাইন গ্রোসারি শপ। আমরা প্রযুক্তি ব্যবহার করে মানুষের জীবনযাত্রা সহজ করছি।",
    benefits: ["কম্পিটিটিভ স্যালারি", "স্বাস্থ্য বীমা", "রিমোট ওয়ার্ক অপশন", "ট্রেনিং বাজেট", "গ্রোসারি ডিসকাউন্ট"],
    rating: 4.0,
    reviews: 134,
  },
];

const categoriesData = [
  { name: "প্রযুক্তি", label: "প্রযুক্তি", order: 1 },
  { name: "মার্কেটিং", label: "মার্কেটিং", order: 2 },
  { name: "ব্যাংকিং", label: "ব্যাংকিং", order: 3 },
  { name: "এনজিও / উন্নয়ন", label: "এনজিও", order: 4 },
  { name: "ফার্মা / স্বাস্থ্য", label: "ফার্মা", order: 5 },
  { name: "ডিজাইন", label: "ডিজাইন", order: 6 },
  { name: "এইচআর", label: "এইচআর", order: 7 },
];

const locationsData = [
  { name: "ঢাকা", order: 1 },
  { name: "চট্টগ্রাম", order: 2 },
  { name: "সিলেট", order: 3 },
  { name: "রাজশাহী", order: 4 },
  { name: "খুলনা", order: 5 },
  { name: "বরিশাল", order: 6 },
  { name: "রংপুর", order: 7 },
  { name: "ময়মনসিংহ", order: 8 },
];

// Jobs data — companyIndex references companiesData array index (0-based)
const jobsData = [
  {
    title: "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার",
    titleEn: "Senior Software Engineer",
    companyIndex: 0, // Grameenphone
    location: "ঢাকা",
    jobType: "পূর্ণকালীন",
    category: "প্রযুক্তি",
    experience: "৩-৫ বছর",
    salary: "৮০,০০০ - ১,২০,০০০ টাকা",
    salaryMin: 80000,
    salaryMax: 120000,
    deadline: "২০২৬-০৪-৩০",
    featured: true,
    urgent: false,
    skills: ["React.js", "Node.js", "MongoDB", "AWS", "TypeScript"],
    description: `গ্রামীণফোনের ডিজিটাল সার্ভিস টিমে আমরা একজন অভিজ্ঞ সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার খুঁজছি।

**দায়িত্বসমূহ:**
• আধুনিক ওয়েব অ্যাপ্লিকেশন ডিজাইন ও ডেভেলপমেন্ট
• জুনিয়র ডেভেলপারদের মেন্টরিং ও কোড রিভিউ
• টেকনিক্যাল আর্কিটেকচার ডিজাইন
• পারফরম্যান্স অপটিমাইজেশন ও বাগ ফিক্সিং
• AWS ক্লাউড সার্ভিস পরিচালনা

**প্রয়োজনীয় যোগ্যতা:**
• CSE/EEE/সমমান বিভাগে স্নাতক
• React.js ও Node.js-এ দক্ষতা
• ৩-৫ বছরের প্রাসঙ্গিক অভিজ্ঞতা
• ইংরেজি যোগাযোগে দক্ষ`,
    requirements: ["B.Sc in CSE/EEE", "৩+ বছর অভিজ্ঞতা", "React/Node দক্ষতা"],
    benefits: ["প্রভিডেন্ট ফান্ড", "গ্রুপ ইন্স্যুরেন্স", "মোবাইল সিম", "বার্ষিক বোনাস"],
    vacancies: 3,
  },
  {
    title: "ডিজিটাল মার্কেটিং এক্সিকিউটিভ",
    titleEn: "Digital Marketing Executive",
    companyIndex: 3, // Shajgoj
    location: "ঢাকা",
    jobType: "পূর্ণকালীন",
    category: "মার্কেটিং",
    experience: "১-৩ বছর",
    salary: "৩০,০০০ - ৪৫,০০০ টাকা",
    salaryMin: 30000,
    salaryMax: 45000,
    deadline: "২০২৬-০৪-১৫",
    featured: false,
    urgent: true,
    skills: ["SEO", "Facebook Ads", "Google Ads", "Content Marketing", "Analytics"],
    description: `শাজগোজের মার্কেটিং টিমে ডিজিটাল মার্কেটিং এক্সিকিউটিভ পদে যোগ দিন।

**দায়িত্বসমূহ:**
• ফেসবুক ও গুগল অ্যাড ক্যাম্পেইন পরিচালনা
• SEO কন্টেন্ট তৈরি ও অপটিমাইজেশন
• সোশ্যাল মিডিয়া ম্যানেজমেন্ট
• Analytics রিপোর্ট তৈরি ও বিশ্লেষণ
• ইনফ্লুয়েন্সার মার্কেটিং কো-অর্ডিনেশন`,
    requirements: ["স্নাতক (যেকোনো বিষয়)", "ডিজিটাল মার্কেটিং অভিজ্ঞতা", "ক্রিয়েটিভ রাইটিং দক্ষতা"],
    benefits: ["বোনাস", "পণ্য ছাড়", "ফ্লেক্সিবল সময়"],
    vacancies: 2,
  },
  {
    title: "ব্যাংক অফিসার (জেনারেল ব্যাংকিং)",
    titleEn: "Bank Officer - General Banking",
    companyIndex: 2, // Dutch-Bangla Bank
    location: "ঢাকা, চট্টগ্রাম, সিলেট",
    jobType: "পূর্ণকালীন",
    category: "ব্যাংকিং",
    experience: "০-২ বছর",
    salary: "৪০,০০০ - ৬০,০০০ টাকা",
    salaryMin: 40000,
    salaryMax: 60000,
    deadline: "২০২৬-০৫-০১",
    featured: true,
    urgent: false,
    skills: ["ব্যাংকিং", "কাস্টমার সার্ভিস", "MS Office", "হিসাব বিজ্ঞান"],
    description: `ডাচ-বাংলা ব্যাংকে জেনারেল ব্যাংকিং বিভাগে অফিসার নিয়োগ দেওয়া হবে।

**দায়িত্বসমূহ:**
• গ্রাহকদের ব্যাংকিং সেবা প্রদান
• অ্যাকাউন্ট খোলা ও পরিচালনা
• লোন প্রসেসিং সহায়তা
• কমপ্লায়েন্স নিশ্চিতকরণ`,
    requirements: ["স্নাতক/স্নাতকোত্তর", "CGPA 3.0+", "ব্যাংকিং জ্ঞান সুবিধাজনক"],
    benefits: ["প্রভিডেন্ট ফান্ড", "গ্রাচুইটি", "কার লোন", "হোম লোন"],
    vacancies: 20,
  },
  {
    title: "প্রোগ্রাম অফিসার",
    titleEn: "Program Officer",
    companyIndex: 1, // BRAC
    location: "জাতীয়ব্যাপী",
    jobType: "পূর্ণকালীন",
    category: "এনজিও / উন্নয়ন",
    experience: "২-৪ বছর",
    salary: "৩৫,০০০ - ৫০,০০০ টাকা",
    salaryMin: 35000,
    salaryMax: 50000,
    deadline: "২০২৬-০৪-২০",
    featured: false,
    urgent: false,
    skills: ["প্রোজেক্ট ম্যানেজমেন্ট", "রিপোর্ট রাইটিং", "কমিউনিটি এনগেজমেন্ট", "M&E"],
    description: `ব্র্যাকের মাইক্রোফাইন্যান্স প্রোগ্রামে প্রোগ্রাম অফিসার নিয়োগ।

**দায়িত্বসমূহ:**
• প্রোগ্রাম বাস্তবায়ন ও মনিটরিং
• ফিল্ড ভিজিট ও ডেটা কালেকশন
• রিপোর্ট প্রস্তুতি ও উপস্থাপনা
• স্টেকহোল্ডার সমন্বয়`,
    requirements: ["সামাজিক বিজ্ঞান/উন্নয়ন স্টাডিজে স্নাতক", "ফিল্ড ওয়ার্ক অভিজ্ঞতা"],
    benefits: ["প্রভিডেন্ট ফান্ড", "স্বাস্থ্য বীমা", "প্রশিক্ষণ সুবিধা"],
    vacancies: 15,
  },
  {
    title: "মেডিক্যাল প্রমোশন অফিসার",
    titleEn: "Medical Promotion Officer",
    companyIndex: 4, // Square Pharma
    location: "ঢাকা, রাজশাহী, খুলনা",
    jobType: "পূর্ণকালীন",
    category: "ফার্মা / স্বাস্থ্য",
    experience: "০-১ বছর",
    salary: "২৫,০০০ - ৩৫,০০০ টাকা",
    salaryMin: 25000,
    salaryMax: 35000,
    deadline: "২০২৬-০৪-২৫",
    featured: false,
    urgent: true,
    skills: ["বিক্রয়", "ফার্মাকোলজি", "কমিউনিকেশন", "ড্রাইভিং লাইসেন্স"],
    description: `স্কয়ার ফার্মাসিউটিক্যালসে মেডিক্যাল প্রমোশন অফিসার পদে আবেদন করুন।

**দায়িত্বসমূহ:**
• ডাক্তার ও হাসপাতালে পণ্য প্রমোশন
• বিক্রয় লক্ষ্যমাত্রা অর্জন
• মার্কেট রিপোর্ট প্রস্তুতি`,
    requirements: ["ফার্মেসি/BSc বায়োলজি ডিগ্রি", "মোটরবাইক চালানোর সক্ষমতা"],
    benefits: ["মোবাইল বিল", "যাতায়াত ভাতা", "উৎসব বোনাস"],
    vacancies: 30,
  },
  {
    title: "ফুলস্ট্যাক ডেভেলপার",
    titleEn: "Full Stack Developer",
    companyIndex: 5, // Chaldal
    location: "ঢাকা (রিমোট সম্ভব)",
    jobType: "পূর্ণকালীন",
    category: "প্রযুক্তি",
    experience: "২-৪ বছর",
    salary: "৬০,০০০ - ৯০,০০০ টাকা",
    salaryMin: 60000,
    salaryMax: 90000,
    deadline: "২০২৬-০৪-১৮",
    featured: true,
    urgent: false,
    skills: ["React.js", "Python", "Django", "PostgreSQL", "Docker", "Redis"],
    description: `চালডালের ইঞ্জিনিয়ারিং টিমে ফুলস্ট্যাক ডেভেলপার পদে যোগ দিন।

**দায়িত্বসমূহ:**
• ফ্রন্টএন্ড ও ব্যাকএন্ড ফিচার ডেভেলপমেন্ট
• ডেটাবেজ ডিজাইন ও অপটিমাইজেশন
• API ডিজাইন ও ইন্টিগ্রেশন
• কোড কোয়ালিটি মেইনটেইন`,
    requirements: ["CSE ডিগ্রি", "React ও Python অভিজ্ঞতা", "২+ বছর"],
    benefits: ["রিমোট ওয়ার্ক", "ট্রেনিং বাজেট", "স্বাস্থ্য বীমা"],
    vacancies: 4,
  },
  {
    title: "হিউম্যান রিসোর্স অফিসার",
    titleEn: "Human Resource Officer",
    companyIndex: 0, // Grameenphone
    location: "ঢাকা",
    jobType: "পূর্ণকালীন",
    category: "এইচআর",
    experience: "২-৪ বছর",
    salary: "৫০,০০০ - ৭০,০০০ টাকা",
    salaryMin: 50000,
    salaryMax: 70000,
    deadline: "২০২৬-০৫-১০",
    featured: false,
    urgent: false,
    skills: ["HRMS", "রিক্রুটমেন্ট", "পেরোল", "এমপ্লয়ি রিলেশন"],
    description: `গ্রামীণফোনে HR টিমে অফিসার পদে যোগ দিন।

**দায়িত্বসমূহ:**
• রিক্রুটমেন্ট ও অনবোর্ডিং পরিচালনা
• পেরোল প্রসেসিং
• কর্মী সম্পর্ক ব্যবস্থাপনা`,
    requirements: ["BBA/MBA (HRM)", "HR সফটওয়্যার জ্ঞান"],
    benefits: ["প্রভিডেন্ট ফান্ড", "গ্রুপ ইন্স্যুরেন্স", "মোবাইল সিম"],
    vacancies: 2,
  },
  {
    title: "গ্রাফিক ডিজাইনার",
    titleEn: "Graphic Designer",
    companyIndex: 3, // Shajgoj
    location: "ঢাকা",
    jobType: "পার্টটাইম / ফ্রিল্যান্স",
    category: "ডিজাইন",
    experience: "১-২ বছর",
    salary: "২০,০০০ - ৩০,০০০ টাকা",
    salaryMin: 20000,
    salaryMax: 30000,
    deadline: "২০২৬-০৪-০৫",
    featured: false,
    urgent: true,
    skills: ["Adobe Photoshop", "Illustrator", "Figma", "ব্র্যান্ড ডিজাইন"],
    description: `শাজগোজের ক্রিয়েটিভ টিমে গ্রাফিক ডিজাইনার দরকার।

**দায়িত্বসমূহ:**
• সোশ্যাল মিডিয়া পোস্ট ডিজাইন
• প্রোডাক্ট ব্যানার ও প্রমোশনাল ম্যাটেরিয়াল তৈরি
• ব্র্যান্ড গাইডলাইন মেনে ডিজাইন`,
    requirements: ["পোর্টফোলিও দাখিল করতে হবে", "Adobe Suite দক্ষতা"],
    benefits: ["ফ্লেক্সিবল সময়", "পণ্য ছাড়", "বোনাস"],
    vacancies: 1,
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // ===== 1. Seed Users (Super Admin, Admin, Vendor) =====
  let superAdmin = await User.findOne({ email: "superadmin@sholokjobs.com" });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@sholokjobs.com",
      password: "SuperAdmin@123",
      role: "super_admin",
    });
    console.log("✅ Super Admin created");
  } else {
    console.log("ℹ️  Super Admin already exists");
  }

  let admin = await User.findOne({ email: "admin@sholokjobs.com" });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: "admin@sholokjobs.com",
      password: "Admin@123",
      role: "admin",
    });
    console.log("✅ Admin created");
  } else {
    console.log("ℹ️  Admin already exists");
  }

  // Create a vendor user for seeded jobs
  let vendor = await User.findOne({ email: "vendor@sholokjobs.com" });
  if (!vendor) {
    vendor = await User.create({
      name: "Sholok Vendor",
      email: "vendor@sholokjobs.com",
      password: "Vendor@123",
      role: "vendor",
      company: "Sholok Jobs",
    });
    console.log("✅ Vendor created: vendor@sholokjobs.com / Vendor@123");
  } else {
    console.log("ℹ️  Vendor already exists");
  }

  // ===== 2. Seed Categories =====
  console.log("\n--- Seeding Categories ---");
  await Category.deleteMany({});
  const createdCategories = await Category.insertMany(categoriesData);
  console.log(`✅ ${createdCategories.length} categories seeded`);

  // ===== 3. Seed Locations =====
  console.log("\n--- Seeding Locations ---");
  await Location.deleteMany({});
  const createdLocations = await Location.insertMany(locationsData);
  console.log(`✅ ${createdLocations.length} locations seeded`);

  // ===== 4. Seed Companies =====
  console.log("\n--- Seeding Companies ---");
  await Company.deleteMany({});
  const createdCompanies = await Company.insertMany(
    companiesData.map((c) => ({ ...c, createdBy: superAdmin._id }))
  );
  console.log(`✅ ${createdCompanies.length} companies seeded`);

  // ===== 5. Seed Jobs (all approved) =====
  console.log("\n--- Seeding Jobs ---");
  await Job.deleteMany({});
  const jobsToInsert = jobsData.map((jobData) => {
    const company = createdCompanies[jobData.companyIndex];
    const { companyIndex, ...rest } = jobData;
    return {
      ...rest,
      company: company.name,
      companyLogo: company.logo,
      companyRef: company._id,
      createdBy: vendor._id,
      status: "approved",
    };
  });
  const createdJobs = await Job.insertMany(jobsToInsert);
  console.log(`✅ ${createdJobs.length} jobs seeded (all approved)`);

  // ===== Summary =====
  console.log("\n========================================");
  console.log("🎉 Seeding Complete!");
  console.log("========================================");
  console.log(`Users: Super Admin, Admin, Vendor`);
  console.log(`Companies: ${createdCompanies.length}`);
  console.log(`Categories: ${createdCategories.length}`);
  console.log(`Locations: ${createdLocations.length}`);
  console.log(`Jobs: ${createdJobs.length} (approved)`);
  console.log("\nLogin credentials:");
  console.log("  Super Admin: superadmin@sholokjobs.com / SuperAdmin@123");
  console.log("  Admin:       admin@sholokjobs.com / Admin@123");
  console.log("  Vendor:      vendor@sholokjobs.com / Vendor@123");

  await mongoose.disconnect();
}

seed().catch(console.error);

