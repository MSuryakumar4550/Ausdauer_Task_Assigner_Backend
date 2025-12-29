require('dotenv').config(); // 1. Initialized at Line 1 so 'db' can see the variables
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const db = require("./config/db"); 
const { verifyToken, isChair } = require("./middleware/authMiddleware");

const app = express();
const server = http.createServer(app);

// 2. ROBUST CORS CONFIGURATION
const allowedOrigins = [
  "https://ausdauer-task-assigner-frontend.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// 3. SOCKET.IO CONFIGURATION
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 4. ROUTE MAPPING
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// 5. WEBSOCKET LOGIC
io.on("connection", (socket) => {
  console.log(`⚡ Real-time link established: ${socket.id}`);
  socket.on("task_action", () => {
    io.emit("refresh_data"); 
  });
  socket.on("announcement_posted", () => {
    io.emit("new_announcement");
  });
  socket.on("disconnect", () => console.log("❌ User disconnected"));
});

// 6. ANNOUNCEMENT ROUTES
// GET: Everyone can see announcements
app.get("/api/announcements", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT *, DATE_FORMAT(created_at, '%M %d, %Y') as date FROM announcements ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// POST: Only Chairs can create announcements
app.post("/api/announcements", verifyToken, isChair, async (req, res) => {
  const { title, content, type } = req.body;
  try {
    await db.query("INSERT INTO announcements (title, content, type) VALUES (?, ?, ?)", [title, content, type]);
    io.emit("new_announcement"); 
    res.json({ message: "Announcement posted successfully!" });
  } catch (err) {
    console.error("Post Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// 7. SERVER START
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`✅ Ausdauer System Live on port ${PORT}`);
});