"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const messages_routes_1 = __importDefault(require("./routes/messages.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const app = (0, express_1.default)();
exports.app = app;
// CORS middleware to handle cross-origin requests
app.use((0, cors_1.default)({
    // Specify which frontend URLs are allowed to connect to the backend
    origin: process.env.CORS_ORIGIN || "*", // Use "*" as a fallback for CORS_ORIGIN
    credentials: true,
}));
// Middleware to parse incoming JSON data with a size limit
app.use(express_1.default.json({ limit: "16kb" }));
// Middleware to parse URL-encoded data with a size limit
app.use(express_1.default.urlencoded({ extended: true, limit: "16kb" }));
// Serve static files (e.g., PDFs) from the "public" folder
app.use(express_1.default.static("public"));
// Middleware to parse cookies from incoming requests
app.use((0, cookie_parser_1.default)());
// Optional: Add error handling middleware (for better type safety)
app.use((req, res, next) => {
    next();
});
// router ab seperate kar di hai isliye app.get ki jagah app.use ka istamal karna padega
app.use("/api/v1/users", user_routes_1.default);
app.use("/api/v1/chats", chat_routes_1.default);
app.use("/api/v1/messages", messages_routes_1.default);
app.use("/api/v1/notifications", notifications_routes_1.default);
