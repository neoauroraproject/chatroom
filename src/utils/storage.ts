import { User, Message, ChatRoom } from '../types';

const STORAGE_KEYS = {
  MESSAGES: 'chatroom_messages',
  USERS: 'chatroom_users',
  CURRENT_USER: 'chatroom_current_user',
  CHAT_ROOMS: 'chatroom_rooms',
  USER_SESSIONS: 'chatroom_user_sessions',
  ADMIN_CONFIG: 'chatroom_admin_config',
  APP_SETTINGS: 'chatroom_app_settings'
};

export interface AdminConfig {
  adminPassword: string;
  defaultMessageRetentionHours: number;
  allowUserRoomCreation: boolean;
  maxRoomsPerUser: number;
  welcomeMessage?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  compactMode: boolean;
}

export const storage = {
  getMessages: (): Message[] => {
    try {
      const messages = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const allMessages = messages ? JSON.parse(messages) : [];
      
      // Filter out expired messages
      const now = Date.now();
      const validMessages = allMessages.filter((msg: Message) => 
        !msg.expiresAt || msg.expiresAt > now || msg.isPinned
      );
      
      // Save filtered messages back if any were removed
      if (validMessages.length !== allMessages.length) {
        storage.saveMessages(validMessages);
      }
      
      return validMessages;
    } catch {
      return [];
    }
  },

  saveMessages: (messages: Message[]): void => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  getUsers: (): User[] => {
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  },

  saveUsers: (users: User[]): void => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser: (): User | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  saveCurrentUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getChatRooms: (): ChatRoom[] => {
    try {
      const rooms = localStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
      return rooms ? JSON.parse(rooms) : [];
    } catch {
      return [];
    }
  },

  saveChatRooms: (rooms: ChatRoom[]): void => {
    localStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));
  },

  getUserSessions: (): Record<string, User> => {
    try {
      const sessions = localStorage.getItem(STORAGE_KEYS.USER_SESSIONS);
      return sessions ? JSON.parse(sessions) : {};
    } catch {
      return {};
    }
  },

  saveUserSession: (username: string, user: User): void => {
    const sessions = storage.getUserSessions();
    sessions[username.toLowerCase()] = user;
    localStorage.setItem(STORAGE_KEYS.USER_SESSIONS, JSON.stringify(sessions));
  },

  getUserSession: (username: string): User | null => {
    const sessions = storage.getUserSessions();
    return sessions[username.toLowerCase()] || null;
  },

  getAdminConfig: (): AdminConfig | null => {
    try {
      const config = localStorage.getItem(STORAGE_KEYS.ADMIN_CONFIG);
      return config ? JSON.parse(config) : null;
    } catch {
      return null;
    }
  },

  saveAdminConfig: (config: AdminConfig): void => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_CONFIG, JSON.stringify(config));
  },

  getAppSettings: (): AppSettings => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return settings ? JSON.parse(settings) : {
        theme: 'light',
        soundEnabled: true,
        notificationsEnabled: true,
        compactMode: false
      };
    } catch {
      return {
        theme: 'light',
        soundEnabled: true,
        notificationsEnabled: true,
        compactMode: false
      };
    }
  },

  saveAppSettings: (settings: AppSettings): void => {
    localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  }
};