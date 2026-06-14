import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { User, Settings, Bell, Heart, History, LogOut } from "lucide-react";

const Profile = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Cover Photo */}
                    <div className="h-32 bg-gradient-to-r from-portal-green to-portal-blue"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Header */}
                        <div className="relative -mt-12 mb-6 flex items-end justify-between">
                            <div className="flex items-end gap-4">
                                <div className="w-24 h-24 rounded-full bg-background p-1 border-4 border-background">
                                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-4xl">😎</div>
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-2xl font-bold">Sholok User</h1>
                                    <p className="text-muted-foreground">@sholok_fan • Joined Jan 2026</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors mb-2">
                                Edit Profile
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-1 border-b border-border mb-8 overflow-x-auto">
                            <button className="px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary">Overview</button>
                            <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">Orders</button>
                            <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">Wishlist</button>
                            <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">Settings</button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 bg-secondary/30 rounded-xl border border-border flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Bell className="w-5 h-5" /></div>
                                <div>
                                    <span className="block text-2xl font-bold">12</span>
                                    <span className="text-xs text-muted-foreground">Notifications</span>
                                </div>
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-xl border border-border flex items-center gap-4">
                                <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><Heart className="w-5 h-5" /></div>
                                <div>
                                    <span className="block text-2xl font-bold">5</span>
                                    <span className="text-xs text-muted-foreground">Saved Items</span>
                                </div>
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-xl border border-border flex items-center gap-4">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><History className="w-5 h-5" /></div>
                                <div>
                                    <span className="block text-2xl font-bold">28</span>
                                    <span className="text-xs text-muted-foreground">Recent Views</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions List */}
                        <div className="space-y-2">
                            <h3 className="font-bold mb-4">Account Settings</h3>
                            {[
                                { icon: Settings, label: "Account Preferences" },
                                { icon: Bell, label: "Notification Settings" },
                                { icon: LogOut, label: "Sign Out", color: "text-red-500" }
                            ].map((item, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-4 bg-card hover:bg-secondary rounded-xl transition-colors text-left group border border-transparent hover:border-border">
                                    <div className={`flex items-center gap-3 ${item.color || "text-foreground"}`}>
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    <div className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
