import { app } from "./app";
import { connectDB } from "./db/config";
import { Message } from "./model/user.model";
import { env } from "./utils/Env";
import http from "http";
import { Server, Socket } from "socket.io";
import { InsertCommunityMessageParams, InsertMessageParams } from "./Types/type";

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
    console.log("🔌 Socket connected:", socket.id);

    // 🔥 Register user once they connect
    socket.on('register', (userId: string) => {
        if (!userId) {
            console.error('❌ No userId provided during registration.');
            return;
        }

        // Avoid duplicate registration
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, socket.id);
            onlineSockets.set(socket.id, userId);
            socket.userId = userId; // Also attach to socket
            console.log(`✅ User ${userId} registered with socket ${socket.id}`);
        } else {
            console.log(`⚠️ User ${userId} already registered. Skipping duplicate.`);
        }
    });

    socket.on('sendMessage', async (messageData: InsertMessageParams) => {
        const { sender_jid, receiver_jid } = messageData;
        // console.log(messageData);
        try {
            const senderSocketId = onlineUsers.get(sender_jid);
            const receiverSocketId = onlineUsers.get(receiver_jid);

            console.log(messageData, "real time chatting", senderSocketId, receiverSocketId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", messageData);
            } else {
                console.log("Receiver is offline, message saved as pending.");
            }
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    socket.on('sendCommunityMessages', async (messageData: InsertCommunityMessageParams) => {
        const { sender_jid, receiver_jids } = messageData;
        console.log(messageData);
        try {
            // const savedMessage = await newMessage.save();
            const senderSocketId = onlineUsers.get(sender_jid);
            for(let receiverId in receiver_jids){
                const receiverSocketId = onlineUsers.get(receiverId);
                console.log(messageData, "real time chatting", senderSocketId, receiverSocketId);
                if (receiverSocketId) {
                    console.log("Receiver is online, sending message:", messageData, " ----", receiverSocketId);
                    io.to(receiverSocketId).emit("receiveMessage", messageData);
                } else {
                    console.log("Receiver is offline, message saved as pending.");
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
        }
    });

    socket.on("callIncoming", (props:{callerId: string, callerName: string, callerImage: string, receiverId: string}) => {
        const receiverSocketId = onlineUsers.get(props.receiverId);
        const callerId=props.callerId
        const callerName=props.callerName
        const callerImage=props.callerImage
        const receiverId=props.receiverId
        console.log(props.callerId,props.receiverId,"Receiver socket ID:", receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("incomingCall", { callerId, callerName, callerImage, receiverId });
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
        }else{
            console.log("Receiver is offline, call cancellation not sent.");
        }
    });

    socket.on("CallEnded", (cuttedBy: string, cuttedTo: string,time:string) => {
        const receiverSocketId = onlineUsers.get(cuttedTo);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("CallEnded",time);
            console.log(`Call cut from caller ${cuttedBy}`);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);

        const userId = onlineSockets.get(socket.id);

        if (userId) {
            const savedSocketId = onlineUsers.get(userId);
            if (savedSocketId === socket.id) {
                onlineUsers.delete(userId);
                console.log(`🗑️ Removed user ${userId} from onlineUsers`);
            }
            onlineSockets.delete(socket.id);
            console.log(`🗑️ Removed socket ${socket.id} from onlineSockets`);
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

