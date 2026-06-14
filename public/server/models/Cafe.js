const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  helpful: { type: Number, default: 0 },
});

const openingHoursSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Monday, Tuesday, etc.
  open: { type: String },  // "09:00"
  close: { type: String }, // "22:00"
  closed: { type: Boolean, default: false },
}, { _id: false });

const cafeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    images: [{ type: String }], // array of image URLs
    coverImage: { type: String },

    // Location
    city: {
      type: String,
      required: true,
      enum: ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Comilla', 'Narayanganj'],
      default: 'Dhaka',
    },
    area: { type: String, trim: true }, // e.g. "Gulshan 2", "Banani", "Dhanmondi"
    address: { type: String },

    // Classification
    establishmentType: [{
      type: String,
      enum: ['Restaurant', 'Coffee & Tea', 'Cafe', 'Quick Bites', 'Bakery', 'Dessert Shop', 'Juice Bar'],
    }],
    mealType: [{
      type: String,
      enum: ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Late Night Snacks', 'All Day'],
    }],
    cuisines: [{
      type: String,
      enum: ['Cafe', 'Asian', 'Bangladeshi', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'Japanese', 'Middle Eastern', 'Indian', 'Western', 'Fusion'],
    }],
    dishes: [{
      type: String,
      enum: ['Coffee', 'Tea', 'Cake', 'Desserts', 'Sandwiches', 'Burger', 'Pasta', 'Pizza', 'Salad', 'Waffle', 'Pancake', 'Smoothie', 'Juice', 'Milkshake', 'Croissant', 'Noodles'],
    }],

    // Pricing
    priceRange: {
      type: String,
      enum: ['Cheap Eats', 'Mid-range', 'Fine Dining'],
      default: 'Mid-range',
    },
    priceSymbol: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    minPrice: { type: Number }, // BDT
    maxPrice: { type: Number }, // BDT

    // Rating & Reviews
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // Hours
    openingHours: [openingHoursSchema],
    isOpenNow: { type: Boolean, default: true }, // computed or manual override

    // Awards & Recognition
    awards: [{
      type: String,
      enum: ["Travelers' Choice", 'Best Cafe 2024', 'Hidden Gem', 'Top Rated'],
    }],

    // Features & Amenities
    features: [{
      type: String,
      enum: ['Free WiFi', 'Outdoor Seating', 'Indoor Seating', 'Air Conditioning', 'Parking', 'Takeaway', 'Delivery', 'Live Music', 'Pet Friendly', 'Family Friendly', 'Private Room', 'Rooftop'],
    }],

    // Dietary
    dietaryRestrictions: [{
      type: String,
      enum: ['Vegetarian Friendly', 'Vegan Options', 'Gluten Free Options', 'Halal', 'No Pork'],
    }],

    // Contact
    phone: { type: String },
    website: { type: String },
    email: { type: String },

    // Meta
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    travelNotice: { type: String },
    googleMapsUrl: { type: String },
  },
  { timestamps: true }
);

// Indexes for fast filtering
cafeSchema.index({ city: 1, rating: -1 });
cafeSchema.index({ establishmentType: 1 });
cafeSchema.index({ cuisines: 1 });
cafeSchema.index({ priceRange: 1 });
cafeSchema.index({ isActive: 1 });
cafeSchema.index({ name: 'text', description: 'text', area: 'text' });

module.exports = mongoose.model('Cafe', cafeSchema);
