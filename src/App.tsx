import { useState } from 'react';
import { useStreamStore } from './stores/useStreamStore';
import { LandingPage } from './components/landing/LandingPage';
import { Header } from './components/layout/Header';
import { MainCanvas } from './components/layout/MainCanvas';
import { RightPanel } from './components/layout/RightPanel';
import { Chat } from './components/chat/Chat';
import { ControlPanel } from './components/controls/ControlPanel';
import { SettingsModal } from './components/modals/SettingsModal';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isStreamFullscreen, currentPage, showChat } = useStreamStore();

  // Landing page
  if (currentPage === 'landing') {
    return <LandingPage />;
  }

  // Studio (fullscreen mode)
  if (isStreamFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <MainCanvas />
      </div>
    );
  }

  // Studio (normal mode)
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header - логотип и название события */}
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left - Спикеры */}
        <RightPanel />
        
        {/* Center - Блок с трансляцией */}
        <div className="flex-1 flex flex-col min-w-0">
          <MainCanvas />
        </div>
        
        {/* Right - Чат */}
        {showChat && (
          <div className="w-[320px] bg-background-dark border-l border-border flex flex-col h-full">
            <Chat />
          </div>
        )}
      </div>
      
      {/* Bottom - Панель управления */}
      <ControlPanel />
      
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

export default App;
