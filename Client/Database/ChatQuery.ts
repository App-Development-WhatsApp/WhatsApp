import { ChatItem, UserItem,CommunityItem, UserWithCallDetails, MessageItem } from "@/types/ChatsType";
import { getDB } from "./ChatDatabase";

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
  timestamp?: string;
  Sender_image?: string;
  Sender_name?: string;
};

export const insertMessage = async ({
  sender_jid,
  receiver_jid,
  type = 'user',
  message = null,
  fileUrls = [],
  fileTypes = [],
  oneTime = false,
  timestamp = new Date().toISOString(),
  isCurrentUserSender,
  status = 'sending'
}: InsertMessageParams) => {
  const db = await getDB();

  console.log('Inserting message...');

  try {
    const fileUrlsString = fileUrls && fileUrls.length > 0 ? JSON.stringify(fileUrls) : "";
    const fileTypesString = fileTypes && fileTypes.length > 0 ? JSON.stringify(fileTypes) : "";

    const messageStmt = await db.prepareAsync(`
      INSERT INTO messages 
      (sender_jid, receiver_jid, receiver_type, message, file_urls, file_types, timestamp, oneTime, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let messageId: number | undefined;

    try {
      const result = await messageStmt.executeAsync([
        sender_jid,
        receiver_jid,
        type,
        message,
        fileUrlsString,
        fileTypesString,
        timestamp,
        oneTime ? 1 : 0,
        status
      ]);
        messageId = result.insertId || result.lastInsertRowId;
    } finally {
      await messageStmt.finalizeAsync();
    }

    // If messageId is undefined, throw an error
    if (!messageId) {
      throw new Error('Message ID is undefined after insertion.');
    }

    // Insert/Update into chat_list
    const chat_jid = isCurrentUserSender ? receiver_jid : sender_jid;
    const preview = message || '📎 Media';
    const unreadIncrement = isCurrentUserSender ? 0 : 1;

    const chatListStmt = await db.prepareAsync(`
      INSERT INTO chat_list (jid, last_message, last_message_time, unread_count, type)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(jid) DO UPDATE SET
        last_message = excluded.last_message,
        last_message_time = excluded.last_message_time,
        unread_count = unread_count + ?,
        type = excluded.type
    `);

    try {
      await chatListStmt.executeAsync([
        chat_jid,
        preview,
        timestamp,
        unreadIncrement,
        type,
        unreadIncrement
      ]);
      console.log('✅ Chat list updated successfully for jid:', chat_jid);
    } finally {
      await chatListStmt.finalizeAsync();
    }

    // Return the messageId
    return messageId;

  } catch (error) {
    console.error('❌ Error inserting message:', error);
    throw error;
  }
};


export const updateMessageStatus = async (messageId: any, newStatus: string) => {
  try {
    const db = await getDB();
    console.log('🔄 Updating message status...',messageId);

    const preparedUpdate = await db.prepareAsync(
      `UPDATE messages 
       SET status = ? 
       WHERE id = ?`
    );

    await preparedUpdate.executeAsync([newStatus, messageId]);
    await preparedUpdate.finalizeAsync();
    console.log(`✅ Message status updated to ${newStatus}`);

    // Now fetch the updated message
    const preparedSelect = await db.prepareAsync(
      `SELECT * FROM messages WHERE id = ?`
    );

    const result = await preparedSelect.executeAsync([messageId]);
    await preparedSelect.finalizeAsync();

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
      const updatedMessage = result.rows._array[0];
      console.log('✅ Updated message fetched:', updatedMessage);
      return updatedMessage; // ✅ returning updated message
    } else {
      console.warn('⚠️ No message found with id:', messageId);
      return null;
    }

  } catch (error) {
    console.error('❌ Failed to update or fetch message:', error);
    return null;
  }
};




export const getChats = async (): Promise<ChatItem[]> => {
  const db: any = await getDB();
  try {
    const statement = await db.prepareAsync(`
      SELECT 
        chat_list.jid, 
        chat_list.type, 
        chat_list.last_message, 
        chat_list.last_message_time, 
        chat_list.unread_count,
        CASE 
            WHEN chat_list.type = 'user' THEN users.name
            WHEN chat_list.type = 'group' THEN groups.group_name
        END AS name,
        CASE 
            WHEN chat_list.type = 'user' THEN users.image
            WHEN chat_list.type = 'group' THEN groups.group_image
        END AS image
      FROM 
        chat_list
      LEFT JOIN 
        users ON chat_list.jid = users.jid AND chat_list.type = 'user'
      LEFT JOIN 
        groups ON chat_list.jid = groups.group_jid AND chat_list.type = 'group'
      ORDER BY 
        chat_list.last_message_time DESC;
    `);

    try {
      const result = await statement.executeAsync();
      const allChats: ChatItem[] = await result.getAllAsync();
      return allChats;
    } finally {
      await statement.finalizeAsync(); // Always clean up
    }
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

export const getAllUsers = async (): Promise<UserItem[]> => {
  try {
    const db: any = await getDB(); // No need to await if getDB is not async

    const statement = await db.prepareAsync(`SELECT * FROM users;`);
    try {
      const result = await statement.executeAsync();
      const users: UserItem[] = await result.getAllAsync();
      return users;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserInfoByJid = async (jid: string): Promise<UserItem | null> => {
  try {
    const db = await getDB();

    const statement = await db.prepareAsync(`
      SELECT * FROM users WHERE jid = $jid;
    `);

    try {
      const result = await statement.executeAsync({ $jid: jid });

      const user: UserItem = await result.getFirstAsync();

      return user ?? null;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

export const getMessages = async (chatId: string): Promise<MessageItem[]> => {
  try {
    const db = await getDB();

    const statement = await db.prepareAsync(`
      SELECT 
        messages.id,
        messages.sender_jid,
        messages.receiver_jid,
        messages.receiver_type,
        messages.message,
        messages.file_urls,
        messages.file_types,
        messages.status,
        messages.timestamp,
        messages.oneTime,
        users.name AS Other_name,
        users.image AS Other_image
      FROM 
        messages
      LEFT JOIN 
        users ON messages.sender_jid = users.jid
      WHERE 
        (messages.receiver_jid = ? OR messages.sender_jid = ?)
      ORDER BY 
        messages.timestamp ASC
    `);

    try {
      const result = await statement.executeAsync([chatId, chatId]);
      const messages: MessageItem[] = await result.getAllAsync();
      return messages;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return [];
  }
};


export const SaveUser = async (user: UserItem) => {
  const db = await getDB();
  try {
    const statement = await db.prepareAsync(`
      INSERT INTO users (jid, name, image, phone)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(jid) DO UPDATE SET
        name = excluded.name,
        image = excluded.image,
        phone = excluded.phone
    `);

    try {
      await statement.executeAsync([user.jid, user.name, user.image, user.phone]);
      return user;
    } finally {
      await statement.finalizeAsync(); // Always clean up
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const SaveCall = async (call: {
  caller_jid: string;
  receiver_jid: string;
  call_type: string;
  call_status: string;
  start_time: string;
  end_time: string;
  duration: number;
}) => {
  const db = await getDB();
  console.log('Saving call:', call);
  try {
    const statement = await db.prepareAsync(`
      INSERT INTO calls (caller_jid, receiver_jid, call_type, call_status, start_time, end_time, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await statement.executeAsync([
        call.caller_jid,
        call.receiver_jid,
        call.call_type,
        call.call_status,
        call.start_time,
        call.end_time,
        call.duration,
      ]);
      console.log('Call saved successfully');
      return call;
    } finally {
      await statement.finalizeAsync(); // Always clean up
    }
  } catch (error) {
    console.error('Error saving call:', error);
    return null
  }
};

export const UpdateCallEndTimeById = async (id: number, end_time: string, duration?: number) => {
  const db = await getDB();
  console.log(`Updating call ID ${id} with end_time: ${end_time} and duration: ${duration}`);

  try {
    // If duration is not provided, fetch start_time and calculate it
    if (duration === undefined || duration === null) {
      const result = await db.getFirstAsync(`SELECT start_time FROM calls WHERE id = ?`, [id]);
      if (!result) {
        console.error(`No call found with ID ${id}`);
        return;
      }

      const start = new Date(result.start_time).getTime();
      const end = new Date(end_time).getTime();

      if (!isNaN(start) && !isNaN(end)) {
        duration = Math.floor((end - start) / 1000); // duration in seconds
      } else {
        console.error('Invalid start_time or end_time');
        return;
      }
    }

    // Now update the call
    const statement = await db.prepareAsync(`
      UPDATE calls
      SET end_time = ?, duration = ?
      WHERE id = ?
    `);

    try {
      await statement.executeAsync([end_time, duration, id]);
      console.log(`Call ID ${id} updated successfully`);
      return true;
    } finally {
      await statement.finalizeAsync();
    }
  } catch (error) {
    console.error(`Error updating call ID ${id}:`, error);
    return false;
  }
};

export const UpdateCallStatus = async (call_id: number, call_status: string) => {
  const db = await getDB();
  console.log(`Updating call status for call_id ${call_id} to "${call_status}"`);
  try {
    const statement = await db.prepareAsync(`
      UPDATE calls
      SET call_status = ?
      WHERE call_id = ?
    `);

    try {
      await statement.executeAsync([call_status, call_id]);
      console.log('Call status updated successfully');
      return true;
    } finally {
      await statement.finalizeAsync(); // Always clean up
    }
  } catch (error) {
    console.error('Error updating call status:', error);
    return false
  }
};

export const GetUsersInCalls = async (): Promise<UserWithCallDetails[]> => {
  const db = await getDB();
  try {
    const result: UserWithCallDetails[] = await db.getAllAsync(`
      SELECT 
        u.id,
        u.name,
        u.image,
        u.phone,
        u.jid, 
        (
          SELECT c.call_type
          FROM calls c
          WHERE c.caller_jid = u.jid OR c.receiver_jid = u.jid
          ORDER BY c.start_time DESC
          LIMIT 1
        ) AS last_call_type,
        (
          SELECT c.call_status
          FROM calls c
          WHERE c.caller_jid = u.jid OR c.receiver_jid = u.jid
          ORDER BY c.start_time DESC
          LIMIT 1
        ) AS last_call_status
      FROM users u
      WHERE u.jid IN (
        SELECT caller_jid FROM calls
        UNION
        SELECT receiver_jid FROM calls
      )
      GROUP BY u.jid
    `);

    console.log('Fetched users involved in calls with call details:', result);
    return result;
  } catch (error) {
    console.error('Error fetching users from calls:', error);
    return [];
  }
};

export const GetCallHistoryByUser = async (jid: string) => {
  const db = await getDB();
  try {
    const result = await db.getAllAsync(`
      SELECT 
        id,
        caller_jid,
        receiver_jid,
        start_time,
        end_time,
        duration,
        call_type,
        call_status
      FROM calls
      WHERE caller_jid = ? OR receiver_jid = ?
      ORDER BY start_time DESC
    `, [jid, jid]);

    console.log(`Call history for user ${jid}:`, result);
    return result;
  } catch (error) {
    console.error(`Error fetching call history for ${jid}:`, error);
    return [];
  }
};

export const createCommunity = async (
  name: string,
  image: string,
  description: string,
  last_time: string,
  memberJids: string[]
): Promise<CommunityItem | null> => {
  const db = await getDB();
  try {
    const result = await db.runAsync(
      `INSERT INTO communities (name, image, description, last_time) VALUES (?, ?, ?, ?)`,
      [name, image, description, last_time]
    );

    const communityId = result.lastInsertRowId;

    for (const jid of memberJids) {
      await db.runAsync(
        `INSERT OR IGNORE INTO community_members (community_id, member_jid) VALUES (?, ?)`,
        [communityId, jid]
      );
    }

    const community = await db.getFirstAsync(
      `SELECT id, name, image, description, last_time FROM communities WHERE id = ?`,
      communityId
    );

    return community;

  } catch (error) {
    console.error('Error creating community:', error);
    return null;
  }
};

export const getCommunityMembersDetails = async (communityId: number) => {
  const db = await getDB();
  try {
    const members = await db.getAllAsync(`
      SELECT u.image, u.name, u.phone
      FROM users u
      INNER JOIN community_members cm ON u.jid = cm.member_jid
      WHERE cm.community_id = ?
    `, [communityId]);

    return members;
  } catch (error) {
    console.error('Failed to fetch community members:', error);
    return [];
  }
};

export const getAllCommunities = async (): Promise<CommunityItem[]>=> {
  const db = await getDB();
  try {
    const communities = await db.getAllAsync(`
      SELECT id, name, image, description, last_time
      FROM communities
      ORDER BY last_time DESC
    `);

    return communities;
  } catch (error) {
    console.error('Failed to fetch communities:', error);
    return [];
  }
};

export const deleteCommunityById = async (communityId: number): Promise<boolean> => {
  const db = await getDB();
  try {
    await db.execAsync('BEGIN TRANSACTION');

    // Delete all members of the community
    await db.runAsync(
      `DELETE FROM community_members WHERE community_id = ?`,
      communityId
    );

    // Delete the community itself
    await db.runAsync(
      `DELETE FROM communities WHERE id = ?`,
      communityId
    );

    await db.execAsync('COMMIT');
    return true;
  } catch (error) {
    console.error('Failed to delete community and its references:', error);
    await db.execAsync('ROLLBACK');
    return false;
  }
};

export const getCommunityById = async (communityId: number): Promise<CommunityItem | null> => {
  const db = await getDB();
  try {
    const community = await db.getFirstAsync(
      `SELECT id, name, image, description, last_time
       FROM communities
       WHERE id = ?`,
      communityId
    );

    return community || null;
  } catch (error) {
    console.error('Failed to fetch community by ID:', error);
    return null;
  }
};