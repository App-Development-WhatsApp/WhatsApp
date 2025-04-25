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