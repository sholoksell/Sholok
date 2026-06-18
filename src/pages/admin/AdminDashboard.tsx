import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { LayoutDashboard, Users, ShoppingBag, FileText, Settings, AreaChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminDashboard = () => {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-secondary/20 flex flex-col">
            <Header />

            <div className="flex-1 flex max-w-7xl mx-auto w-full">
                {/* Admin Sidebar */}
                <aside className="w-64 py-8 pr-8 hidden md:block">
                    <div className="space-y-1">
                        {[
                            { icon: LayoutDashboard, label: t("dashboard"), active: true },
                            { icon: Users, label: t("users") },
                            { icon: ShoppingBag, label: t("products") },
                            { icon: FileText, label: t("content") },
                            { icon: AreaChart, label: t("analytics") },
                            { icon: Settings, label: t("settings") },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${item.active
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Dashboard Content */}
                <main className="flex-1 py-8 px-4 md:px-0">
                    <h1 className="text-2xl font-bold mb-6">{t("adminOverview")}</h1>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: t("totalUsers"), value: "12,450", change: "+12%", color: "text-blue-600" },
                            { label: t("revenue"), value: "৳4,250,000", change: "+8%", color: "text-green-600" },
                            { label: t("activeOrders"), value: "345", change: "+24%", color: "text-purple-600" },
                            { label: t("supportTickets"), value: "12", change: "-5%", color: "text-red-600" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-card p-6 rounded-xl border border-border shadow-sm">
                                <p className="text-xs text-muted-foreground uppercase">{stat.label}</p>
                                <div className="flex items-end gap-2 mt-2">
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <span className={`text-xs font-bold ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{stat.change}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity Mock */}
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <h3 className="font-bold mb-4">{t("recentActivity")}</h3>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs">U{i}</div>
                                        <div>
                                            <p className="text-sm font-medium">{t("users")} #{1000 + i} {t("placedAnOrder")}</p>
                                            <p className="text-xs text-muted-foreground">2 {t("minutesAgo")}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-primary">{t("view")}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
