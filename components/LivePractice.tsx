import React, { useEffect, useState, useRef } from 'react';
import { connectLiveSession, createPCMBlob } from '../services/geminiService';

export const LivePractice: React.FC = () => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Ready to connect");
    
    // Refs for audio handling
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const sessionRef = useRef<{ sendAudio: (blob: any) => void; close: () => void } | null>(null);
    
    // Output Audio
    const nextStartTimeRef = useRef<number>(0);
    const outputContextRef = useRef<AudioContext | null>(null);

    const startSession = async () => {
        setError(null);
        setStatus("Connecting...");
        
        try {
            // 1. Setup Input Audio
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ac = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = ac;
            
            const source = ac.createMediaStreamSource(stream);
            const processor = ac.createScriptProcessor(4096, 1, 1);
            
            sourceRef.current = source;
            scriptProcessorRef.current = processor;
            
            source.connect(processor);
            processor.connect(ac.destination);

            // 2. Setup Output Audio
            const outAc = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            outputContextRef.current = outAc;
            nextStartTimeRef.current = 0;

            // 3. Connect to Gemini
            const session = await connectLiveSession(
                () => { // On Open
                    setConnected(true);
                    setStatus("Listening... Speak now!");
                },
                async (base64Audio) => { // On Audio Data
                    if (!outputContextRef.current) return;
                    
                    const ctx = outputContextRef.current;
                    const binaryString = atob(base64Audio);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    
                    // Decode
                    const dataInt16 = new Int16Array(bytes.buffer);
                    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
                    const channelData = buffer.getChannelData(0);
                    for (let i = 0; i < dataInt16.length; i++) {
                        channelData[i] = dataInt16[i] / 32768.0;
                    }

                    // Play
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    const sourceNode = ctx.createBufferSource();
                    sourceNode.buffer = buffer;
                    sourceNode.connect(ctx.destination);
                    sourceNode.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += buffer.duration;
                },
                () => { // On Close
                    setConnected(false);
                    setStatus("Session closed.");
                }
            );

            sessionRef.current = session;

            // 4. Start Sending Data
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPCMBlob(inputData);
                session.sendAudio(pcmBlob);
            };

        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to connect microphone or API.");
            setConnected(false);
            cleanup();
        }
    };

    const cleanup = () => {
        sessionRef.current?.close();
        sourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        outputContextRef.current?.close();
        
        sessionRef.current = null;
        sourceRef.current = null;
        scriptProcessorRef.current = null;
        audioContextRef.current = null;
        outputContextRef.current = null;
        
        setConnected(false);
    };

    const stopSession = () => {
        setStatus("Stopping...");
        cleanup();
        setStatus("Ready to connect");
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup();
    }, []);

    return (
        <div className="max-w-xl mx-auto p-6 text-center">
            <div className={`rounded-full w-32 h-32 mx-auto flex items-center justify-center transition-all duration-500 mb-8 ${connected ? 'bg-red-500 shadow-red-500/50 shadow-2xl scale-110 animate-pulse' : 'bg-primary shadow-primary/50 shadow-xl'}`}>
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            
            <h2 className="text-3xl font-bold font-display mb-2">{connected ? "Listening..." : "Live Practice"}</h2>
            <p className="text-gray-500 mb-8">{status}</p>

            {error && <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-xl">{error}</div>}

            {!connected ? (
                <button 
                    onClick={startSession}
                    className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all w-full sm:w-auto"
                >
                    Start Conversation
                </button>
            ) : (
                <button 
                    onClick={stopSession}
                    className="bg-white border-2 border-red-500 text-red-500 px-8 py-4 rounded-full text-lg font-bold hover:bg-red-50 transition-all w-full sm:w-auto"
                >
                    End Session
                </button>
            )}
            
            <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-left">
                <h3 className="font-bold text-gray-900 mb-2">Instructions</h3>
                <ul className="list-disc list-inside text-gray-500 space-y-1">
                    <li>Allow microphone access.</li>
                    <li>The AI tutor will listen to your voice.</li>
                    <li>Ask questions like "How do I sign 'Thank you'?" or practice conversation.</li>
                    <li>This uses the new <strong>Gemini Live API</strong> for real-time interaction.</li>
                </ul>
            </div>
        </div>
    );
};