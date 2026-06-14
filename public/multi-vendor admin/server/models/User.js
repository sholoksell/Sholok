const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Name is required"], trim: true, maxlength: 100 },
    email:    { type: String, required: [true, "Email is required"], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, "Please use a valid email"] },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role:     { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
    phone:    { type: String, default: "" },
    avatar:   { type: String, default: "https://ui-avatars.com/api/?background=6c47ff&color=fff&name=User" },
    address: {
      street: String, city: String, state: String,
      zip: String, country: { type: String, default: "Bangladesh" },
    },
    isActive:   { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    wishlist:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
    emailVerifyToken:     String,
    emailVerifyExpire:    Date,
    lastLogin:            Date,
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Sign JWT
UserSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model("User", UserSchema);
