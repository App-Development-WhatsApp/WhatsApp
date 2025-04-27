import * as SQLite from 'expo-sqlite';

let dbInstance: any = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabaseAsync('chat.db');
  await dbInstance.execAsync(`
    PRAGMA journal_mode = WAL;
  
    -- Users table...
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT UNIQUE,
      name TEXT,
      image TEXT,
      phone TEXT
    );
  
    -- Groups table...
    CREATE TABLE IF NOT EXISTS groups (
      group_jid TEXT PRIMARY KEY,
      group_name TEXT,
      group_image TEXT
    );
  
    -- Group members...
    CREATE TABLE IF NOT EXISTS group_members (
      group_jid TEXT,
      user_jid TEXT,
      PRIMARY KEY (group_jid, user_jid),
      FOREIGN KEY (group_jid) REFERENCES groups (group_jid),
      FOREIGN KEY (user_jid) REFERENCES users (jid)
    );
  
    -- Messages...
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_jid TEXT,
      receiver_jid TEXT,
      receiver_type TEXT,
      message TEXT,
      file_urls TEXT,
      file_types TEXT,
      status TEXT,
      timestamp TEXT,
      oneTime BOOLEAN,
      is_read INTEGER DEFAULT 0,
      FOREIGN KEY (sender_jid) REFERENCES users (jid),
      FOREIGN KEY (receiver_jid) REFERENCES users (jid)
    );
  
    -- Chat list...
    CREATE TABLE IF NOT EXISTS chat_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jid TEXT UNIQUE,
      type TEXT,
      last_message TEXT,
      last_message_time TEXT,
      unread_count INTEGER DEFAULT 0,
      FOREIGN KEY (jid) REFERENCES users (jid),
      FOREIGN KEY (jid) REFERENCES groups (group_jid)
    );
  
    -- Calls table...
    CREATE TABLE IF NOT EXISTS calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      caller_jid TEXT,
      receiver_jid TEXT,
      call_type TEXT,    
      call_status TEXT,
      start_time TEXT,
      end_time TEXT,
      duration INTEGER,
      FOREIGN KEY (caller_jid) REFERENCES users (jid),
      FOREIGN KEY (receiver_jid) REFERENCES users (jid)
    );
    
    -- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  image TEXT,
  description TEXT,
  last_time TEXT
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
  community_id INTEGER,
  member_jid TEXT,
  PRIMARY KEY (community_id, member_jid),
  FOREIGN KEY (community_id) REFERENCES communities (id),
  FOREIGN KEY (member_jid) REFERENCES users (jid)
);
-- List table
CREATE TABLE IF NOT EXISTS lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  last_time TEXT
);

-- List members table
CREATE TABLE IF NOT EXISTS list_members (
  list_id INTEGER,
  member_jid TEXT,
  PRIMARY KEY (list_id, member_jid),
  FOREIGN KEY (list_id) REFERENCES lists (id),
  FOREIGN KEY (member_jid) REFERENCES users (jid)
);
  `);


  return dbInstance;
};
