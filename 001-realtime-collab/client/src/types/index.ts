export interface User {
  id: string;
  nickname: string;
  joinedAt: number;
}

export interface Message {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  timestamp: number;
}

export interface SystemMessage {
  type: 'join' | 'leave';
  nickname: string;
  timestamp: number;
}
