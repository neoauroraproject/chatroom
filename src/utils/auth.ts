// Master password for the chatroom
const MASTER_PASSWORD = 'SecureChat2024';

export const validateMasterPassword = (password: string): boolean => {
  return password === MASTER_PASSWORD;
};

export const generateUserId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateUserColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#AED6F1', '#D7BDE2', '#F9E79F'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const checkRoomAccess = (password: string, rooms: any[]): string | null => {
  const room = rooms.find(r => r.password === password);
  return room ? room.id : null;
};

export const isAdminUser = (username: string): boolean => {
  return username.toLowerCase() === 'admin';
};

export const validateAdminPassword = (password: string, adminConfig: any): boolean => {
  if (!adminConfig) return false;
  return adminConfig.adminPassword === password;
};