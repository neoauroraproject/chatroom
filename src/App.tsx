import React, { useEffect, useRef } from 'react';
import LoginForm from './components/LoginForm';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import UsersList from './components/UsersList';
import ChatRoomsList from './components/ChatRoomsList';
import { useChat } from './hooks/useChat';

function App() {
  const { 
    isAuthenticated, 
    currentUser, 
    users, 
    chatRooms,
    activeChatName,
    activeChatType,
    accessLevel,
    restrictedToRoom,
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
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const filteredMessages = getFilteredMessages();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  if (!isAuthenticated || !currentUser) {
    return <LoginForm onLogin={login} />;
  }

  const handleBackToGeneral = () => {
    if (accessLevel === 'room' && restrictedToRoom) {
      // If user is restricted to a room, go back to that room
      const room = chatRooms.find(r => r.id === restrictedToRoom);
      if (room) {
        switchToChat(room.id, 'room', room.name);
      }
    } else {
      switchToChat('general', 'general', 'General Chat');
    }
  };

  // Separate pinned and regular messages
  const pinnedMessages = filteredMessages.filter(msg => msg.isPinned);
  const regularMessages = filteredMessages.filter(msg => !msg.isPinned);

  // Get reply-to message for display
  const getReplyToMessage = (replyToId: string) => {
    return filteredMessages.find(msg => msg.id === replyToId);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <ChatHeader 
        currentUser={currentUser} 
        onlineUsers={users} 
        onLogout={logout}
        activeChatName={activeChatName}
        activeChatType={activeChatType}
        onUpdateRetention={updateMessageRetention}
        onUpdateAdminPassword={updateAdminPassword}
        accessLevel={accessLevel}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Only show chat rooms list if user has access */}
        {accessLevel !== 'room' || restrictedToRoom ? (
          <ChatRoomsList
            chatRooms={chatRooms}
            currentUserId={currentUser.id}
            onJoinRoom={joinChatRoom}
            onCreateRoom={createChatRoom}
            accessLevel={accessLevel}
            restrictedToRoom={restrictedToRoom}
          />
        ) : null}
        
        <div className="flex-1 flex flex-col bg-white">
          {((activeChatType !== 'general' && accessLevel !== 'room') || 
            (accessLevel === 'room' && activeChatType === 'dm')) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3">
              <button
                onClick={handleBackToGeneral}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center space-x-2 hover:bg-blue-100 px-3 py-1 rounded-lg"
              >
                <span>←</span>
                <span>Back to {accessLevel === 'room' && restrictedToRoom ? 'Room' : 'General Chat'}</span>
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Pinned Messages Section */}
            {pinnedMessages.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-px bg-gradient-to-r from-yellow-300 to-amber-400 flex-1"></div>
                  <span className="text-sm font-semibold text-yellow-700 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                    📌 Pinned Messages
                  </span>
                  <div className="h-px bg-gradient-to-r from-amber-400 to-yellow-300 flex-1"></div>
                </div>
                <div className="space-y-3">
                  {pinnedMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.userId === currentUser.id}
                      isAdmin={currentUser.isAdmin || false}
                      onDeleteMessage={deleteMessage}
                      onPinMessage={pinMessage}
                      onUnpinMessage={unpinMessage}
                      onReactToMessage={reactToMessage}
                      onReplyToMessage={replyToMessageHandler}
                      onEditMessage={editMessage}
                      replyToMessage={message.replyTo ? getReplyToMessage(message.replyTo) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Messages */}
            {regularMessages.length === 0 && pinnedMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-md mx-auto border border-blue-100">
                  <div className="text-6xl mb-4">
                    {activeChatType === 'dm' ? '💬' : 
                     activeChatType === 'room' ? '🏠' : '🎉'}
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {activeChatType === 'dm' ? `Start chatting with ${activeChatName}!` : 
                     activeChatType === 'room' ? `Welcome to ${activeChatName}!` : 
                     'Welcome to SecureChat!'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activeChatType === 'dm' ? 'Send a direct message to get started ✨' :
                     activeChatType === 'room' ? 'This is your private room space 🌟' :
                     'Start the conversation by sending a message ✨'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {regularMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwn={message.userId === currentUser.id}
                    isAdmin={currentUser.isAdmin || false}
                    onDeleteMessage={deleteMessage}
                    onPinMessage={pinMessage}
                    onUnpinMessage={unpinMessage}
                    onReactToMessage={reactToMessage}
                    onReplyToMessage={replyToMessageHandler}
                    onEditMessage={editMessage}
                    replyToMessage={message.replyTo ? getReplyToMessage(message.replyTo) : undefined}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <ChatInput 
            onSendMessage={sendMessage}
            replyToMessage={replyToMessage ? {
              id: replyToMessage.id,
              username: replyToMessage.username,
              content: replyToMessage.content
            } : undefined}
            onCancelReply={cancelReply}
          />
        </div>
        
        {/* Only show users list if not restricted to room-only access */}
        {accessLevel !== 'room' && (
          <UsersList 
            users={users} 
            currentUserId={currentUser.id}
            onStartDM={startDM}
            accessLevel={accessLevel}
          />
        )}
      </div>
    </div>
  );
}

export default App;