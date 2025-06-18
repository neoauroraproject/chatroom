import { useState, useEffect, useCallback } from 'react';
import { User, Message, ChatState, ChatRoom } from '../types';
import { storage } from '../utils/storage';
import { generateUserId } from '../utils/auth';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    isAuthenticated: false,
    currentUser: null,
    messages: [],
    users: [],
    chatRooms: [],
    activeChatId: 'general',
    activeChatType: 'general',
    activeChatName: 'General Chat',
    accessLevel: 'public',
    typingUsers: {}
  });

  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      const messages = storage.getMessages();
      const users = storage.getUsers();
      const chatRooms = storage.getChatRooms();
      
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser,
        messages,
        users,
        chatRooms
      }));
    }
  }, []);

  const login = useCallback((user: User, accessLevel: 'admin' | 'room' | 'public', restrictedToRoom?: string) => {
    const initialChatId = restrictedToRoom || 'general';
    const initialChatType = restrictedToRoom ? 'room' : 'general';
    const initialChatName = restrictedToRoom 
      ? storage.getChatRooms().find(r => r.id === restrictedToRoom)?.name || 'Room'
      : 'General Chat';

    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      currentUser: user,
      messages: storage.getMessages(),
      users: storage.getUsers(),
      chatRooms: storage.getChatRooms(),
      accessLevel,
      restrictedToRoom,
      activeChatId: initialChatId,
      activeChatType: initialChatType,
      activeChatName: initialChatName
    }));
  }, []);

  const logout = useCallback(() => {
    if (state.currentUser) {
      const users = storage.getUsers().filter(u => u.id !== state.currentUser!.id);
      storage.saveUsers(users);
    }
    storage.clearCurrentUser();
    setState({
      isAuthenticated: false,
      currentUser: null,
      messages: [],
      users: [],
      chatRooms: [],
      activeChatId: 'general',
      activeChatType: 'general',
      activeChatName: 'General Chat',
      accessLevel: 'public',
      typingUsers: {}
    });
  }, [state.currentUser]);

  const sendMessage = useCallback((content: string, replyToId?: string) => {
    if (!state.currentUser) return;

    // Calculate expiration time based on room settings or default
    let expiresAt: number | undefined;
    if (state.activeChatType === 'room') {
      const room = state.chatRooms.find(r => r.id === state.activeChatId);
      if (room) {
        expiresAt = Date.now() + (room.messageRetentionHours * 60 * 60 * 1000);
      }
    } else if (state.activeChatType === 'general') {
      const adminConfig = storage.getAdminConfig();
      const retentionHours = adminConfig?.defaultMessageRetentionHours || 24;
      expiresAt = Date.now() + (retentionHours * 60 * 60 * 1000);
    }

    const newMessage: Message = {
      id: generateUserId(),
      userId: state.currentUser.id,
      username: state.currentUser.username,
      content,
      timestamp: Date.now(),
      color: state.currentUser.color,
      chatId: state.activeChatId,
      expiresAt,
      replyTo: replyToId,
      reactions: {}
    };

    const updatedMessages = [...state.messages, newMessage];
    storage.saveMessages(updatedMessages);
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  }, [state.currentUser, state.messages, state.activeChatId, state.activeChatType, state.chatRooms]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    const updatedMessages = state.messages.map(msg => 
      msg.id === messageId && msg.userId === state.currentUser?.id
        ? { ...msg, content: newContent, isEdited: true, editedAt: Date.now() }
        : msg
    );
    storage.saveMessages(updatedMessages);
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  }, [state.messages, state.currentUser]);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!state.currentUser) return;

    const updatedMessages = state.messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions } || {};
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        
        const userIndex = reactions[emoji].indexOf(state.currentUser!.id);
        if (userIndex > -1) {
          // Remove reaction
          reactions[emoji].splice(userIndex, 1);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          // Add reaction
          reactions[emoji].push(state.currentUser!.id);
        }
        
        return { ...msg, reactions };
      }
      return msg;
    });
    
    storage.saveMessages(updatedMessages);
    setState(prev => ({ ...prev, messages: updatedMessages }));
  }, [state.messages, state.currentUser]);

  const deleteMessage = useCallback((messageId: string) => {
    const updatedMessages = state.messages.map(msg => 
      msg.id === messageId ? { ...msg, isDeleted: true } : msg
    );
    storage.saveMessages(updatedMessages);
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  }, [state.messages]);

  const pinMessage = useCallback((messageId: string) => {
    const updatedMessages = state.messages.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: true, expiresAt: undefined } : msg
    );
    storage.saveMessages(updatedMessages);
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  }, [state.messages]);

  const unpinMessage = useCallback((messageId: string) => {
    const updatedMessages = state.messages.map(msg => {
      if (msg.id === messageId) {
        const updatedMsg = { ...msg, isPinned: false };
        
        // Recalculate expiration time
        if (state.activeChatType === 'room') {
          const room = state.chatRooms.find(r => r.id === state.activeChatId);
          if (room) {
            updatedMsg.expiresAt = Date.now() + (room.messageRetentionHours * 60 * 60 * 1000);
          }
        } else if (state.activeChatType === 'general') {
          const adminConfig = storage.getAdminConfig();
          const retentionHours = adminConfig?.defaultMessageRetentionHours || 24;
          updatedMsg.expiresAt = Date.now() + (retentionHours * 60 * 60 * 1000);
        }
        
        return updatedMsg;
      }
      return msg;
    });
    storage.saveMessages(updatedMessages);
    
    setState(prev => ({
      ...prev,
      messages: updatedMessages
    }));
  }, [state.messages, state.activeChatType, state.activeChatId, state.chatRooms]);

  const updateMessageRetention = useCallback((hours: number) => {
    if (!state.currentUser?.isAdmin) return;

    const adminConfig = storage.getAdminConfig();
    if (adminConfig) {
      const updatedConfig = { ...adminConfig, defaultMessageRetentionHours: hours };
      storage.saveAdminConfig(updatedConfig);
    }

    // Update existing general chat messages
    const updatedMessages = state.messages.map(msg => {
      if (msg.chatId === 'general' && !msg.isPinned) {
        return { ...msg, expiresAt: Date.now() + (hours * 60 * 60 * 1000) };
      }
      return msg;
    });
    
    storage.saveMessages(updatedMessages);
    setState(prev => ({ ...prev, messages: updatedMessages }));
  }, [state.currentUser, state.messages]);

  const updateAdminPassword = useCallback((newPassword: string) => {
    if (!state.currentUser?.isAdmin) return;

    const adminConfig = storage.getAdminConfig();
    if (adminConfig) {
      const updatedConfig = { ...adminConfig, adminPassword: newPassword };
      storage.saveAdminConfig(updatedConfig);
    }
  }, [state.currentUser]);

  const switchToChat = useCallback((chatId: string, chatType: 'general' | 'dm' | 'room', chatName: string) => {
    setState(prev => ({
      ...prev,
      activeChatId: chatId,
      activeChatType: chatType,
      activeChatName: chatName
    }));
  }, []);

  const startDM = useCallback((user: User) => {
    if (state.accessLevel === 'room') return; // Prevent DMs in room-only access
    switchToChat(user.id, 'dm', user.username);
  }, [switchToChat, state.accessLevel]);

  const createChatRoom = useCallback((name: string, password: string, isPrivate: boolean, description: string, retentionHours: number) => {
    if (!state.currentUser) return;

    const newRoom: ChatRoom = {
      id: generateUserId(),
      name,
      password,
      createdBy: state.currentUser.id,
      createdAt: Date.now(),
      members: [state.currentUser.id],
      isPrivate,
      description,
      messageRetentionHours: retentionHours,
      lastActivity: Date.now()
    };

    const updatedRooms = [...state.chatRooms, newRoom];
    storage.saveChatRooms(updatedRooms);
    
    setState(prev => ({
      ...prev,
      chatRooms: updatedRooms
    }));

    switchToChat(newRoom.id, 'room', newRoom.name);
  }, [state.currentUser, state.chatRooms, switchToChat]);

  const joinChatRoom = useCallback((room: ChatRoom, password: string) => {
    if (!state.currentUser) return;

    if (room.password !== password) {
      alert('Incorrect password ❌');
      return;
    }

    if (!room.members.includes(state.currentUser.id)) {
      const updatedRoom = {
        ...room,
        members: [...room.members, state.currentUser.id],
        lastActivity: Date.now()
      };

      const updatedRooms = state.chatRooms.map(r => 
        r.id === room.id ? updatedRoom : r
      );

      storage.saveChatRooms(updatedRooms);
      
      setState(prev => ({
        ...prev,
        chatRooms: updatedRooms
      }));
    }

    switchToChat(room.id, 'room', room.name);
  }, [state.currentUser, state.chatRooms, switchToChat]);

  const getFilteredMessages = useCallback(() => {
    return state.messages.filter(msg => msg.chatId === state.activeChatId);
  }, [state.messages, state.activeChatId]);

  const replyToMessageHandler = useCallback((messageId: string) => {
    const message = state.messages.find(m => m.id === messageId);
    if (message) {
      setReplyToMessage(message);
    }
  }, [state.messages]);

  const cancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  return {
    ...state,
    replyToMessage,
    login,
    logout,
    sendMessage,
    editMessage,
    reactToMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    updateMessageRetention,
    updateAdminPassword,
    switchToChat,
    startDM,
    createChatRoom,
    joinChatRoom,
    getFilteredMessages,
    replyToMessage: replyToMessageHandler,
    cancelReply
  };
};