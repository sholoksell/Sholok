import { Router } from "express";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";
import { auth, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Get channel by ID or handle
router.get("/:idOrHandle", optionalAuth, async (req, res) => {
  try {
    const { idOrHandle } = req.params;
    let channel;

    if (idOrHandle.match(/^[0-9a-fA-F]{24}$/)) {
      channel = await Channel.findById(idOrHandle).populate("owner", "username displayName avatar");
    } else {
      channel = await Channel.findOne({ handle: idOrHandle }).populate("owner", "username displayName avatar");
    }

    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const videos = await Video.find({ channel: channel._id, status: "active" })
      .populate("channel", "name handle avatar")
      .sort({ createdAt: -1 });

    let isSubscribed = false;
    if (req.user) {
      isSubscribed = !!(await Subscription.findOne({ subscriber: req.user._id, channel: channel._id }));
    }

    res.json({ channel, videos, isSubscribed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe/Unsubscribe
router.post("/:id/subscribe", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (String(channel.owner) === String(req.user._id)) {
      return res.status(400).json({ error: "Cannot subscribe to own channel" });
    }

    const existing = await Subscription.findOne({ subscriber: req.user._id, channel: channel._id });

    if (existing) {
      await existing.deleteOne();
      channel.subscriberCount = Math.max(0, channel.subscriberCount - 1);
      await channel.save();
      res.json({ subscribed: false, subscriberCount: channel.subscriberCount });
    } else {
      await Subscription.create({ subscriber: req.user._id, channel: channel._id });
      channel.subscriberCount += 1;
      await channel.save();

      // Notify channel owner about new subscriber
      try {
        await Notification.create({
          recipient: channel.owner,
          type: "subscribe",
          title: `${req.user.displayName || req.user.username} subscribed to your channel`,
          channel: channel._id,
          fromUser: req.user._id,
        });
      } catch (e) { /* ignore */ }

      res.json({ subscribed: true, subscriberCount: channel.subscriberCount });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update channel
router.put("/:id", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    if (String(channel.owner) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { name, description, avatar, banner } = req.body;
    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (avatar) channel.avatar = avatar;
    if (banner) channel.banner = banner;

    await channel.save();
    res.json({ channel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's subscriptions
router.get("/user/subscriptions", auth, async (req, res) => {
  try {
    const subs = await Subscription.find({ subscriber: req.user._id }).populate({
      path: "channel",
      populate: { path: "owner", select: "username displayName avatar" },
    });
    res.json({ subscriptions: subs.map((s) => s.channel) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
