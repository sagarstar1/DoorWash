const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('_id name role');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} [${socket.user.role}]`);

    // Every user gets a personal room for push notifications
    socket.join(`user_${socket.user._id}`);

    // Customer tracks a specific booking
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
    });

    // Worker broadcasts live GPS location
    socket.on('worker_location', ({ lat, lng, bookingId }) => {
      if (socket.user.role !== 'worker') return;
      io.to(`booking_${bookingId}`).emit('worker_location_update', {
        lat, lng,
        workerId: socket.user._id,
        workerName: socket.user.name,
        bookingId,
        timestamp: new Date(),
      });
    });

    // Worker updates status via socket (instant — no HTTP needed)
    socket.on('update_booking_status', ({ bookingId, status }) => {
      if (!['worker', 'admin'].includes(socket.user.role)) return;
      io.to(`booking_${bookingId}`).emit('booking_status_update', {
        bookingId, status, updatedBy: socket.user.name, timestamp: new Date(),
      });
      io.to('admin_room').emit('booking_status_changed', { bookingId, status });
    });

    // Admins get a live dashboard room
    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = socketHandler;
