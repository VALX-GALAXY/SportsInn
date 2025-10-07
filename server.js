const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes")
const messageRoutes = require("./routes/messageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const searchRoutes = require("./routes/searchRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Middleware imports
const { generalLimiter, authLimiter } = require("./middlewares/rateLimiter");
const errorHandler = require('./middlewares/errorHandler');

const { verifyAccessToken } = require("./utils/jwtUtils");
const User = require("./models/userModel");

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());
app.use(generalLimiter);

// serve uploaded files (local fallback)
app.use("/uploads", express.static("uploads"));

// Rate Limiter
app.use("/api/auth", authLimiter);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reports', reportRoutes);


// Error Handler
app.use(errorHandler);

// HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

// middleware to authenticate socket and join user room
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Auth token missing"));
    const decoded = verifyAccessToken(token);
    if (!decoded) return next(new Error("Invalid token"));
    const user = await User.findById(decoded.id).select("_id name");
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

io.on("connection", (socket) => {
  // join a room unique to the user id
  const room = socket.user._id.toString();
  
  console.log(`Socket connected: ${socket.user.name} (${room})`);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", room);
  });
});

// make io available to controllers/services via app.get('io')
app.set("io", io);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
  })
  .catch(err => console.error("❌ DB connection error:", err));
