import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { Filter, Star, ShoppingCart, Heart } from "lucide-react";

const products = [
    { id: 1, name: "Wireless Headphones", price: 1200, rating: 4.5, reviews: 120, image: "🎧" },
    { id: 2, name: "Smart Watch Series 7", price: 25000, rating: 4.8, reviews: 85, image: "⌚" },
    { id: 3, name: "Gaming Mouse RGB", price: 1500, rating: 4.2, reviews: 200, image: "🖱️" },
    { id: 4, name: "Mechanical Keyboard", price: 4500, rating: 4.7, reviews: 150, image: "⌨️" },
    { id: 5, name: "Laptop Stand", price: 800, rating: 4.0, reviews: 50, image: "💻" },
    { id: 6, name: "USB-C Hub", price: 2200, rating: 4.3, reviews: 90, image: "🔌" },
];

const filters = [
    { name: "Price Range", options: ["Under ৳1000", "৳1000 - ৳5000", "৳5000 - ৳20000", "Over ৳20000"] },
    { name: "Brand", options: ["Samsung", "Apple", "Sony", "Logitech", "Xiaomi"] },
    { name: "Rating", options: ["4 Stars & Up", "3 Stars & Up", "2 Stars & Up"] }
];

const Shopping = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <aside className="hidden lg:block w-64 space-y-6 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-lg">Filters</h2>
                        </div>
                        {filters.map((filter) => (
                            <div key={filter.name} className="border-b border-border pb-4 last:border-0">
                                <h3 className="font-semibold mb-3">{filter.name}</h3>
                                <div className="space-y-2">
                                    {filter.options.map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                            <span className="text-sm text-muted-foreground group-hover:text-foreground">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold">Featured Products</h1>
                            <select className="bg-card border border-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>Sort by: Featured</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Best Selling</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all group relative">
                                    <button className="absolute top-3 right-3 p-2 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-portal-red hover:text-white">
                                        <Heart className="w-4 h-4" />
                                    </button>

                                    <div className="aspect-square bg-secondary/50 rounded-lg mb-4 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                                        {product.image}
                                    </div>

                                    <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>

                                    <div className="flex items-center gap-1 mb-2">
                                        <Star className="w-3 h-3 text-amber-500 fill-current" />
                                        <span className="text-xs font-medium">{product.rating}</span>
                                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-lg font-bold text-primary">৳{product.price}</span>
                                        <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
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

export default Shopping;
