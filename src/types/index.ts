export interface User {
  id: string;
  username: string;
  color: string;
  joinedAt: number;
  isAdmin?: boolean;
  lastSeen?: number;
  status?: 'online' | 'away' | 'busy';
  avatar?: string; // For future avatar support
}

export interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  color: string;
  chatId: string; // 'general' for main chat, userId for DMs, or chatroom ID
  isDeleted?: boolean;
  isPinned?: boolean;
  expiresAt?: number; // For message expiration
  reactions?: Record<string, string[]>; // emoji -> userIds who reacted
  replyTo?: string; // messageId being replied to
  isEdited?: boolean;
  editedAt?: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  password: string;
  createdBy: string;
  createdAt: number;
  members: string[];
  isPrivate: boolean;
  description?: string;
  messageRetentionHours: number; // How long messages are kept
  theme?: string; // Room theme color
  lastActivity?: number;
}

export interface ChatState {
  isAuthenticated: boolean;
  currentUser: User | null;
  messages: Message[];
  users: User[];
  chatRooms: ChatRoom[];
  activeChatId: string; // 'general', userId for DM, or chatroom ID
  activeChatType: 'general' | 'dm' | 'room';
  activeChatName: string;
  accessLevel: 'admin' | 'room' | 'public'; // What the user can access
  restrictedToRoom?: string; // If user is restricted to specific room
  typingUsers: Record<string, string[]>; // chatId -> usernames typing
}