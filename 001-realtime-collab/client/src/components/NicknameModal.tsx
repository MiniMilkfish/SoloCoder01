import React, { useState, useEffect } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => Promise<{ success: boolean; error?: string }>;
  isConnected: boolean;
}

export function NicknameModal({ onSubmit, isConnected }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }
    
    if (nickname.trim().length < 2) {
      setError('昵称至少需要2个字符');
      return;
    }
    
    if (nickname.trim().length > 20) {
      setError('昵称最多20个字符');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await onSubmit(nickname.trim());
      if (!result.success) {
        setError(result.error || '设置失败，请重试');
      }
    } catch (err) {
      setError('设置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      setError('正在连接服务器...');
    } else {
      setError('');
    }
  }, [isConnected]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎来到实时协作聊天室</h1>
          <p className="text-gray-500">请设置您的昵称开始聊天</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              您的昵称
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              placeholder="请输入昵称 (2-20个字符)"
              disabled={!isConnected || isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isConnected || isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                进入聊天室
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {isConnected ? '已连接到服务器' : '正在连接...'}
          </div>
        </div>
      </div>
    </div>
  );
}
