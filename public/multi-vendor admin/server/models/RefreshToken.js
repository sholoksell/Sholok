const mongoose = require("mongoose");

/**
 * Refresh tokens — stored hashed for revocation support.
 * One user can have multiple active sessions (web, mobile, admin).
 */
const RefreshTokenSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    userAgent: { type: String, default: "" },
    ip:        { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true },
    revoked:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL index — auto-purge expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
