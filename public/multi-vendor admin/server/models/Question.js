const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isSeller: { type: Boolean, default: false },
    body:     { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true }
);

const QuestionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    store:   { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    body:    { type: String, required: true, maxlength: 2000 },
    answers: [AnswerSchema],
    status:  { type: String, enum: ["open", "answered", "hidden"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
