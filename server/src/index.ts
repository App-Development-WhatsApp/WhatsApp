import { app } from "./app";
import { connectDB } from "./db/config";
import { Message } from "./model/user.model";
import { env } from "./utils/Env";
import http from "http";
import { Server, Socket } from "socket.io";

// Message type
interface Message {
    senderId: string;
    receiverId: string;
    content: string;
    timestamp?: Date;
    [key: string]: any;
}



const onlineUsers = new Map();
const onlineSockets = new Map();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
    allowEIO3: true,
});

declare module "socket.io" {
    interface Socket {
        userId?: string;
    }
}

io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on('sendMessage', async (messageData) => {
        const { sender_jid, receiver_jid, message, fileUrls, fileTypes, oneTime } = messageData;
        console.log(messageData)
        const newMessage = new Message({
            sender_jid,
            receiver_jid,
            message,
            fileUrls,
            fileTypes,
            timestamp: new Date().toISOString(),
            isCurrentUserSender: true,
            oneTime,
        });

        try {
            const savedMessage = await newMessage.save();
            const receiverSocketId = onlineUsers.get(message.receiver_jid);
            const senderSocketId = onlineUsers.get(message.receiver_jid);
            console.log(message, "real time cahtting")

            if (receiverSocketId) {
                console.log("Receiver is online, sending message:", message, " ----", receiverSocketId, senderSocketId);
                io.to(receiverSocketId).emit("receiveMessage", messageData);
            } else {
                console.log("Receiver is offline, message saved as pending.");
            }
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    socket.on("callIncoming", (callerId: string, callerName: string, callerImage: string, receiverId: string) => {
        const receiverSocketIds = onlineUsers.get(receiverId);
        console.log("Receiver socket IDs:", receiverSocketIds);
        if (receiverSocketIds) {
            receiverSocketIds.forEach((sockId: string) => {
                io.to(sockId).emit("incomingCall", { callerId, callerName, callerImage });
            });
        } else {
            console.log("Receiver is offline, call not sent.");
        }
    });

    socket.on('callAccepted', (callerId) => {
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) {
            io.to(callerSocketId).emit('callAccepted');
            console.log(`Call accepted by receiver for caller ${callerId}`);
        }
    });

    socket.on('callRejected', (callerId) => {
        const callerSocketId = onlineUsers.get(callerId);
        if (callerSocketId) {
            io.to(callerSocketId).emit('callRejected');
            console.log(`Call rejected by receiver for caller ${callerId}`);
        }
    });
    socket.on("cancelCall", (callerId: string,receiverId:string) => {
        // id
        const callerSocketId = onlineUsers.get(receiverId);
        if (callerSocketId) {
            io.to(callerSocketId).emit("cancelCall");
            console.log(`Call cancelled for caller ${callerId}`);
        }
    });
    socket.on("cutCall", (callerId: string,receiverId:string) => {
        // id
        const callerSocketId = onlineUsers.get(receiverId);
        if (callerSocketId) {
            io.to(callerSocketId).emit("cutCall");
            console.log(`Call cut for caller ${callerId}`);
        }
    });


    socket.on("disconnect", () => {
        const userId = onlineSockets.get(socket.id);
        if (userId) {
            const socketIds = onlineUsers.get(userId);
            if (socketIds) {
                socketIds.delete(socket.id);
                if (socketIds.size === 0) {
                    onlineUsers.delete(userId);
                }
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



// socket.on("typing", async ( props:any ) => {
//   console.log("Typing event:", props);
//   const receiverSocketIds = onlineUsers.get(props.friendId);
//   console.log("Receiver socket IDs:", receiverSocketIds);
//   if (receiverSocketIds) {
//     // Receiver is online — send typing event
//     receiverSocketIds.forEach((sockId) => {
//       io.to(sockId).emit("userTyping",props.userid);
//     });
//   }
// })