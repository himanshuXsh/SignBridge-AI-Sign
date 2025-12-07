import React, { useState } from 'react';
import { generateSignImage } from '../services/geminiService';

export const TextToSignImage: React.FC = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setImageUrl(null);
        setError(null);

        try {
            const result = await generateSignImage(text);
            if (result) {
                setImageUrl(result);
            } else {
                setError("Could not generate image. Please try a different prompt.");
            }
        } catch (e: any) {
            console.error(e);
             if (e.message?.includes('403') || e.message?.includes('API key')) {
                setError("Billing Required: High-quality image generation requires a paid Google Cloud Project API key.");
            } else if (e.toString().includes('Requested entity was not found')) {
                 setError("API Key Error: A valid paid project key was not selected. Please try again.");
            } else {
                setError("Generation failed. Please ensure you have selected a valid API key when prompted.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-[24px] p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold font-display text-primary mb-2">Visualize Signs</h2>
                    <p className="text-gray-500">Type a word, and Gemini 3 Pro will generate an image of how to sign it.</p>
                </div>

                <div className="max-w-xl mx-auto space-y-4">
                    <div className="relative">
                        <input 
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            placeholder="Type a word (e.g., 'Hello', 'Love', 'Cat')..." 
                            className="w-full p-5 pr-32 rounded-full bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-lg transition-all"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !text.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-full font-medium shadow-md hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {loading ? "Creating..." : "Generate"}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 mt-4">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {imageUrl && (
                        <div className="mt-8 bg-black rounded-2xl overflow-hidden shadow-2xl animate-fade-in relative group">
                            <img src={imageUrl} alt={`Sign for ${text}`} className="w-full h-auto object-contain max-h-[500px]" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="font-medium text-center">AI Generated representation for "{text}"</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-4 text-xs text-center text-gray-400">
                        *Uses Gemini 3 Pro Image Generation. Requires a paid project API key.
                    </div>
                </div>
            </div>
        </div>
    );
};