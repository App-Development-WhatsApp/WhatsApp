import { app } from "./app";
import { connectDB } from "./db/config";
import { Message } from "./model/user.model";
import { env } from "./utils/Env";
import http from "http";
import { Server, Socket } from "socket.io";
import { InsertMessageParams } from "./Types/type";

// Message type
interface MessageType {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp?: Date;
    [key: string]: any;
}

// Mapping of userId -> socketId
const onlineUsers = new Map<string, string>();
// Mapping of socketId -> userId
const onlineSockets = new Map<string, string>();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
    allowEIO3: true,
});

// Extend Socket type
declare module "socket.io" {
    interface Socket {
        userId?: string;
    }
}

io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on('sendMessage', async (messageData: InsertMessageParams) => {
        const { sender_jid, receiver_jid, type, message, fileUrls, fileTypes, oneTime, Sender_image, Sender_name } = messageData;
        console.log(messageData);

        const newMessage = new Message({
            receiver_jid,
            sender_jid,
            message,
            fileUrls,
            fileTypes,
            timestamp: new Date().toISOString(),
            isCurrentUserSender: true,
            oneTime,
        });

        try {
            // const savedMessage = await newMessage.save();
            const receiverSocketId = onlineUsers.get(receiver_jid);

            console.log(messageData, "real time chatting");

            if (receiverSocketId) {
                console.log("Receiver is online, sending message:", messageData, " ----", receiverSocketId);
                io.to(receiverSocketId).emit("receiveMessage", messageData);
            } else {
                console.log("Receiver is offline, message saved as pending.");
            }
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    // socket.on("typing", async (props: { userid: string, friendId: string }) => {
    //     console.log("Typing event:", props);
    //     const receiverSocketId = onlineUsers.get(props.friendId);

    //     if (receiverSocketId) {
    //         console.log("Receiver is online, sending typing event to:", receiverSocketId);
    //         io.to(receiverSocketId).emit("userTyping", props.userid);
    //     }
    // });

    socket.on("callIncoming", (callerId: string, callerName: string, callerImage: string, receiverId: string) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        console.log("Receiver socket ID:", receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", { callerId, callerName, callerImage });
        } else {
            console.log("Receiver is offline, call not sent.");
        }
    });

    socket.on('callAccepted', (callerId: string) => {
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) {
            io.to(callerSocketId).emit('callAccepted');
            console.log(`Call accepted for caller ${callerId}`);
        }
    });

    socket.on('callRejected', (callerId: string) => {
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) {
            io.to(callerSocketId).emit('callRejected');
            console.log(`Call rejected for caller ${callerId}`);
        }
    });

    socket.on("cancelCall", (callerId: string, receiverId: string) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("cancelCall");
            console.log(`Call cancelled from caller ${callerId}`);
        }
    });

    socket.on("cutCall", (callerId: string, receiverId: string) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("cutCall");
            console.log(`Call cut from caller ${callerId}`);
        }
    });

    socket.on("disconnect", () => {
        const userId = onlineSockets.get(socket.id);
        if (userId) {
            const socketId = onlineUsers.get(userId);
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
            }
            onlineSockets.delete(socket.id);
            console.log(`User ${userId} disconnected (socket ID ${socket.id})`);
        }
    });
});

connectDB()
    .then(() => {
        console.log("MongoDB Connected Successfully!");
        const PORT = env.PORT || 5000;
        httpServer.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed!!!", error);
    });

