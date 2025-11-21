import { useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { useStreamStore } from './stores/useStreamStore';
import { LandingPage } from './components/landing/LandingPage';
import { Header } from './components/layout/Header';
import { MainCanvas } from './components/layout/MainCanvas';
import { RightPanel } from './components/layout/RightPanel';
import { ScenesPanel } from './components/layout/ScenesPanel';
import { Chat } from './components/chat/Chat';
import { ControlPanel } from './components/controls/ControlPanel';
import { SettingsModal } from './components/modals/SettingsModal';
import { ViewerPage } from './components/viewer/ViewerPage';

// Компонент для страницы просмотра с параметром streamId
const ViewerPageWrapper = () => {
  const { streamId } = useParams<{ streamId: string }>();
  if (!streamId) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-text-muted">Неверная ссылка на трансляцию</div>
      </div>
    );
  }
  return <ViewerPage streamId={streamId} />;
};

function StudioApp() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isStreamFullscreen, currentPage, showChat, showScenesPanel } = useStreamStore();

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
        {/* Left - Панель сцен */}
        {showScenesPanel && <ScenesPanel />}
        
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/watch/:streamId" element={<ViewerPageWrapper />} />
        <Route path="*" element={<StudioApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
