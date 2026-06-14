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
  Cloud, Building, Star, BadgeDollarSign
} from "lucide-react";
import TakaIcon from "@/components/TakaIcon";

interface SidebarSection {
  title: string;
  icon: React.ElementType;
  path?: string;
  children?: { title: string; path: string; icon: React.ElementType }[];
}

const sidebarSections: SidebarSection[] = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  {
    title: "Users & Vendors", icon: Users,
    children: [
      { title: "All Users", path: "/users", icon: Users },
      { title: "Vendor Applications", path: "/vendors/applications", icon: UserCheck },
      { title: "KYC Verification", path: "/vendors/kyc", icon: Shield },
      { title: "Vendor Performance", path: "/vendors/performance", icon: TrendingUp },
    ],
  },
  {
    title: "Products", icon: Package,
    children: [
      { title: "All Products", path: "/products", icon: Package },
      { title: "Categories", path: "/products/categories", icon: Boxes },
      { title: "Approvals", path: "/products/approvals", icon: FileText },
      { title: "Inventory", path: "/products/inventory", icon: Database },
    ],
  },
  {
    title: "Orders & Shipping", icon: ShoppingCart,
    children: [
      { title: "All Orders", path: "/orders", icon: ShoppingCart },
      { title: "Shipping", path: "/orders/shipping", icon: Truck },
      { title: "Returns & Refunds", path: "/orders/returns", icon: Package },
    ],
  },
  {
    title: "Payments", icon: CreditCard,
    children: [
      { title: "Transactions", path: "/payments/transactions", icon: CreditCard },
      { title: "Commission", path: "/payments/commission", icon: TakaIcon },
      { title: "Payouts", path: "/payments/payouts", icon: Wallet },
      { title: "Settlement", path: "/payments/settlement", icon: TakaIcon },
    ],
  },
  { title: "Analytics", icon: BarChart3, path: "/analytics" },
  {
    title: "Marketing", icon: Megaphone,
    children: [
      { title: "Campaigns", path: "/marketing/campaigns", icon: Megaphone },
      { title: "Coupons", path: "/marketing/coupons", icon: Star },
      { title: "Banners", path: "/marketing/banners", icon: FileText },
    ],
  },
  {
    title: "Portal Services", icon: Globe,
    children: [
      { title: "Module Control", path: "/portal/modules", icon: Settings },
      { title: "News", path: "/portal/news", icon: Newspaper },
      { title: "Blog / Cafe", path: "/portal/blog", icon: MessageSquare },
      { title: "Shopping", path: "/portal/shopping", icon: ShoppingBag },
      { title: "Maps", path: "/portal/maps", icon: Map },
      { title: "Q&A", path: "/portal/qa", icon: HelpCircle },
      { title: "eBooks / Webtoon", path: "/portal/ebooks", icon: BookOpen },
      { title: "Video / TV", path: "/portal/video", icon: Tv },
      { title: "Music", path: "/portal/music", icon: Music },
      { title: "Translator", path: "/portal/translator", icon: Languages },
      { title: "Finance", path: "/portal/finance", icon: TakaIcon },
      { title: "Weather", path: "/portal/weather", icon: Cloud },
      { title: "Real Estate", path: "/portal/realestate", icon: Building },
    ],
  },
  { title: "AI & Insights", icon: Brain, path: "/ai" },
  {
    title: "Security", icon: Lock,
    children: [
      { title: "Activity Logs", path: "/security/logs", icon: Activity },
      { title: "Platform Rules", path: "/security/rules", icon: Shield },
      { title: "Fraud Detection", path: "/security/fraud", icon: Lock },
    ],
  },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["Dashboard"]);
  const location = useLocation();

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
            <span>Search...</span>
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
                  {!collapsed && <span>{section.title}</span>}
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
                      <span className="flex-1 text-left">{section.title}</span>
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
                            <span>{child.title}</span>
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
