const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

// Load Environment Variables
dotenv.config();

// Initialize App
const app = express();
const server = http.createServer(app);

// 1. ROBUST CORS & SOCKET CONFIGURATION
const allowedOrigins = [
  "http://localhost:3000", 
  "https://ausdauer-task-assigner-frontend.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// 2. IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

// 3. ROUTE MAPPING
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// 4. WEBSOCKET LOGIC
io.on("connection", (socket) => {
  console.log(`⚡ Real-time link established: ${socket.id}`);
  socket.on("task_action", () => {
    io.emit("refresh_data"); 
  });
  socket.on("disconnect", () => console.log("❌ User disconnected"));
});

// 5. SERVER START
const PORT = process.env.PORT || 10000; // Render uses 10000
server.listen(PORT, () => {
  console.log(`✅ Ausdauer System Live on port ${PORT}`);
});