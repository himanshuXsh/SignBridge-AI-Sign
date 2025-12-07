import React, { useEffect, useState } from 'react';
import { AppMode } from '../types';

interface LayoutProps {
  currentMode: AppMode;
  onNavigate: (mode: AppMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ currentMode, onNavigate, children }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (currentMode !== AppMode.HOME) {
      onNavigate(AppMode.HOME);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-textPrimary bg-bgLight relative">
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || currentMode !== AppMode.HOME ? 'bg-[#f5f7fb]/90 backdrop-blur-md border-b border-gray-200/50' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer font-bold text-lg" 
              onClick={() => onNavigate(AppMode.HOME)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-base shadow-glow">S</div>
              <span className="font-display tracking-tight text-textPrimary">SignBridge</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 text-[0.95rem] font-medium text-textMuted">
              <button onClick={() => handleNavClick('hero')} className="nav-link hover:text-primary transition-colors">Home</button>
              <button onClick={() => handleNavClick('features')} className="nav-link hover:text-primary transition-colors">Features</button>
              <button onClick={() => handleNavClick('faq')} className="nav-link hover:text-primary transition-colors">FAQ</button>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-4">
                 {currentMode !== AppMode.HOME && (
                     <button onClick={() => onNavigate(AppMode.HOME)} className="md:hidden text-sm font-semibold text-textMuted">Back</button>
                 )}
                 <button 
                    onClick={() => onNavigate(AppMode.LIVE_PRACTICE)}
                    className="bg-gradient-to-br from-primary to-primaryDark text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:translate-y-px hover:shadow-soft transition-all shadow-lg shadow-primary/30"
                >
                    Try Live Demo
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Chatbot FAB */}
      {currentMode !== AppMode.CHATBOT && (
          <button 
            onClick={() => onNavigate(AppMode.CHATBOT)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-40 border-4 border-white"
            title="Open Chat Assistant"
          >
            <span className="text-2xl">💬</span>
          </button>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200/50 py-10 mt-12 bg-bgLight">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-sm text-textMuted">
             © {new Date().getFullYear()} SignBridge · Experimental sign-language assistant.
           </div>
           <div className="flex gap-6 text-sm font-medium text-textMuted">
             <button onClick={() => handleNavClick('hero')} className="hover:text-primary">Home</button>
             <button onClick={() => onNavigate(AppMode.CHATBOT)} className="hover:text-primary">Chatbot</button>
             <button onClick={() => handleNavClick('faq')} className="hover:text-primary">FAQ</button>
           </div>
        </div>
      </footer>
    </div>
  );
};