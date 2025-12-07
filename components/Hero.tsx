import React, { useEffect, useRef, useState } from 'react';
import { AppMode } from '../types';

interface HeroProps {
  onStartDemo: () => void;
  onNavigate: (mode: AppMode) => void;
}

const Reveal: React.FC<{ children: React.ReactNode, delay?: number }> = ({ children, delay = 0 }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

export const Hero: React.FC<HeroProps> = ({ onStartDemo, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div id="hero" className="overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.25fr_1fr] gap-12 items-center">
          
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#44d1a6]/10 text-[#059669] text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
              New · Built with Gemini 3 Pro
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-textPrimary leading-[1.1] mb-6 font-display">
              Bridge sign language, <br className="hidden lg:block"/>
              text and voice in seconds.
            </h1>
            
            <p className="text-lg sm:text-xl text-textMuted max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8">
              SignBridge is an experimental AI assistant that interprets hand signs, generates videos, and bridges communication gaps using Gemini’s multimodal reasoning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStartDemo}
                className="bg-gradient-to-br from-primary to-primaryDark text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-primary/40 hover:-translate-y-0.5 hover:shadow-soft transition-all"
              >
                Open Live App
              </button>
              <button 
                onClick={() => onNavigate(AppMode.CHATBOT)}
                className="bg-white/70 border border-gray-300 text-textPrimary px-8 py-3.5 rounded-full font-semibold hover:bg-white transition-all flex items-center gap-2"
              >
                <span>💬</span> Chat Assistant
              </button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none lg:mr-0">
             <div className="relative rounded-[36px] bg-gradient-to-br from-[#e3edff] to-[#f5f7fb] p-8 shadow-soft hover:scale-[1.01] transition-transform duration-300 group">
                <div className="absolute top-5 left-6 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-textMuted flex items-center gap-2">
                    Live preview <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="hand-3d group-hover:-translate-y-2"></div>
                    <div className="flex flex-col gap-3">
                        <div className="bg-white px-4 py-2.5 rounded-[24px] shadow-lg text-[0.95rem] font-bold text-textPrimary">
                            “Hello!”
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                            🔊
                        </div>
                        <p className="text-xs text-textMuted max-w-[10rem]">
                            Upload a frame and let SignBridge speak it out.
                        </p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- CAPABILITIES GRID --- */}
      <section className="py-20 bg-gradient-to-b from-transparent to-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-display mb-3">Capabilities</h2>
                <p className="text-textMuted max-w-xl mx-auto">Four powerful ways to connect, learn, and create.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Mode 1: Sign to Text */}
                <Reveal>
                    <div className="bg-white rounded-[24px] p-6 shadow-soft h-full hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary/20" onClick={() => onNavigate(AppMode.SIGN_TO_TEXT)}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">📷</div>
                            <div>
                                <h3 className="font-bold text-lg">Sign → Text & Speech</h3>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Mode 1</div>
                            </div>
                        </div>
                        <p className="text-sm text-textMuted">Upload an image of a sign. The AI identifies the meaning and speaks it out loud.</p>
                    </div>
                </Reveal>

                {/* Mode 2: Text to Guide */}
                <Reveal delay={100}>
                    <div className="bg-white rounded-[24px] p-6 shadow-soft h-full hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary/20" onClick={() => onNavigate(AppMode.TEXT_TO_SIGN)}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">📝</div>
                            <div>
                                <h3 className="font-bold text-lg">Text → Sign Guide</h3>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Mode 2</div>
                            </div>
                        </div>
                        <p className="text-sm text-textMuted">Type a phrase and get step-by-step instructions on how to sign it correctly.</p>
                    </div>
                </Reveal>

                {/* Mode 3: Text to Image */}
                <Reveal delay={200}>
                    <div className="bg-white rounded-[24px] p-6 shadow-soft h-full hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary/20" onClick={() => onNavigate(AppMode.TEXT_TO_IMAGE)}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xl">🎨</div>
                            <div>
                                <h3 className="font-bold text-lg">Text → Sign Image</h3>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Mode 3</div>
                            </div>
                        </div>
                        <p className="text-sm text-textMuted">Visualize any word! The AI generates a photo-realistic image of the sign.</p>
                    </div>
                </Reveal>

                {/* Mode 4: Text to Video */}
                <Reveal delay={300}>
                    <div className="bg-white rounded-[24px] p-6 shadow-soft h-full hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-primary/20" onClick={() => onNavigate(AppMode.TEXT_TO_VIDEO)}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">🎬</div>
                            <div>
                                <h3 className="font-bold text-lg">Situation → Video</h3>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">Mode 4</div>
                            </div>
                        </div>
                        <p className="text-sm text-textMuted">Describe a situation or object, and generate a video using Veo.</p>
                    </div>
                </Reveal>
            </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section id="faq" className="py-20 bg-white/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
             <h2 className="text-2xl font-bold font-display text-center mb-2">FAQ</h2>
             <div className="space-y-3 mt-8">
                {[
                    { q: "Is SignBridge a certified interpreter?", a: "No. SignBridge is an experimental assistant built for learning and prototyping. For any legal, medical, or emergency communication, always use a trained human interpreter." },
                    { q: "Which sign languages are supported?", a: "The prototype is designed to work with ASL and ISL examples, but it relies on Gemini’s general visual reasoning." },
                    { q: "Why do I need an API key for Images/Video?", a: "High-quality generation models like Veo and Imagen 3 are paid features. You can use your own Google Cloud Project key." },
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer" onClick={() => toggleFaq(i)}>
                        <div className={`p-4 flex justify-between items-center text-sm font-medium transition-colors ${openFaq === i ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50'}`}>
                            {item.q}
                            <span className={`w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform ${openFaq === i ? 'rotate-45 bg-primary/20 text-primary' : ''}`}>+</span>
                        </div>
                        {openFaq === i && (
                            <div className="p-4 pt-0 text-sm text-textMuted border-t border-transparent">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
      </section>
    </div>
  );
};