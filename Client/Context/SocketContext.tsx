import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BACK_URL } from '@/Services/Api';
import CallBanner from '@/components/CallingBanner';
import { useRouter } from 'expo-router';
interface IMessage {
  sender_jid: string;
  receiver_jid: string;
  type: string;
  message: string | null;
  fileUrls: string[] | null;
  fileTypes: string[] | null;
  timestamp: string;
  isCurrentUserSender: boolean;
  oneTime?: boolean;
}

interface ISocketContext {
  socket: Socket | null;
  globalMessages: IMessage[];
  sendMessage: (message: IMessage) => void;
  registerReceiveMessage: (callback: (message: IMessage) => void) => void;
  unregisterReceiveMessage: (callback: (message: IMessage) => void) => void;
  onPendingMessages: (callback: (message: IMessage) => void) => void;
  sendIncomingCall: (callerId: string, callerName: string, callerImage: string, receiverId: string) => void;
  RegisterAcceptCall: (callback: (CallerId: string) => void) => void;
  UnregisterAcceptCall: (callback: (CallerId: string) => void) => void;
  RegisterRejectCall: (callback: (CallerId: string) => void) => void;
  UnregisterRejectCall: (callback: (CallerId: string) => void) => void;
  RegisterCancelCall: (callback: (CallerId: string) => void) => void;
  UnregisterCancelCall: (callback: (CallerId: string) => void) => void;
  sendCancelCall: (callerId: string, receiverId: string) => void; 
  sendCutCall: (callerId: string, receiverId: string) => void;
  RegistercutCall: (callback: () => void) => void;
  UnregistercutCall: (callback: () => void) => void;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  globalMessages: [],
  sendMessage: () => { },
  registerReceiveMessage: () => { },
  unregisterReceiveMessage: () => { },
  onPendingMessages: () => { },
  sendIncomingCall: () => { }, 
  RegisterAcceptCall: () => { },
  UnregisterAcceptCall: () => { },
  RegisterRejectCall: () => { },
  UnregisterRejectCall: () => { },
  RegisterCancelCall: () => { },
  UnregisterCancelCall: () => { },
  sendCancelCall: () => { }, 
  sendCutCall: () => { },
  RegistercutCall: () => { },
  UnregistercutCall: () => { },

});

export const useSocket = (): ISocketContext => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [globalMessages, setGlobalMessages] = useState<IMessage[]>([]);
  const [incomingCall, setIncomingCall] = useState<null | {
    callerId: string;
    callerName: string;
    callerImage: string;
  }>(null);

  const handleAccept = () => {
    if (socketRef.current) {
      socketRef.current.emit('callAccepted', incomingCall?.callerId);
      console.log('Call accepted');
      const User = {
        id: incomingCall?.callerId,
        name: incomingCall?.callerName,
        image: incomingCall?.callerImage
      }
      setIncomingCall(null);
      router.push({
        pathname: "/Call/acceptCall",
        params: {
          User:JSON.stringify(User), 
        },
      });
    }
  };

  const handleReject = () => {
    if (socketRef.current) {
      socketRef.current.emit('callRejected', incomingCall?.callerId);
      console.log('Call rejected');
      setIncomingCall(null);
    }
  };

  const sendIncomingCall = (callerId: string, callerName: string, callerImage: string, receiverId: string) => {
    if (socketRef.current) {
      const callData = {
        callerId,
        callerName,
        callerImage,
        receiverId,  // The ID of the person you're calling
      };
      socketRef.current.emit('callIncoming', callData);  // Emit the incoming call event
    }
  };
  const sendCancelCall = (callerId: string, receiverId: string) => {
    if (socketRef.current) {
      const callData = {
        callerId,
        receiverId,  // The ID of the person you're calling
      };
      socketRef.current.emit('cancelCall', callData);  // Emit the incoming call event
    }
  };
  const sendCutCall = (callerId: string, receiverId: string) => {
    if (socketRef.current) {
      const callData = {
        callerId,
        receiverId,  // The ID of the person you're calling
      };
      socketRef.current.emit('cutCall', callData);  // Emit the incoming call event
    }
  };

  const sendMessage = (message: IMessage) => {
    socketRef.current?.emit('sendMessage', message);
  };

  const registerReceiveMessage = (callback: (message: IMessage) => void) => {
    socketRef.current?.on('receiveMessage', callback);
  };

  const unregisterReceiveMessage = (callback: (message: IMessage) => void) => {
    socketRef.current?.off('receiveMessage', callback);
  };

  const onPendingMessages = (callback: (message: IMessage) => void) => {
    socketRef.current?.on('receivePendingMessage', callback);
  };
  const RegisterAcceptCall = (callback: (callerId: string) => void) => {
    socketRef.current?.on('callAccepted', callback);
  };
  const UnregisterAcceptCall = (callback: (callerId: string) => void) => {
    socketRef.current?.off('callAccepted', callback);
  };
  const RegisterRejectCall = (callback: (callerId: string) => void) => {
    socketRef.current?.on('callAccepted', callback);
  };
  const UnregisterRejectCall = (callback: (callerId: string) => void) => {
    socketRef.current?.off('callAccepted', callback);
  };
  const RegisterCancelCall = (callback: (callerId: string, receiverId: string) => void) => {
    socketRef.current?.on('cancelCall', callback);
  };
  const UnregisterCancelCall = (callback: (callerId: string, receiverId: string) => void) => {
    socketRef.current?.off('cancelCall', callback);
  };
  const RegistercutCall = (callback: () => void) => {
    socketRef.current?.on('cancelCall', callback);
  };
  const UnregistercutCall = (callback: () => void) => {
    socketRef.current?.off('cancelCall', callback);
  };

  useEffect(() => {
    socketRef.current = io(BACK_URL, {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('incomingCall', (data: { callerId: string; callerName: string; callerImage: string }) => {
      setIncomingCall(data);
    });
    socket.on('cancelCall', (data: { callerId: string }) => {
      setIncomingCall(null);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socket.off('callAccepted');
      socket.off('callRejected');
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        globalMessages,
        sendMessage,
        registerReceiveMessage,
        unregisterReceiveMessage,
        onPendingMessages,
        sendIncomingCall,  // Providing the new function
        RegisterAcceptCall,
        UnregisterAcceptCall,
        RegisterRejectCall,
        UnregisterRejectCall,
        RegisterCancelCall,
        UnregisterCancelCall,
        sendCancelCall,
        sendCutCall,
        RegistercutCall,
        UnregistercutCall,
      }}
    >
      {children}

      {incomingCall && (
        <CallBanner
          callerId={incomingCall.callerId}
          callerName={incomingCall.callerName}
          callerImage={incomingCall.callerImage}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </SocketContext.Provider>
  );
};
