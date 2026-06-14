const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + "_refresh";
const ACCESS_EXPIRE  = process.env.JWT_EXPIRE || "15m";
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "30d";

const REFRESH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** Sign a short-lived access token */
function signAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRE });
}

/** Sign a long-lived refresh token (random + jwt-signed) */
function signRefreshToken(user) {
  const jti = crypto.randomBytes(24).toString("hex");
  const token = jwt.sign({ id: user._id, jti }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });
  return { token, jti };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Issue both tokens and persist refresh in DB */
async function issueTokens(user, req) {
  const accessToken  = signAccessToken(user);
  const { token: refreshToken } = signRefreshToken(user);
  await RefreshToken.create({
    user:      user._id,
    tokenHash: hashToken(refreshToken),
    userAgent: req?.headers?.["user-agent"] || "",
    ip:        req?.ip || req?.headers?.["x-forwarded-for"] || "",
    expiresAt: new Date(Date.now() + REFRESH_MS),
  });
  return { accessToken, refreshToken };
}

/** Verify a refresh token; returns decoded payload + DB doc, or throws */
async function verifyRefresh(refreshToken) {
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  const doc = await RefreshToken.findOne({
    tokenHash: hashToken(refreshToken),
    user: decoded.id,
    revoked: false,
  });
  if (!doc) throw new Error("Refresh token not recognized");
  if (doc.expiresAt < new Date()) throw new Error("Refresh token expired");
  return { decoded, doc };
}

/** Revoke a single refresh token */
async function revokeRefresh(refreshToken) {
  await RefreshToken.updateOne(
    { tokenHash: hashToken(refreshToken) },
    { $set: { revoked: true } }
  );
}

/** Revoke ALL refresh tokens for a user (logout-all) */
async function revokeAllForUser(userId) {
  await RefreshToken.updateMany({ user: userId, revoked: false }, { $set: { revoked: true } });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  issueTokens,
  verifyRefresh,
  revokeRefresh,
  revokeAllForUser,
  hashToken,
  REFRESH_MS,
};
