import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { PenTool, MessageSquare, Heart, Share2 } from "lucide-react";

const posts = [
  
    {
        id: 2,
        title: "Travel Guide: Hidden Gems of Sylhet",
        excerpt: "Explore the tea gardens and waterfalls of Bangladesh's most beautiful region.",
        author: "TravelBug",
        date: "Jan 12, 2026",
        likes: 89,
        comments: 15,
        image: "🍃"
    },
    {
        id: 3,
        title: "Healthy Breakfast Recipes for Busy Mornings",
        excerpt: "Start your day right with these nutritious and quick meal ideas.",
        author: "FoodieLife",
        date: "Jan 10, 2026",
        likes: 256,
        comments: 67,
        image: "🥑"
    }
];

const Blog = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Sholok Blog</h1>
                        <p className="text-muted-foreground">Stories, ideas, and perspectives from our community.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        <PenTool className="w-4 h-4" /> Write a Story
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {posts.map((post) => (
                            <article key={post.id} className="group cursor-pointer">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                                    <div className="aspect-[21/9] bg-secondary flex items-center justify-center text-6xl">
                                        {post.image}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                {post.author[0]}
                                            </div>
                                            <span className="text-sm font-medium">{post.author}</span>
                                            <span className="text-sm text-muted-foreground">• {post.date}</span>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h2>
                                        <p className="text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>

                                        <div className="flex items-center justify-between border-t border-border pt-4">
                                            <div className="flex items-center gap-6">
                                                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-portal-red transition-colors">
                                                    <Heart className="w-4 h-4" /> {post.likes}
                                                </button>
                                                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-portal-blue transition-colors">
                                                    <MessageSquare className="w-4 h-4" /> {post.comments}
                                                </button>
                                            </div>
                                            <button className="text-muted-foreground hover:text-foreground">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="space-y-8">
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="font-bold mb-4">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {["Technology", "Travel", "Food", "Health", "Lifestyle", "Programming", "Art"].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-full cursor-pointer transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-portal-green/10 to-portal-blue/10 border border-border rounded-xl p-6">
                            <h3 className="font-bold mb-2">Join the Community</h3>
                            <p className="text-sm text-muted-foreground mb-4">Connect with thousands of writers and readers on Sholok.</p>
                            <button className="w-full py-2 bg-background border border-border hover:bg-secondary rounded-lg font-medium transition-colors">
                                Sign Up Now
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Blog;
