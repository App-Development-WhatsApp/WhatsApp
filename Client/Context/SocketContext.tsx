import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { BACK_URL } from '@/Services/Api';
import CallBanner from '@/components/CallingBanner';
import { useRouter } from 'expo-router';
import { SaveCall, UpdateCallEndTimeById, UpdateCallStatus } from '@/Database/ChatQuery';
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
  RegisterCallEnded: (callback: (time:string) => void) => void;
  UnregisterCallEnded: (callback: (time:string) => void) => void;
  sendCallEnded: (cuttedBy:string, cuttedTo:string,time:any) => void
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
  RegisterCallEnded: () => { },
  UnregisterCallEnded: () => { },
  sendCallEnded: () => { }

});

export const useSocket = (): ISocketContext => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const callData=useRef<any|null>(null)
  const [globalMessages, setGlobalMessages] = useState<IMessage[]>([]);
  const [incomingCall, setIncomingCall] = useState<null | {
    callerId: string;
    callerName: string;
    callerImage: string;
  }>(null);

  const handleAccept = async() => {
    // const result = await UpdateCallStatus(callData.current.id, 'Accepted');
    if (socketRef.current 
      // && result
    ) {
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

  const handleReject = async() => {
    const result = await UpdateCallStatus(callData.current.id, 'Rejected');
    if (socketRef.current
      && result
    ) {
      socketRef.current.emit('callRejected', incomingCall?.callerId);
      console.log('Call rejected');
      setIncomingCall(null);
    }
  };

  const sendIncomingCall =async (callerId: string, callerName: string, callerImage: string, receiverId: string) => {
    // const call=await SaveCall({caller_jid:callerId,receiver_jid:receiverId,call_type:'voice',call_status:'Calling',start_time:new Date().toISOString(),end_time:new Date().toISOString(),duration:0})
    if (
      // call && 
      socketRef.current) {
        //  callData.current=call
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
    console.log(callerId,receiverId,socketRef.current)
    if (socketRef.current) {
      const callData = {
        callerId,
        receiverId,  // The ID of the person you're calling
      };
      socketRef.current.emit('cancelCall', callData);  // Emit the incoming call event
    }
  };
  const sendCallEnded =async (cuttedBy:string, cuttedTo:string,time:any) => {
    // const update=await UpdateCallEndTimeById(callData.current.id,new Date().toISOString(), time);
    if (
      // update && 
      socketRef.current) {
      socketRef.current.emit('CallEnded', cuttedBy,cuttedTo,time);  
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
  const RegisterAcceptCall = async(callback: (callerId: string) => void) => {
    // const result = await UpdateCallStatus(callData.current.id, 'Accepted');
    // if(result){
      socketRef.current?.on('callAccepted', callback);
    // }
  };
  const UnregisterAcceptCall = (callback: (callerId: string) => void) => {
    socketRef.current?.off('callAccepted', callback);
  };
  const RegisterRejectCall = (callback: (callerId: string) => void) => {
     // const result = await UpdateCallStatus(callData.current.id, 'Rejected');
    // if(result){
    socketRef.current?.on('callRejected', callback);
        // }
  };
  const UnregisterRejectCall = (callback: (callerId: string) => void) => {
    socketRef.current?.off('callRejected', callback);
  };
  const RegisterCancelCall = (callback: (callerId: string, receiverId: string) => void) => {
      socketRef.current?.on('cancelCall', callback);
  };
  const UnregisterCancelCall = (callback: (callerId: string, receiverId: string) => void) => {
    socketRef.current?.off('cancelCall', callback);
  };
  const RegisterCallEnded = async(callback: (time:string) => void) => {
    // const update=await UpdateCallEndTimeById(callData.current.id,new Date().toISOString());
    // if(update){
      socketRef.current?.on('CallEnded', callback);
    // }
  };
  const UnregisterCallEnded = (callback: (time:string) => void) => {
    socketRef.current?.off('cutCall', callback);
  };

  useEffect(() => {
    socketRef.current = io(BACK_URL, {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('incomingCall',async (data: { callerId: string; callerName: string; callerImage: string,receiverId:string }) => {
      // const call=await SaveCall({caller_jid:data.callerId,receiver_jid:data.receiverId,call_type:'voice',call_status:'MissedCall',start_time:new Date().toISOString(),end_time:new Date().toISOString(),duration:0})
      // if(call){
      // callData.current=callData;
        setIncomingCall(data);
      // }
    });
    socket.on('cancelCall', async(data: { callerId: string }) => {
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
        RegisterCallEnded,
        UnregisterCallEnded,
        sendCallEnded
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
