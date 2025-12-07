import React, { useState, useRef } from 'react';
import { analyzeSignImage, speakText } from '../services/geminiService';

export const SignToText: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);

    try {
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        
        const text = await analyzeSignImage(base64Data, mimeType);
        setResult(text);

        // Auto speak
        try {
            const audioBuffer = await speakText(text);
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = await ctx.decodeAudioData(audioBuffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        } catch (audioErr) {
            console.warn("TTS failed", audioErr);
        }

    } catch (error) {
        setResult("Error analyzing image. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
       <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-xl border border-gray-100">
             <h2 className="text-2xl font-bold mb-4 font-display">Capture Sign</h2>
             <p className="text-gray-500 mb-6">Upload a photo of a hand sign to understand its meaning.</p>
             
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
             >
                {image ? (
                    <img src={image} alt="Upload" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-gray-500 font-medium">Click to Upload</span>
                    </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </div>

             <button 
                disabled={!image || loading}
                onClick={handleAnalyze}
                className="mt-6 w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? "Analyzing with Gemini..." : "Translate Sign"}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-xl border border-gray-100 min-h-[400px] flex flex-col">
             <h2 className="text-2xl font-bold mb-4 font-display text-accent1">Result</h2>
             
             {result ? (
                 <div className="flex-1 flex flex-col justify-center">
                    <div className="p-6 bg-accent1/10 rounded-2xl border border-accent1/20 mb-4">
                        <p className="text-lg text-gray-800 leading-relaxed">{result}</p>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                        Playing audio automatically...
                    </div>
                 </div>
             ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                     <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                     </div>
                     <p>Upload an image to see the translation here.</p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};