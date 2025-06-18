import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, X, Reply } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, replyToId?: string) => void;
  replyToMessage?: { id: string; username: string; content: string };
  onCancelReply?: () => void;
}

const EMOJI_SHORTCUTS = [
  { shortcut: ':)', emoji: '😊', label: 'smile' },
  { shortcut: ':(', emoji: '😢', label: 'sad' },
  { shortcut: ':D', emoji: '😃', label: 'happy' },
  { shortcut: ';)', emoji: '😉', label: 'wink' },
  { shortcut: ':P', emoji: '😛', label: 'tongue' },
  { shortcut: '<3', emoji: '❤️', label: 'heart' },
  { shortcut: ':|', emoji: '😐', label: 'neutral' },
  { shortcut: ':o', emoji: '😮', label: 'surprised' },
  { shortcut: ':*', emoji: '😘', label: 'kiss' },
  { shortcut: 'XD', emoji: '😆', label: 'laugh' }
];

const QUICK_EMOJIS = ['😊', '😢', '😃', '😉', '😛', '❤️', '👍', '👎', '🔥', '💯', '🎉', '🚀', '✨', '💫', '⭐', '🌟'];

export default function ChatInput({ onSendMessage, replyToMessage, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [replyToMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), replyToMessage?.id);
      setMessage('');
      setShowEmojiPanel(false);
      if (onCancelReply) {
        onCancelReply();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape' && replyToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  const insertEmoji = (emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {replyToMessage && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Reply className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-blue-700">
                Replying to {replyToMessage.username}
              </div>
              <div className="text-sm text-blue-600 truncate max-w-md">
                {replyToMessage.content}
              </div>
            </div>
          </div>
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {showEmojiPanel && (
        <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <Smile className="w-4 h-4" />
              <span>Quick Emojis ✨</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {QUICK_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl hover:bg-white hover:shadow-sm p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>⌨️</span>
              <span>Text Shortcuts</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {EMOJI_SHORTCUTS.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-600 bg-white rounded-lg p-2">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{item.shortcut}</span>
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setShowEmojiPanel(!showEmojiPanel)}
          className={`p-3 rounded-full transition-all duration-200 ${
            showEmojiPanel 
              ? 'bg-blue-100 text-blue-600 shadow-sm' 
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
          title="Emojis & Reactions"
        >
          <Smile className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={replyToMessage ? "Reply to message... 💬" : "Type a message... 💬"}
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
            maxLength={500}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {message.length}/500
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-full transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}