"use strict";
// import { app } from "./app";
// import { connectDB } from "./db/config";
// import { env } from "./utils/Env";
// import http from "http";
// import { Server } from "socket.io";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // Create HTTP server and integrate it with Socket.IO
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: env.CORS_ORIGIN || "http://localhost:3000", // Replace with your frontend URL
//     methods: ["GET", "POST"],
//   },
// });
// // Connect to the database
// // connectDB()
// //   .then(() => {
// //     console.log("MongoDB Connected Successfully!");
// //     // Listen for socket connections
// //   })
// //   .catch((error: Error) => {
// //     console.error("MongoDB Connection Failed!!!", error);
// //   });
// io.on("connection", (socket) => {
//   console.log("A user connected");
//   // Send a welcome message to the client
//   socket.emit("welcome", "Welcome to the Socket.IO server");
//   // Handle a custom 'message' event
//   socket.on("message", (data: string) => {
//     console.log("Message from client:", data);
//     // Example of broadcasting the message to all clients
//     io.emit("broadcast", `Broadcast message: ${data}`);
//   });
//   // Handle client disconnect
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
// // Start the server after the DB connection is successful
// server.listen(env.PORT || 8000, () => {
//   console.log(`Server is running on http://localhost:${env.PORT || 8000}`);
// });
const http_1 = __importDefault(require("http"));
const PORT = 3000;
const server = http_1.default.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, TypeScript with Node.js!');
});
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
