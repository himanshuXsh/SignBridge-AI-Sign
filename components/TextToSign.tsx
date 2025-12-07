import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateSignInstructions } from '../services/geminiService';

export const TextToSign: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
        const result = await generateSignInstructions(text);
        setInstructions(result);
    } catch (e) {
        setInstructions("Failed to generate instructions.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-[24px] p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold font-display text-primary mb-2">Text to Sign Guidance</h2>
                <p className="text-gray-500">Enter a phrase, and Gemini will think through the best way to sign it.</p>
            </div>

            <div className="relative mb-8">
                <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type what you want to say..." 
                    className="w-full h-32 p-6 rounded-2xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-lg transition-all"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !text.trim()}
                    className="absolute bottom-4 right-4 bg-primary text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                           <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Thinking...
                        </>
                    ) : (
                        <>
                           Generate Steps
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </>
                    )}
                </button>
            </div>

            {instructions && (
                <div className="bg-gradient-to-br from-accent2/10 to-transparent p-8 rounded-2xl border border-accent2/20 animate-fade-in">
                    <h3 className="text-xl font-bold text-accent2 mb-4 flex items-center gap-2">
                        <span className="bg-accent2 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">AI</span>
                        Instructions
                    </h3>
                    <div className="prose prose-blue max-w-none text-gray-700">
                        <ReactMarkdown>{instructions}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};