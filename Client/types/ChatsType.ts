export type ChatItem = {
    jid: string;
    type: 'user' | 'group';
    last_message: string;
    last_message_time: string;
    unread_count: number;
    name: string | null;
    image: string | null;
  };
  
export interface UserItem {
    id: number;
    jid: string;
    name: string | null;
    image: string | null;
    phone: string | null;
  }  

  export interface FileItem {
    id: string; // unique identifier (e.g., jid, fileId)
    remoteUri: string;
    localFileName?: string;
  }
  
  export  type MediaAsset = {
    uri: string;
    type?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    fileName?: string;
    duration?: number;
  };

  export interface MediaItem {
    id: string;
    uri: string;
    type: 'image' | 'video';
    duration?: number;
    start?: number;
    end?: number;
    caption?: string;
  }
  
  export interface UploadStatusParams {
    media: MediaItem;
    timestamp: string;
  }

  export type CommunityItem={
    id:number;
    name:string;
    image:string;
    description: string;
    last_time:string
  }

  export type UserWithCallDetails = {
    id:number,
    name: string;
    image: string;
    phone: string;
    jid: string;
    last_call_type: string | null; // null if no call type is found
    last_call_status: string | null; // null if no call status is found
  };

  export type MessageItem = {
    id: number;
    sender_jid: string;
    receiver_jid: string;
    receiver_type: string;
    message: string;
    file_urls: string | null;
    file_types: string | null;
    status: string;
    timestamp: string;
    oneTime: boolean;
    Other_name: string;
    Other_image: string;
  };
  
  export type InsertCommunityMessageParams = {
    sender_jid: string;
    receiver_jids: string[];
    type?: string;
    message?: string | null;
    fileUrls?: string[] | null;
    fileTypes?: string[] | null;
    oneTime?: boolean;
    isCurrentUserSender?: boolean;
    status?: string;
    timestamp: string;
    Sender_image?: string;
    Sender_name?: string;
  };