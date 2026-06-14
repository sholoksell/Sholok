const { Server } = require("socket.io");
const jwt        = require("jsonwebtoken");

/**
 * Initialize Socket.io with JWT authentication.
 * Each user joins their own room: "user:<userId>" for targeted events.
 *
 * Events:
 *  - chat:join       (conversationId)
 *  - chat:typing     (conversationId, isTyping)
 *  - chat:message    (server→client only) — emitted from REST POST handler
 *  - notification    (server→client) — pushed when new notification created
 *  - order:update    (server→client)
 */
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:8080",
        process.env.ADMIN_URL  || "http://localhost:5174",
        "http://localhost:5173",
      ],
      credentials: true,
    },
  });

  // ── JWT auth ────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("No auth token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.role   = decoded.role;
      next();
    } catch (e) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    if (socket.role === "admin") socket.join("admins");

    socket.on("chat:join", (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("chat:typing", ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit("chat:typing", {
        userId: socket.userId, isTyping,
      });
    });

    socket.on("disconnect", () => { /* nothing yet */ });
  });

  // Helper publishers
  io.notifyUser = (userId, payload) => io.to(`user:${userId}`).emit("notification", payload);
  io.notifyOrder = (userId, payload) => io.to(`user:${userId}`).emit("order:update", payload);

  return io;
}

module.exports = { initSocket };
