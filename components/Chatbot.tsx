import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        { role: 'model', text: "Hello! I am SignBridge Bot. I can help you with questions about sign language, finding resources, or just chat in your preferred language. How can I help?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // Convert history to API format
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            
            const response = await chatWithGemini(history, userMsg);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col p-4">
             <div className="bg-white rounded-[24px] shadow-xl border border-gray-100 flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white">🤖</div>
                    <div>
                        <h3 className="font-bold text-gray-900">SignBridge Assistant</h3>
                        <p className="text-xs text-gray-500">Multilingual Support</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                msg.role === 'user' 
                                ? 'bg-primary text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && (
                         <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything in any language..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all shadow-md"
                        >
                            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </div>
             </div>
        </div>
    );
};