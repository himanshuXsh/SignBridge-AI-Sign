import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { SignToText } from './components/SignToText';
import { TextToSign } from './components/TextToSign';
import { TextToSignImage } from './components/TextToSignImage';
import { LivePractice } from './components/LivePractice';
import { CreatorStudio } from './components/CreatorStudio'; // Mode 4
import { Chatbot } from './components/Chatbot';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  const renderContent = () => {
    switch (mode) {
      case AppMode.HOME:
        return <Hero onStartDemo={() => setMode(AppMode.LIVE_PRACTICE)} onNavigate={setMode} />;
      case AppMode.SIGN_TO_TEXT:
        return <SignToText />;
      case AppMode.TEXT_TO_SIGN:
        return <TextToSign />;
      case AppMode.TEXT_TO_IMAGE:
        return <TextToSignImage />;
      case AppMode.TEXT_TO_VIDEO:
        return <CreatorStudio />;
      case AppMode.LIVE_PRACTICE:
        return <LivePractice />;
      case AppMode.CHATBOT:
        return <Chatbot />;
      default:
        return <Hero onStartDemo={() => setMode(AppMode.LIVE_PRACTICE)} onNavigate={setMode} />;
    }
  };

  return (
    <Layout currentMode={mode} onNavigate={setMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;