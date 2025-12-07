import React, { useState } from 'react';
import { generateVeoVideo } from '../services/geminiService';

export const CreatorStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setVideoUrl(null);
        setError(null);
        
        try {
            const url = await generateVeoVideo(prompt);
            if (url) {
                setVideoUrl(url);
            } else {
                setError("The video model did not return a valid video. Please try a different prompt.");
            }
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes('403') || e.message?.includes('API key')) {
                setError("Billing Required: Video generation (Veo) requires a paid Google Cloud Project API key. Please enable billing in your project.");
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
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-4">
                        Powered by Veo
                     </div>
                     <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">Situation to Video</h2>
                     <p className="text-gray-500">Describe a situation, object, or concept, and Veo will create a video for it.</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Describe the scene</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., A teacher demonstrating sign language in a bright classroom, cinematic lighting, 4k..."
                            className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary outline-none transition-all resize-none"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Generating Video (this takes a moment)...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                Generate with Veo
                            </>
                        )}
                    </button>

                    {videoUrl && (
                        <div className="mt-8 rounded-2xl overflow-hidden bg-black shadow-2xl">
                            <video controls autoPlay loop className="w-full h-auto aspect-video" src={videoUrl} />
                        </div>
                    )}
                    
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 text-xs rounded-lg flex gap-2 items-start">
                        <span className="font-bold">Note:</span>
                        This feature uses the Veo model which requires a paid Google Cloud Project API key. You will be prompted to select a key if you haven't already.
                    </div>
                </div>
            </div>
        </div>
    );
};