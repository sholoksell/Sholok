import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    displayName: { type: String, trim: true, maxlength: 50 },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["viewer", "creator", "admin"], default: "viewer" },
    watchHistory: [{ video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" }, watchedAt: { type: Date, default: Date.now } }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
