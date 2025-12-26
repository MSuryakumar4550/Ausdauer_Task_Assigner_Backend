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

// 1. ROBUST CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:3000", 
  "https://ausdauer-task-assigner-frontend.vercel.app"
];

// Apply CORS middleware first
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
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

// Manual handler for Preflight OPTIONS requests
app.options('*', cors()); 

app.use(express.json());

// 2. SOCKET.IO CONFIGURATION
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 3. IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

// 4. ROUTE MAPPING
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// 5. WEBSOCKET LOGIC
io.on("connection", (socket) => {
  console.log(`⚡ Real-time link established: ${socket.id}`);
  socket.on("task_action", () => {
    io.emit("refresh_data"); 
  });
  socket.on("disconnect", () => console.log("❌ User disconnected"));
});

// 6. SERVER START
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`✅ Ausdauer System Live on port ${PORT}`);
});