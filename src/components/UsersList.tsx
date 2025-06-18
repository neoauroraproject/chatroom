import React from 'react';
import { MessageCircle, Crown } from 'lucide-react';
import { User } from '../types';

interface UsersListProps {
  users: User[];
  currentUserId: string;
  onStartDM: (user: User) => void;
  accessLevel: 'admin' | 'room' | 'public';
}

export default function UsersList({ users, currentUserId, onStartDM, accessLevel }: UsersListProps) {
  const otherUsers = users.filter(user => user.id !== currentUserId);

  return (
    <div className="bg-gray-50 border-l border-gray-200 p-4 w-64">
      <h3 className="font-medium text-gray-800 mb-4 flex items-center space-x-2">
        <MessageCircle className="w-4 h-4" />
        <span>Online Users 👥</span>
      </h3>
      
      {accessLevel === 'room' && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">🔒 Room access only</p>
        </div>
      )}
      
      <div className="space-y-2">
        {otherUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => onStartDM(user)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
            disabled={accessLevel === 'room'}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: user.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-700 truncate">{user.username}</span>
                {user.isAdmin && <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
              </div>
            </div>
            {accessLevel !== 'room' && <MessageCircle className="w-4 h-4 text-gray-400" />}
          </button>
        ))}
        {otherUsers.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No other users online 😔
          </div>
        )}
      </div>
    </div>
  );
}