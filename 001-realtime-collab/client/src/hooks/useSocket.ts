import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User, Message } from '../types';

const SERVER_URL = 'http://localhost:3001';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  currentUser: User | null;
  users: User[];
  messages: Message[];
  setNickname: (nickname: string) => Promise<{ success: boolean; error?: string }>;
  sendMessage: (content: string) => Promise<{ success: boolean; error?: string }>;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('onlineUsers', (onlineUsers: User[]) => {
      setUsers(onlineUsers);
    });

    newSocket.on('history', (historyMessages: Message[]) => {
      setMessages(historyMessages);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('userJoined', ({ id, nickname, timestamp }: { id: string; nickname: string; timestamp: number }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${timestamp}`,
          userId: 'system',
          nickname: '系统',
          content: `${nickname} 加入了聊天室`,
          timestamp,
        },
      ]);
    });

    newSocket.on('userLeft', ({ id, nickname, timestamp }: { id: string; nickname: string; timestamp: number }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${timestamp}`,
          userId: 'system',
          nickname: '系统',
          content: `${nickname} 离开了聊天室`,
          timestamp,
        },
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const setNickname = useCallback(
    async (nickname: string): Promise<{ success: boolean; error?: string }> => {
      if (!socket) {
        return { success: false, error: '未连接到服务器' };
      }

      return new Promise((resolve) => {
        socket.emit('setNickname', nickname, (response: { success: boolean; error?: string }) => {
          if (response.success) {
            setCurrentUser({
              id: socket.id,
              nickname,
              joinedAt: Date.now(),
            });
          }
          resolve(response);
        });
      });
    },
    [socket]
  );

  const sendMessage = useCallback(
    async (content: string): Promise<{ success: boolean; error?: string }> => {
      if (!socket) {
        return { success: false, error: '未连接到服务器' };
      }

      if (!content.trim()) {
        return { success: false, error: '消息不能为空' };
      }

      return new Promise((resolve) => {
        socket.emit('sendMessage', content.trim(), (response: { success: boolean; error?: string }) => {
          resolve(response);
        });
      });
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    currentUser,
    users,
    messages,
    setNickname,
    sendMessage,
  };
}
