const { Server } = require("socket.io");
const Worker = require("../models/Worker");

let io;

module.exports = (server) => {
  io = new Server(server, {
    cors: {
      origin:      process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌  Socket connected: ${socket.id}`);

    // ── Customer joins their personal room ─────────────────
    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`👤  User ${userId} joined room`);
    });

    // ── Worker comes online ────────────────────────────────
    socket.on("worker-online", async (workerId) => {
      socket.join(`worker-${workerId}`);
      await Worker.findByIdAndUpdate(workerId, {
        isOnline: true,
        socketId: socket.id,
      });
      io.to("admin-room").emit("worker-status-change", { workerId, isOnline: true });
      console.log(`🧹  Worker ${workerId} is online`);
    });

    // ── Worker sends location update (every ~5 seconds) ───
    socket.on("update-location", async ({ workerId, lat, lng, bookingId }) => {
      // Persist latest location to DB
      await Worker.findByIdAndUpdate(workerId, {
        location: { type: "Point", coordinates: [lng, lat] },
      });

      // Broadcast to the customer on this booking
      if (bookingId) {
        socket.to(`booking-${bookingId}`).emit("worker-location", { lat, lng, workerId });
      }
    });

    // ── Customer joins a booking tracking room ─────────────
    socket.on("track-booking", (bookingId) => {
      socket.join(`booking-${bookingId}`);
      console.log(`📍  Tracking booking ${bookingId}`);
    });

    // ── Admin joins admin room ─────────────────────────────
    socket.on("join-admin", () => {
      socket.join("admin-room");
    });

    // ── Worker updates job status ──────────────────────────
    socket.on("job-status-update", ({ bookingId, customerId, status }) => {
      io.to(`user-${customerId}`).emit("booking-status", {
        bookingId,
        status,
        updatedAt: new Date(),
      });
      io.to("admin-room").emit("booking-status-change", { bookingId, status });
    });

    // ── Disconnect ─────────────────────────────────────────
    socket.on("disconnect", async () => {
      // Mark worker offline
      const worker = await Worker.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false, socketId: null },
        { new: true }
      );
      if (worker) {
        io.to("admin-room").emit("worker-status-change", {
          workerId: worker._id,
          isOnline: false,
        });
      }
      console.log(`❌  Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Export getter so controllers can use it
const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports.getIO = getIO;
