const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// Route imports
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes")
const messageRoutes = require("./routes/messageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const searchRoutes = require("./routes/searchRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Middleware imports
const { generalLimiter, authLimiter } = require("./middlewares/rateLimiter");
const errorHandler = require('./middlewares/errorHandler');

const { verifyAccessToken } = require("./utils/jwtUtils");
const User = require("./models/userModel");

// Express app setup
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("CORS: Not allowed by origin"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(generalLimiter);

// serve uploaded files (local fallback)
app.use("/uploads", express.static("uploads"));

// apply secure headers
app.use(helmet());

// Rate Limiter
app.use("/api/auth", authLimiter);

// health check
app.get("/api/health", (req, res) => res.json({ success: true, message: "ok" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload/profile', uploadRoutes);
app.use('/api/upload/post', uploadRoutes);
app.use('/api/upload/gallery', uploadRoutes);

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
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("❌ DB connection error:", err));
