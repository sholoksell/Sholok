const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message      = require("../models/Message");
const Store        = require("../models/Store");
const Product      = require("../models/Product");

// GET /api/v1/chat/conversations — my conversations (buyer or seller side)
router.get("/conversations", protect, async (req, res) => {
  const convos = await Conversation.find({ $or: [{ buyer: req.user.id }, { seller: req.user.id }] })
    .populate("buyer",  "name avatar")
    .populate("seller", "name avatar")
    .populate("store",  "name logo smartStore")
    .populate("product","name images price")
    .sort({ updatedAt: -1 });
  res.json({ success: true, conversations: convos });
});

// POST /api/v1/chat/conversations  { storeId, productId? } — start or fetch existing convo
router.post("/conversations", protect, async (req, res) => {
  const { storeId, productId } = req.body;
  const store = await Store.findById(storeId);
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });

  let convo = await Conversation.findOne({
    buyer:  req.user.id,
    seller: store.owner,
    store:  store._id,
  });
  if (!convo) {
    convo = await Conversation.create({
      buyer:   req.user.id,
      seller:  store.owner,
      store:   store._id,
      product: productId || undefined,
    });
  }
  res.json({ success: true, conversation: convo });
});

// GET /api/v1/chat/conversations/:id/messages
router.get("/conversations/:id/messages", protect, async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) return res.status(404).json({ success: false, message: "Not found" });
  if (![String(convo.buyer), String(convo.seller)].includes(String(req.user.id)))
    return res.status(403).json({ success: false, message: "Forbidden" });

  const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 }).limit(200);

  // Mark unread for the requesting party
  const isBuyer = String(convo.buyer) === String(req.user.id);
  if (isBuyer && convo.unreadBuyer)  { convo.unreadBuyer  = 0; await convo.save(); }
  if (!isBuyer && convo.unreadSeller){ convo.unreadSeller = 0; await convo.save(); }
  await Message.updateMany({ conversation: convo._id, sender: { $ne: req.user.id }, isRead: false }, { isRead: true });

  res.json({ success: true, messages, conversation: convo });
});

// POST /api/v1/chat/conversations/:id/messages  { text, image? }
router.post("/conversations/:id/messages", protect, async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) return res.status(404).json({ success: false, message: "Not found" });
  if (![String(convo.buyer), String(convo.seller)].includes(String(req.user.id)))
    return res.status(403).json({ success: false, message: "Forbidden" });

  const { text, image } = req.body;
  if (!text && !image) return res.status(400).json({ success: false, message: "Empty message" });

  const msg = await Message.create({
    conversation: convo._id,
    sender:       req.user.id,
    text:         text || "",
    image:        image || "",
  });

  convo.lastMessage = text || "📷 Image";
  convo.lastSender  = req.user.id;
  if (String(convo.buyer)  === String(req.user.id)) convo.unreadSeller += 1;
  else                                              convo.unreadBuyer  += 1;
  await convo.save();

  // Real-time emit
  const io = req.app.get("io");
  if (io) {
    io.to(`user:${convo.buyer}`).emit("chat:message", { conversationId: convo._id, message: msg });
    io.to(`user:${convo.seller}`).emit("chat:message", { conversationId: convo._id, message: msg });
  }

  res.status(201).json({ success: true, message: msg });
});

module.exports = router;
