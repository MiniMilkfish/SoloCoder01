import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
}

export function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  const isSystemMessage = message.userId === 'system';

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
          isCurrentUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
            : 'bg-gradient-to-br from-green-500 to-teal-600 text-white'
        }`}
      >
        {message.nickname.charAt(0).toUpperCase()}
      </div>
      
      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm font-medium text-gray-700">{message.nickname}</span>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
        </div>
        
        <div
          className={`px-4 py-2 rounded-2xl ${
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
