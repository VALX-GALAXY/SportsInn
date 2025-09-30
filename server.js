const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/feed", feedRoutes);

// basic health check
app.get("/", (req, res) => res.json({ success: true, data: null, message: "API running" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
