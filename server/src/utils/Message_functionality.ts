async function getPendingMessages(userId:any) {
    // Replace with MongoDB query like:
    // return await Message.find({ receiverId: userId, delivered: false });
    return [
      {
        senderId: "123",
        receiverId: userId,
        content: "Hey! This was pending.",
        timestamp: Date.now(),
      }
    ];
  }
  
  async function markMessagesAsDelivered(userId:any) {
    // Example: await Message.updateMany({ receiverId: userId, delivered: false }, { delivered: true });
  }
  