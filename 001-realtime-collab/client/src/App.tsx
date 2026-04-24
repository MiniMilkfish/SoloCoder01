import React, { useState } from 'react';
import { MessageCircle, Palette, Users } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { NicknameModal } from './components/NicknameModal';
import { ChatPanel } from './components/ChatPanel';
import { UserList } from './components/UserList';
import { CollaborativeCanvas } from './components/CollaborativeCanvas';

type ViewMode = 'chat' | 'canvas';

function App() {
  const {
    isConnected,
    currentUser,
    users,
    messages,
    setNickname,
    sendMessage,
  } = useSocket();

  const [activeView, setActiveView] = useState<ViewMode>('chat');

  if (!currentUser) {
    return (
      <NicknameModal
        onSubmit={setNickname}
        isConnected={isConnected}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">实时协作聊天室</h1>
              <p className="text-xs text-white/70">
                已登录: {currentUser.nickname}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveView('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'chat'
                  ? 'bg-white text-purple-600'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              聊天室
            </button>
            <button
              onClick={() => setActiveView('canvas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === 'canvas'
                  ? 'bg-white text-purple-600'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Palette className="w-4 h-4" />
              协同画板
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            <span className="text-sm">
              {isConnected ? '在线' : '连接中...'}
            </span>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {currentUser.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <UserList users={users} currentUser={currentUser} />
        </div>

        <div className="flex-1 overflow-hidden">
          {activeView === 'chat' ? (
            <ChatPanel
              messages={messages}
              currentUser={currentUser}
              onSendMessage={sendMessage}
            />
          ) : (
            <CollaborativeCanvas />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
