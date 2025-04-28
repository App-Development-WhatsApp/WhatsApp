export type InsertMessageParams = {
    sender_jid: string;
    receiver_jid: string;
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