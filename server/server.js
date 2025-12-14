import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));

// Routes
app.use("/api/messages", messageRouter);
app.use("/api/auth", userRouter);
app.use("/api/status", (req, res) => res.send("Server is Live"));

// Socket.io
export const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" }
});

export const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
  console.log("User Connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Start server
(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
})();

export default server;
