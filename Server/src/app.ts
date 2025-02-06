import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from './routes/user.routes'
import chatRouter from './routes/chat.routes'
import messageRouter from './routes/messages.routes'
import notificationRouter from './routes/notifications.routes'
const app = express();

// CORS middleware to handle cross-origin requests
app.use(
  cors({
    // Specify which frontend URLs are allowed to connect to the backend
    origin: process.env.CORS_ORIGIN || "*", // Use "*" as a fallback for CORS_ORIGIN
    credentials: true,
  })
);

// Middleware to parse incoming JSON data with a size limit
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded data with a size limit
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files (e.g., PDFs) from the "public" folder
app.use(express.static("public"));

// Middleware to parse cookies from incoming requests
app.use(cookieParser());

// Optional: Add error handling middleware (for better type safety)
app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// router ab seperate kar di hai isliye app.get ki jagah app.use ka istamal karna padega
// app.use("/api/v1/users", userRouter)
// app.use("/api/v1/chats", chatRouter)
// app.use("/api/v1/messages", messageRouter)
// app.use("/api/v1/notifications", notificationRouter)
// https://localhost:8000/api/v1/users/register
// https://localhost:8000/api/v1/users/login
// . ....
export { app };