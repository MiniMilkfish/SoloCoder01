import React from 'react';
import { Users, User, Dot } from 'lucide-react';
import { User as UserType } from '../types';

interface UserListProps {
  users: UserType[];
  currentUser: UserType | null;
}

export function UserList({ users, currentUser }: UserListProps) {
  const formatJoinTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
        <Users className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-800">在线用户</h2>
        <span className="ml-auto text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {users.length} 人在线
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Users className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">暂无在线用户</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  user.id === currentUser?.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
                      user.id === currentUser?.id
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        : 'bg-gradient-to-br from-green-500 to-teal-600 text-white'
                    }`}
                  >
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>
                  <Dot className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-green-500 fill-green-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.nickname}
                    </p>
                    {user.id === currentUser?.id && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        我
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatJoinTime(user.joinedAt)} 加入
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentUser && (
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {currentUser.nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {currentUser.nickname}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                已登录
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
