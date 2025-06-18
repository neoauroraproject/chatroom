import React, { useState } from 'react';
import { Trash2, Crown, Pin, PinOff, Heart, ThumbsUp, Smile, Reply, Edit2, Check, X } from 'lucide-react';
import { Message } from '../types';
import { formatTime } from '../utils/time';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  isAdmin: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onPinMessage?: (messageId: string) => void;
  onUnpinMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  onReplyToMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  replyToMessage?: Message;
}

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

export default function ChatMessage({ 
  message, 
  isOwn, 
  isAdmin, 
  onDeleteMessage, 
  onPinMessage, 
  onUnpinMessage,
  onReactToMessage,
  onReplyToMessage,
  onEditMessage,
  replyToMessage
}: ChatMessageProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  if (message.isDeleted) {
    return (
      <div className="flex justify-center mb-4">
        <div className="text-xs text-gray-400 italic bg-gray-100 px-3 py-1 rounded-full">
          💬 Message deleted
        </div>
      </div>
    );
  }

  // Add emoji reactions to message content
  const processMessageContent = (content: string) => {
    return content
      .replace(/:\)/g, '😊')
      .replace(/:\(/g, '😢')
      .replace(/:D/g, '😃')
      .replace(/;\)/g, '😉')
      .replace(/:P/g, '😛')
      .replace(/<3/g, '❤️')
      .replace(/:\|/g, '😐')
      .replace(/:o/g, '😮')
      .replace(/:\*/g, '😘')
      .replace(/XD/g, '😆');
  };

  const handleReaction = (emoji: string) => {
    if (onReactToMessage) {
      onReactToMessage(message.id, emoji);
    }
    setShowReactions(false);
  };

  const handleEdit = () => {
    if (onEditMessage && editContent.trim() !== message.content) {
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`flex mb-4 group ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md relative ${
        message.isPinned 
          ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 text-gray-800' 
          : isOwn 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md' 
            : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
      } px-4 py-3 rounded-2xl shadow-sm`}>
        
        {message.isPinned && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-sm">
            <Pin className="w-3 h-3 text-yellow-800" />
          </div>
        )}

        {!isOwn && (
          <div className="flex items-center mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: message.color }}
            />
            <span className={`text-xs font-medium flex items-center space-x-1 ${
              message.isPinned ? 'text-gray-600' : 'text-gray-600'
            }`}>
              <span>{message.username}</span>
              {message.username === 'admin' && <Crown className="w-3 h-3 text-yellow-500" />}
            </span>
          </div>
        )}

        {replyToMessage && (
          <div className="mb-2 p-2 bg-black/10 rounded-lg border-l-2 border-blue-400">
            <div className="text-xs text-gray-600 mb-1">↳ Replying to {replyToMessage.username}</div>
            <div className="text-xs opacity-75 truncate">{replyToMessage.content}</div>
          </div>
        )}
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              maxLength={500}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed break-words">
            {processMessageContent(message.content)}
            {message.isEdited && (
              <span className="text-xs opacity-60 ml-2">(edited)</span>
            )}
          </p>
        )}

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(message.reactions).map(([emoji, userIds]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="flex items-center space-x-1 bg-black/10 hover:bg-black/20 rounded-full px-2 py-1 text-xs transition-colors"
              >
                <span>{emoji}</span>
                <span>{userIds.length}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className={`text-xs mt-2 flex items-center justify-between ${
          message.isPinned 
            ? 'text-gray-500'
            : isOwn 
              ? 'text-blue-100' 
              : 'text-gray-500'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Quick reaction button */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className={`p-1 rounded hover:bg-black/10 ${
                  message.isPinned 
                    ? 'text-gray-400 hover:text-gray-600'
                    : isOwn 
                      ? 'text-blue-100 hover:text-white' 
                      : 'text-gray-400 hover:text-gray-600'
                }`}
                title="React"
              >
                <Smile className="w-3 h-3" />
              </button>
              
              {showReactions && (
                <div className="absolute bottom-full right-0 mb-1 bg-white border rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="hover:bg-gray-100 p-1 rounded text-sm transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reply button */}
            {onReplyToMessage && (
              <button
                onClick={() => onReplyToMessage(message.id)}
                className={`p-1 rounded hover:bg-black/10 ${
                  message.isPinned 
                    ? 'text-gray-400 hover:text-blue-500'
                    : isOwn 
                      ? 'text-blue-100 hover:text-white' 
                      : 'text-gray-400 hover:text-blue-500'
                }`}
                title="Reply"
              >
                <Reply className="w-3 h-3" />
              </button>
            )}

            {/* Edit button (only for own messages) */}
            {isOwn && onEditMessage && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`p-1 rounded hover:bg-black/10 ${
                  message.isPinned 
                    ? 'text-gray-400 hover:text-blue-500'
                    : 'text-blue-100 hover:text-white'
                }`}
                title="Edit message"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            
            {/* Pin/Unpin button (admin only) */}
            {isAdmin && onPinMessage && onUnpinMessage && (
              <button
                onClick={() => message.isPinned ? onUnpinMessage(message.id) : onPinMessage(message.id)}
                className={`p-1 rounded hover:bg-black/10 ${
                  message.isPinned 
                    ? 'text-yellow-600 hover:text-yellow-800'
                    : isOwn 
                      ? 'text-blue-100 hover:text-white' 
                      : 'text-gray-400 hover:text-yellow-500'
                }`}
                title={message.isPinned ? "Unpin message" : "Pin message"}
              >
                {message.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              </button>
            )}
            
            {/* Delete button */}
            {(isOwn || isAdmin) && onDeleteMessage && (
              <button
                onClick={() => onDeleteMessage(message.id)}
                className={`p-1 rounded hover:bg-black/10 ${
                  message.isPinned 
                    ? 'text-gray-400 hover:text-red-500'
                    : isOwn 
                      ? 'text-blue-100 hover:text-white' 
                      : 'text-gray-400 hover:text-red-500'
                }`}
                title="Delete message"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}