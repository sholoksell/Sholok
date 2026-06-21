import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Fix Like collection: drop ALL unique indexes that cause duplicate key errors
  try {
    const mongoose = (await import("mongoose")).default;
    const likesCollection = mongoose.connection.collection("likes");
    await likesCollection.dropIndexes();
    await likesCollection.updateMany({ video: null }, { $unset: { video: "" } });
    await likesCollection.updateMany({ comment: null }, { $unset: { comment: "" } });
    await likesCollection.createIndex({ user: 1, video: 1 });
    await likesCollection.createIndex({ user: 1, comment: 1 });
    console.log("✅ Like indexes fixed");
  } catch (e) {
    console.log("Like index fix skipped:", e.message);
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Sholok Watching Server running on http://localhost:${PORT}`);
});
