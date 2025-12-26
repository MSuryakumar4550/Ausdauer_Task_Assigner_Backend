const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes"); // MISSING IN YOUR VERSION

dotenv.config();
const app = express();
const server = http.createServer(app);

// 1. ROBUST CORS & SOCKET CONFIGURATION
// Adding 'transports' to fix those red socket.io (failed) errors in your screenshot
const io = new Server(server, {
  cors: { 
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ["websocket", "polling"] 
});

// 2. MIDDLEWARE
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// 3. WEBSOCKET LOGIC
io.on("connection", (socket) => {
  console.log(`⚡ Real-time link established: ${socket.id}`);
  
  socket.on("task_action", () => {
    console.log("Task/User change detected. Refreshing all dashboards...");
    io.emit("refresh_data"); 
  });

  socket.on("disconnect", () => console.log("❌ User disconnected"));
});

// 4. ROUTE MAPPING
app.use("/api/auth", authRoutes);   // For Login
app.use("/api/tasks", taskRoutes); // For Tasks
app.use("/api/users", userRoutes); // REQUIRED for registration & profile updates

// 5. SERVER START
const PORT = process.env.PORT || 8080;
// Update CORS to allow your live Frontend URL later
app.use(cors({
  origin: ["http://localhost:3000", "https://your-frontend-link.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
server.listen(PORT, () => {
  console.log(`✅ Ausdauer System Live on port ${PORT}`);
  console.log(`🚀 Registration Endpoint: http://localhost:${PORT}/api/users/register`);
});