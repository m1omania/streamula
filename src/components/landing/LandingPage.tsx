import { useState } from 'react';
import { TopBar } from './TopBar';
import { TemplatesGallery } from './TemplatesGallery';
import { RecordingsLibrary } from './RecordingsLibrary';

export const LandingPage = () => {
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  return (
    <div className="min-h-screen">
      <TopBar onSearchChange={setGlobalSearchQuery} />
      
      {/* First Section - Templates Gallery on Gray Background */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <TemplatesGallery searchQuery={globalSearchQuery} />
        </div>
      </div>
      
      {/* Second Section - Recordings Library on White Background */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <RecordingsLibrary searchQuery={globalSearchQuery} />
        </div>
      </div>
    </div>
  );
};

