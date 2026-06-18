import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Store, Package, ShoppingCart, CreditCard,
  BarChart3, Megaphone, Globe, Shield, Brain, FileText, Settings,
  ChevronDown, ChevronRight, Search, Bell, Menu, X,
  UserCheck, Boxes, Truck, Wallet, TrendingUp, Sparkles,
  Lock, Database, Activity, Newspaper, MessageSquare, ShoppingBag,
  Map, HelpCircle, BookOpen, Tv, Music, Languages,
  Cloud, Building, Star, BadgeDollarSign, Briefcase
} from "lucide-react";
import TakaIcon from "@/components/TakaIcon";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarSection {
  title: string;
  titleKey: string;
  icon: React.ElementType;
  path?: string;
  children?: { title: string; titleKey: string; path: string; icon: React.ElementType }[];
}

const sidebarSections: SidebarSection[] = [
  { title: "Dashboard", titleKey: "dashboardNav", icon: LayoutDashboard, path: "/" },
  {
    title: "Users & Vendors", titleKey: "usersAndVendors", icon: Users,
    children: [
      { title: "All Users", titleKey: "allUsers", path: "/users", icon: Users },
      { title: "Vendor Applications", titleKey: "vendorApplications", path: "/vendors/applications", icon: UserCheck },
      { title: "KYC Verification", titleKey: "kycVerification", path: "/vendors/kyc", icon: Shield },
      { title: "Vendor Performance", titleKey: "vendorPerformance", path: "/vendors/performance", icon: TrendingUp },
    ],
  },
  {
    title: "Products", titleKey: "products", icon: Package,
    children: [
      { title: "All Products", titleKey: "allProducts", path: "/products", icon: Package },
      { title: "Categories", titleKey: "categories", path: "/products/categories", icon: Boxes },
      { title: "Approvals", titleKey: "approvals", path: "/products/approvals", icon: FileText },
      { title: "Inventory", titleKey: "inventory", path: "/products/inventory", icon: Database },
    ],
  },
  {
    title: "Orders & Shipping", titleKey: "ordersAndShipping", icon: ShoppingCart,
    children: [
      { title: "All Orders", titleKey: "allOrders", path: "/orders", icon: ShoppingCart },
      { title: "Shipping", titleKey: "shipping", path: "/orders/shipping", icon: Truck },
      { title: "Returns & Refunds", titleKey: "returnsRefunds", path: "/orders/returns", icon: Package },
    ],
  },
  {
    title: "Payments", titleKey: "payments", icon: CreditCard,
    children: [
      { title: "Transactions", titleKey: "transactions", path: "/payments/transactions", icon: CreditCard },
      { title: "Commission", titleKey: "commission", path: "/payments/commission", icon: TakaIcon },
      { title: "Payouts", titleKey: "payouts", path: "/payments/payouts", icon: Wallet },
      { title: "Settlement", titleKey: "settlement", path: "/payments/settlement", icon: TakaIcon },
    ],
  },
  { title: "Analytics", titleKey: "analytics", icon: BarChart3, path: "/analytics" },
  {
    title: "Marketing", titleKey: "marketing", icon: Megaphone,
    children: [
      { title: "Campaigns", titleKey: "campaigns", path: "/marketing/campaigns", icon: Megaphone },
      { title: "Coupons", titleKey: "coupons", path: "/marketing/coupons", icon: Star },
      { title: "Banners", titleKey: "banners", path: "/marketing/banners", icon: FileText },
    ],
  },
  {
    title: "Portal Services", titleKey: "portalServices", icon: Globe,
    children: [
      { title: "Module Control", titleKey: "settings", path: "/portal/modules", icon: Settings },
      { title: "News", titleKey: "news", path: "/portal/news", icon: Newspaper },
      { title: "Blog / Cafe", titleKey: "blogCafe", path: "/portal/blog", icon: MessageSquare },
      { title: "Shopping", titleKey: "shopping", path: "/portal/shopping", icon: ShoppingBag },
      { title: "Maps", titleKey: "maps", path: "/portal/maps", icon: Map },
      { title: "Q&A", titleKey: "qa", path: "/portal/qa", icon: HelpCircle },
      { title: "eBooks / Webtoon", titleKey: "ebooksWebtoon", path: "/portal/ebooks", icon: BookOpen },
      { title: "Video / TV", titleKey: "videoTv", path: "/portal/video", icon: Tv },
      { title: "Music", titleKey: "music", path: "/portal/music", icon: Music },
      { title: "Translator", titleKey: "translator", path: "/portal/translator", icon: Languages },
      { title: "Finance", titleKey: "finance", path: "/portal/finance", icon: TakaIcon },
      { title: "Weather", titleKey: "weather", path: "/portal/weather", icon: Cloud },
      { title: "Real Estate", titleKey: "realEstate", path: "/portal/realestate", icon: Building },
      { title: "Job Portal", titleKey: "jobPortal", path: "/portal/jobs", icon: Briefcase },
    ],
  },
  { title: "AI & Insights", titleKey: "aiInsights", icon: Brain, path: "/ai" },
  {
    title: "Security", titleKey: "security", icon: Lock,
    children: [
      { title: "Activity Logs", titleKey: "activityLogs", path: "/security/logs", icon: Activity },
      { title: "Platform Rules", titleKey: "platformRules", path: "/security/rules", icon: Shield },
      { title: "Fraud Detection", titleKey: "fraudDetection", path: "/security/fraud", icon: Lock },
    ],
  },
  { title: "Settings", titleKey: "settings", icon: Settings, path: "/settings" },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Dashboard"]);
  const location = useLocation();
  const { t } = useLanguage();

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isSectionActive = (section: SidebarSection) => {
    if (section.path) return isActive(section.path);
    return section.children?.some(c => isActive(c.path));
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              {/* Text mark */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black tracking-tight gradient-text-neon" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Sholok
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-black" style={{ background: "var(--gradient-neon)", lineHeight: 1.4 }}>
                    ADMIN
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-px" style={{ background: "var(--gradient-neon)" }} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Multi-Vendor
                  </span>
                  <span className="flex-1 h-px" style={{ background: "linear-gradient(to right, hsl(var(--muted)), transparent)" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-muted-foreground">
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-muted-foreground text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>{t("search")}</span>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            {section.path ? (
              <NavLink to={section.path}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`sidebar-item ${isActive(section.path) ? "active" : ""}`}
                >
                  <section.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{t(section.titleKey)}</span>}
                </motion.div>
              </NavLink>
            ) : (
              <>
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleSection(section.title)}
                  className={`sidebar-item w-full ${isSectionActive(section) ? "text-foreground" : ""}`}
                >
                  <section.icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{t(section.titleKey)}</span>
                      <motion.div
                        animate={{ rotate: expandedSections.includes(section.title) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
                <AnimatePresence>
                  {!collapsed && expandedSections.includes(section.title) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-3 border-l border-border/30 pl-2"
                    >
                      {section.children?.map((child) => (
                        <NavLink to={child.path} key={child.path}>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className={`sidebar-item text-xs py-2 ${isActive(child.path) ? "active" : ""}`}
                          >
                            <child.icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{t(child.titleKey)}</span>
                          </motion.div>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 border-t border-sidebar-border"
        >
          <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
            <div className="px-3 py-1.5 rounded-full flex items-center justify-center font-black text-sm tracking-widest shrink-0" style={{ background: "var(--gradient-neon)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.15em", boxShadow: "0 0 12px hsl(160,100%,50%,0.4)" }}>
              <span className="text-black">Sholok</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">Sholok Multi-Vendor Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@sholok.com</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
