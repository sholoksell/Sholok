const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    bio: { type: String, maxlength: 500, default: '' },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogUser' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogUser' }],
    neighborRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogUser' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogPost' }],
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    interests: [{ type: String }],
    totalViews: { type: Number, default: 0 },
    lastLogin: { type: Date },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      newPost: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      reactions: { type: Boolean, default: true },
    },
  },
  { timestamps: true, collection: 'sholokblogs_users' }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('SholokBlogUser', userSchema);
