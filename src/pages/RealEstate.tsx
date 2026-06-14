import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, MapPin, Bed, Bath, Square, TrendingUp, Home, Building, Search, Filter, X, ZoomIn, Phone, Mail, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";

const RealEstate = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("residential");
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    const featuredProperties = [
        {
            id: 1,
            title: "Luxury Apartment in Gulshan",
            location: "Gulshan 2, Dhaka",
            price: "৳ 2.5 Crore",
            type: "Residential",
            bedrooms: 4,
            bathrooms: 4,
            area: "2,800 sq ft",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop",
            status: "For Sale",
            featured: true,
            description: "A stunning luxury apartment located in the heart of Gulshan 2, one of Dhaka's most prestigious neighborhoods. This property features modern architecture, high-quality finishes, and breathtaking city views.",
            features: ["Swimming Pool", "Gym", "24/7 Security", "Parking Space", "Generator Backup", "Lift", "Rooftop Garden"],
            yearBuilt: 2022,
            floor: "10th Floor",
            facing: "South",
            contactPhone: "+880 1711-123456",
            contactEmail: "gulshan.luxury@realestate.com"
        },
        {
            id: 2,
            title: "Modern Office Space in Banani",
            location: "Banani, Dhaka",
            price: "৳ 5 Crore",
            type: "Commercial",
            bedrooms: null,
            bathrooms: 3,
            area: "4,500 sq ft",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop",
            status: "For Sale",
            featured: true,
            description: "Prime commercial office space in Banani's business district. Perfect for corporate offices, startups, or multinational companies. Modern amenities and excellent connectivity.",
            features: ["Conference Rooms", "High-Speed Internet", "Central AC", "Reception Area", "Cafeteria", "Parking", "CCTV Security"],
            yearBuilt: 2021,
            floor: "5th-6th Floor",
            facing: "East",
            contactPhone: "+880 1711-234567",
            contactEmail: "banani.office@realestate.com"
        },
        {
            id: 3,
            title: "Duplex Villa in Dhanmondi",
            location: "Dhanmondi 8A, Dhaka",
            price: "৳ 1.8 Crore",
            type: "Residential",
            bedrooms: 5,
            bathrooms: 5,
            area: "3,200 sq ft",
            image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop",
            status: "For Rent",
            featured: false,
            description: "Spacious duplex villa in the prestigious Dhanmondi area. Perfect for large families seeking comfort and luxury in a well-established neighborhood.",
            features: ["Private Garden", "Rooftop Terrace", "Servant Quarter", "Garage", "Modern Kitchen", "Study Room"],
            yearBuilt: 2020,
            floor: "Ground + 1st Floor",
            facing: "North",
            contactPhone: "+880 1711-345678",
            contactEmail: "dhanmondi.villa@realestate.com"
        },
        {
            id: 4,
            title: "Commercial Building in Motijheel",
            location: "Motijheel, Dhaka",
            price: "৳ 12 Crore",
            type: "Commercial",
            bedrooms: null,
            bathrooms: 8,
            area: "8,000 sq ft",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
            status: "For Sale",
            featured: true,
            description: "Large commercial building in Motijheel's financial district. Ideal for banks, financial institutions, or large corporate offices. Strategic location with high foot traffic.",
            features: ["Elevator", "Generator", "Fire Safety System", "Security", "Multiple Entry Points", "Ample Parking"],
            yearBuilt: 2019,
            floor: "6 Floors",
            facing: "West",
            contactPhone: "+880 1711-456789",
            contactEmail: "motijheel.building@realestate.com"
        },
        {
            id: 5,
            title: "Sea View Apartment in Cox's Bazar",
            location: "Cox's Bazar",
            price: "৳ 1.2 Crore",
            type: "Residential",
            bedrooms: 3,
            bathrooms: 3,
            area: "1,800 sq ft",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
            status: "For Sale",
            featured: false,
            description: "Beautiful apartment with stunning sea views in Cox's Bazar. Perfect for vacation home or investment property. Just minutes from the beach.",
            features: ["Sea View Balcony", "Beach Access", "Swimming Pool", "Restaurant", "24/7 Security", "Furnished"],
            yearBuilt: 2023,
            floor: "8th Floor",
            facing: "South (Sea Facing)",
            contactPhone: "+880 1711-567890",
            contactEmail: "coxsbazar.seaview@realestate.com"
        },
        {
            id: 6,
            title: "Shopping Complex in Uttara",
            location: "Uttara Sector 7, Dhaka",
            price: "৳ 8 Crore",
            type: "Commercial",
            bedrooms: null,
            bathrooms: 6,
            area: "6,500 sq ft",
            image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop",
            status: "For Sale",
            featured: false,
            description: "Modern shopping complex in busy Uttara area. Multiple retail spaces available. High rental income potential with established tenants.",
            features: ["Multiple Shops", "Food Court", "Parking Facility", "Escalator", "Central AC", "ATM Booths"],
            yearBuilt: 2021,
            floor: "Ground + 3 Floors",
            facing: "Main Road",
            contactPhone: "+880 1711-678901",
            contactEmail: "uttara.complex@realestate.com"
        },
        {
            id: 7,
            title: "Residential Flat in Bashundhara",
            location: "Bashundhara R/A, Dhaka",
            price: "৳ 95 Lac",
            type: "Residential",
            bedrooms: 3,
            bathrooms: 3,
            area: "1,650 sq ft",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
            status: "For Sale",
            featured: false,
            description: "Affordable apartment in Bashundhara R/A, Dhaka's largest planned residential area. Great for young families and first-time home buyers.",
            features: ["Community Club", "Playground", "Security", "Generator", "Gas Line", "CCTV"],
            yearBuilt: 2022,
            floor: "6th Floor",
            facing: "East",
            contactPhone: "+880 1711-789012",
            contactEmail: "bashundhara.flat@realestate.com"
        },
        {
            id: 8,
            title: "Penthouse in Baridhara DOHS",
            location: "Baridhara DOHS, Dhaka",
            price: "৳ 4.5 Crore",
            type: "Residential",
            bedrooms: 5,
            bathrooms: 6,
            area: "4,200 sq ft",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
            status: "For Rent",
            featured: true,
            description: "Ultra-luxury penthouse in prestigious Baridhara DOHS. Features panoramic city views, private elevator access, and world-class amenities. Perfect for VIP clients.",
            features: ["Private Elevator", "Jacuzzi", "Home Theater", "Smart Home System", "Wine Cellar", "Gym", "Maid's Room"],
            yearBuilt: 2023,
            floor: "Top Floor (Penthouse)",
            facing: "360° View",
            contactPhone: "+880 1711-890123",
            contactEmail: "baridhara.penthouse@realestate.com"
        }
    ];

    const popularLocations = [
        { name: "Gulshan", properties: 245, avgPrice: "৳ 2.5 Cr" },
        { name: "Banani", properties: 189, avgPrice: "৳ 3.2 Cr" },
        { name: "Dhanmondi", properties: 312, avgPrice: "৳ 1.8 Cr" },
        { name: "Uttara", properties: 428, avgPrice: "৳ 95 Lac" },
        { name: "Bashundhara", properties: 567, avgPrice: "৳ 85 Lac" },
        { name: "Mirpur DOHS", properties: 198, avgPrice: "৳ 1.2 Cr" }
    ];

    const marketTrends = [
        { area: "Gulshan", trend: "+12%", period: "Last 6 months" },
        { area: "Banani", trend: "+8%", period: "Last 6 months" },
        { area: "Dhanmondi", trend: "+5%", period: "Last 6 months" },
        { area: "Uttara", trend: "+15%", period: "Last 6 months" }
    ];

    const filteredProperties = featuredProperties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            property.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" || 
                         (activeTab === "residential" && property.type === "Residential") ||
                         (activeTab === "commercial" && property.type === "Commercial");
        return matchesSearch && matchesTab;
    });

    const handleViewDetails = (property: any) => {
        setSelectedProperty(property);
        setIsDialogOpen(true);
        setIsImageZoomed(false);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedProperty(null);
        setIsImageZoomed(false);
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Property in Bangladesh</h1>
                        <p className="text-xl text-emerald-50">Explore the best real estate opportunities across the country</p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-4xl mx-auto bg-white rounded-xl p-2 shadow-2xl flex flex-col md:flex-row gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by location, property type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border-0 focus-visible:ring-0 text-foreground"
                            />
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-3">
                        <TabsTrigger value="all">All Properties</TabsTrigger>
                        <TabsTrigger value="residential">Residential</TabsTrigger>
                        <TabsTrigger value="commercial">Commercial</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                        {/* Featured Properties Grid */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-emerald-600" />
                                Featured Properties
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProperties.map((property) => (
                                    <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="relative">
                                            <img 
                                                src={property.image} 
                                                alt={property.title}
                                                className="w-full h-48 object-cover"
                                            />
                                            <Badge className="absolute top-3 right-3 bg-emerald-600">
                                                {property.status}
                                            </Badge>
                                            {property.featured && (
                                                <Badge className="absolute top-3 left-3 bg-yellow-500">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{property.title}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {property.location}
                                            </div>
                                            <div className="text-2xl font-bold text-emerald-600 mb-4">
                                                {property.price}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                {property.bedrooms && (
                                                    <div className="flex items-center gap-1">
                                                        <Bed className="w-4 h-4" />
                                                        {property.bedrooms}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Bath className="w-4 h-4" />
                                                    {property.bathrooms}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Square className="w-4 h-4" />
                                                    {property.area}
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => handleViewDetails(property)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Popular Locations */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                        Popular Locations in Dhaka
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {popularLocations.map((location, index) => (
                            <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-bold">{location.name}</h3>
                                    <Home className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-muted-foreground mb-2">
                                    {location.properties} Properties Available
                                </div>
                                <div className="text-lg font-semibold text-emerald-600">
                                    Avg: {location.avgPrice}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Market Trends */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                        Market Trends
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {marketTrends.map((trend, index) => (
                            <Card key={index} className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                                <div className="text-lg font-semibold mb-2">{trend.area}</div>
                                <div className="text-3xl font-bold text-emerald-600 mb-1">
                                    {trend.trend}
                                </div>
                                <div className="text-sm text-muted-foreground">{trend.period}</div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Bangladesh Real Estate Info */}
                <Card className="p-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Building className="w-6 h-6 text-emerald-600" />
                        About Real Estate in Bangladesh
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Market Overview</h3>
                            <p className="mb-4">
                                Bangladesh's real estate sector has experienced significant growth over the past decade. 
                                Dhaka, the capital city, leads the market with major developments in Gulshan, Banani, 
                                Dhanmondi, and emerging areas like Bashundhara R/A and Uttara.
                            </p>
                            <h3 className="font-semibold text-foreground mb-2">Investment Opportunities</h3>
                            <p>
                                The growing middle class and urbanization have created substantial demand for both 
                                residential and commercial properties. Key areas include Gulshan (premium), Banani 
                                (commercial hub), and Uttara (affordable housing).
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Popular Areas</h3>
                            <ul className="space-y-2 mb-4">
                                <li>• <strong>Gulshan:</strong> Premium residential and commercial hub</li>
                                <li>• <strong>Banani:</strong> High-end apartments and offices</li>
                                <li>• <strong>Dhanmondi:</strong> Established residential area</li>
                                <li>• <strong>Uttara:</strong> Fastest growing residential sector</li>
                                <li>• <strong>Bashundhara R/A:</strong> Modern planned residential area</li>
                                <li>• <strong>Mirpur DOHS:</strong> Military housing with excellent facilities</li>
                            </ul>
                            <h3 className="font-semibold text-foreground mb-2">Market Trends</h3>
                            <p>
                                Property prices have increased by 10-15% annually in prime locations. 
                                Green buildings and smart homes are emerging trends in the market.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Property Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
                    {selectedProperty && (
                        <div className="grid md:grid-cols-2 h-full">
                            {/* Image Section with Zoom */}
                            <div className="relative bg-black">
                                <div 
                                    className={`relative h-full min-h-[300px] md:min-h-[600px] overflow-hidden cursor-zoom-in ${isImageZoomed ? 'cursor-zoom-out' : ''}`}
                                    onClick={() => setIsImageZoomed(!isImageZoomed)}
                                >
                                    <img 
                                        src={selectedProperty.image} 
                                        alt={selectedProperty.title}
                                        className={`w-full h-full object-cover transition-transform duration-300 ${isImageZoomed ? 'scale-150' : 'scale-100'}`}
                                    />
                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                                        <ZoomIn className="w-4 h-4" />
                                        <span className="text-sm">Click to {isImageZoomed ? 'Zoom Out' : 'Zoom In'}</span>
                                    </div>
                                </div>
                                {selectedProperty.featured && (
                                    <Badge className="absolute top-4 left-4 bg-yellow-500">
                                        Featured Property
                                    </Badge>
                                )}
                                <Badge className="absolute top-4 right-4 bg-emerald-600">
                                    {selectedProperty.status}
                                </Badge>
                            </div>

                            {/* Details Section */}
                            <ScrollArea className="h-[600px]">
                                <div className="p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold mb-2">
                                            {selectedProperty.title}
                                        </DialogTitle>
                                    </DialogHeader>

                                    <div className="space-y-6 mt-4">
                                        {/* Location */}
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-5 h-5 text-emerald-600" />
                                            <span className="text-lg">{selectedProperty.location}</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-6 h-6 text-emerald-600" />
                                            <span className="text-3xl font-bold text-emerald-600">
                                                {selectedProperty.price}
                                            </span>
                                        </div>

                                        {/* Key Stats */}
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg">
                                            {selectedProperty.bedrooms && (
                                                <div className="flex items-center gap-3">
                                                    <Bed className="w-5 h-5 text-emerald-600" />
                                                    <div>
                                                        <div className="text-sm text-muted-foreground">Bedrooms</div>
                                                        <div className="font-semibold">{selectedProperty.bedrooms}</div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <Bath className="w-5 h-5 text-emerald-600" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Bathrooms</div>
                                                    <div className="font-semibold">{selectedProperty.bathrooms}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Square className="w-5 h-5 text-emerald-600" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Area</div>
                                                    <div className="font-semibold">{selectedProperty.area}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-emerald-600" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Year Built</div>
                                                    <div className="font-semibold">{selectedProperty.yearBuilt}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h3 className="font-bold text-lg mb-2">Description</h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {selectedProperty.description}
                                            </p>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Floor:</span>
                                                <span className="ml-2 font-semibold">{selectedProperty.floor}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Facing:</span>
                                                <span className="ml-2 font-semibold">{selectedProperty.facing}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Type:</span>
                                                <span className="ml-2 font-semibold">{selectedProperty.type}</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        {selectedProperty.features && selectedProperty.features.length > 0 && (
                                            <div>
                                                <h3 className="font-bold text-lg mb-3">Features & Amenities</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedProperty.features.map((feature: string, index: number) => (
                                                        <div key={index} className="flex items-center gap-2 text-sm">
                                                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                                            <span>{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        <div className="border-t pt-6 space-y-3">
                                            <h3 className="font-bold text-lg mb-3">Contact Information</h3>
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Phone className="w-5 h-5 text-emerald-600" />
                                                <a href={`tel:${selectedProperty.contactPhone}`} className="hover:text-emerald-600">
                                                    {selectedProperty.contactPhone}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Mail className="w-5 h-5 text-emerald-600" />
                                                <a href={`mailto:${selectedProperty.contactEmail}`} className="hover:text-emerald-600">
                                                    {selectedProperty.contactEmail}
                                                </a>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call Now
                                            </Button>
                                            <Button variant="outline" className="flex-1">
                                                <Mail className="w-4 h-4 mr-2" />
                                                Send Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
};

export default RealEstate;
