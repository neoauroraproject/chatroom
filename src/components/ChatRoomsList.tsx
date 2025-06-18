import React, { useState } from 'react';
import { Hash, Plus, Lock, Users, Eye, EyeOff, Globe } from 'lucide-react';
import { ChatRoom } from '../types';

interface ChatRoomsListProps {
  chatRooms: ChatRoom[];
  currentUserId: string;
  onJoinRoom: (room: ChatRoom, password: string) => void;
  onCreateRoom: (name: string, password: string, isPrivate: boolean, description: string, retentionHours: number) => void;
  accessLevel: 'admin' | 'room' | 'public';
  restrictedToRoom?: string;
}

export default function ChatRoomsList({ 
  chatRooms, 
  currentUserId, 
  onJoinRoom, 
  onCreateRoom,
  accessLevel,
  restrictedToRoom
}: ChatRoomsListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState<string | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [retentionHours, setRetentionHours] = useState(24);
  const [joinPassword, setJoinPassword] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && roomPassword.trim()) {
      onCreateRoom(
        roomName.trim(), 
        roomPassword.trim(), 
        isPrivate, 
        roomDescription.trim(),
        retentionHours
      );
      setRoomName('');
      setRoomPassword('');
      setRoomDescription('');
      setIsPrivate(false);
      setRetentionHours(24);
      setShowCreateForm(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent, room: ChatRoom) => {
    e.preventDefault();
    onJoinRoom(room, joinPassword);
    setJoinPassword('');
    setShowJoinForm(null);
  };

  // Filter rooms based on access level
  const getVisibleRooms = () => {
    if (accessLevel === 'admin') {
      return chatRooms; // Admin sees all rooms
    } else if (accessLevel === 'room' && restrictedToRoom) {
      return chatRooms.filter(room => room.id === restrictedToRoom);
    } else {
      return chatRooms.filter(room => !room.isPrivate); // Public users see only public rooms
    }
  };

  const visibleRooms = getVisibleRooms();
  const userRooms = visibleRooms.filter(room => room.members.includes(currentUserId));
  const availableRooms = visibleRooms.filter(room => !room.members.includes(currentUserId));

  // Don't show create button if user is restricted to a specific room
  const canCreateRooms = accessLevel !== 'room' || !restrictedToRoom;

  return (
    <div className="bg-gray-50 border-r border-gray-200 p-4 w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800 flex items-center space-x-2">
          <Hash className="w-4 h-4" />
          <span>Chat Rooms 🏠</span>
        </h3>
        {canCreateRooms && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-1 hover:bg-gray-200 rounded transition-colors duration-200"
            title="Create Room"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {showCreateForm && canCreateRooms && (
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <form onSubmit={handleCreateRoom} className="space-y-3">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name 🏷️"
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={20}
              required
            />
            
            <input
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Room password 🔐"
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            
            <textarea
              value={roomDescription}
              onChange={(e) => setRoomDescription(e.target.value)}
              placeholder="Description (optional) 📝"
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={2}
              maxLength={100}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isPrivate" className="text-sm text-gray-700 flex items-center space-x-1">
                {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{isPrivate ? 'Private 🔒' : 'Public 🌍'}</span>
              </label>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Message retention (hours) ⏰:</label>
              <input
                type="number"
                value={retentionHours}
                onChange={(e) => setRetentionHours(Number(e.target.value))}
                min="1"
                max="8760"
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-1">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white text-xs py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Create 🚀
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 text-xs py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel ❌
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {userRooms.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Your Rooms 🏠</h4>
            {userRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onJoinRoom(room, room.password)}
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
              >
                <Hash className="w-4 h-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate flex items-center space-x-1">
                    <span>{room.name}</span>
                    {room.isPrivate ? <Lock className="w-3 h-3 text-gray-400" /> : <Globe className="w-3 h-3 text-green-500" />}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{room.members.length}</span>
                    {room.description && <span>• {room.description}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {availableRooms.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 mt-4">Available Rooms 🌟</h4>
            {availableRooms.map((room) => (
              <div key={room.id} className="space-y-2">
                <button
                  onClick={() => setShowJoinForm(showJoinForm === room.id ? null : room.id)}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
                >
                  <Hash className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate flex items-center space-x-1">
                      <span>{room.name}</span>
                      {room.isPrivate ? <Lock className="w-3 h-3 text-red-400" /> : <Globe className="w-3 h-3 text-green-500" />}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{room.members.length}</span>
                      {room.description && <span>• {room.description}</span>}
                    </div>
                  </div>
                  <Lock className="w-3 h-3 text-gray-400" />
                </button>
                
                {showJoinForm === room.id && (
                  <div className="ml-4 p-2 bg-white rounded border">
                    <form onSubmit={(e) => handleJoinRoom(e, room)} className="space-y-2">
                      <input
                        type="password"
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder="Enter password 🔐"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <div className="flex space-x-1">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-500 text-white text-xs py-1 rounded hover:bg-blue-600 transition-colors"
                        >
                          Join 🚪
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowJoinForm(null)}
                          className="flex-1 bg-gray-300 text-gray-700 text-xs py-1 rounded hover:bg-gray-400 transition-colors"
                        >
                          Cancel ❌
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {visibleRooms.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            {accessLevel === 'room' ? 'No access to other rooms 🚫' : 'No chat rooms yet 📭'}
          </div>
        )}
      </div>
    </div>
  );
}