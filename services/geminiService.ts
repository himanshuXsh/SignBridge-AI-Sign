import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";

// --- Models ---
const MODEL_VISION_THINKING = "gemini-3-pro-preview"; // Complex tasks
const MODEL_FAST = "gemini-2.5-flash"; // Fast tasks / Search
const MODEL_TTS = "gemini-2.5-flash-preview-tts";
const MODEL_LIVE = "gemini-2.5-flash-native-audio-preview-09-2025";
const MODEL_VEO = "veo-3.1-fast-generate-preview";
const MODEL_IMAGE = "gemini-3-pro-image-preview";

// --- Helpers ---
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Critical: Ensure user has selected a paid key for Veo/Imagen features
export const checkAndRequestApiKey = async () => {
    // Only attempt this in the specific AI Studio environment that supports it
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                // This opens the dialog. If the user cancels or has no project, it might throw or just return.
                // We await it so the user has time to interact.
                await window.aistudio.openSelectKey();
            }
        } catch (e) {
            console.warn("API Key selection flow was interrupted or failed:", e);
            // We swallow the error here so the app can attempt the API call
            // (which will fail with a 403/400 and be caught by the UI layer for a proper error message)
        }
    }
};

// 1. Analyze Sign Image (Vision + Thinking)
export const analyzeSignImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_VISION_THINKING,
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: "Analyze this image. If it contains a hand sign, identify it and explain its meaning in sign language contexts. Be concise and friendly." }
      ]
    },
    config: {
        thinkingConfig: { thinkingBudget: 2048 }
    }
  });
  return response.text || "I couldn't analyze that image.";
};

// 2. Generate Sign Instructions (Thinking Mode)
export const generateSignInstructions = async (phrase: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_VISION_THINKING,
    contents: `Teach me how to sign the phrase: "${phrase}". Break it down into clear, step-by-step physical instructions for hands, face, and body. If exact signs aren't standard, suggest fingerspelling or common conceptual signs.`,
    config: {
      thinkingConfig: { thinkingBudget: 4096 },
    }
  });
  return response.text || "Could not generate instructions.";
};

// 3. Text to Speech
export const speakText = async (text: string): Promise<ArrayBuffer> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_TTS,
    contents: { parts: [{ text }] },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// 4. Veo Video Generation (Mode 4)
export const generateVeoVideo = async (prompt: string): Promise<string | null> => {
    await checkAndRequestApiKey();
    // We must re-instantiate GoogleGenAI to pick up the newly selected key from process.env
    const ai = getAI(); 
    
    try {
        let operation = await ai.models.generateVideos({
            model: MODEL_VEO,
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!uri) return null;
        
        return `${uri}&key=${process.env.API_KEY}`;
    } catch (e) {
        console.error("Veo generation failed", e);
        throw e;
    }
};

// 5. Generate Sign Image (Mode 3)
export const generateSignImage = async (text: string): Promise<string | null> => {
    await checkAndRequestApiKey();
    const ai = getAI();

    try {
        const response = await ai.models.generateContent({
            model: MODEL_IMAGE,
            contents: { 
                parts: [{ text: `A clear, photo-realistic educational image of a person performing the sign language gesture for "${text}". The hand position should be clearly visible against a neutral background. High quality, educational style.` }] 
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    imageSize: "1K"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Image gen failed", e);
        throw e;
    }
};

// 6. Chatbot
export const chatWithGemini = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    const ai = getAI();
    const chat = ai.chats.create({
        model: MODEL_VISION_THINKING,
        history: history as any,
        config: {
            systemInstruction: "You are SignBridge Bot, a helpful, friendly, and knowledgeable sign language assistant. You can answer questions about sign language, deaf culture, and general topics. You must answer in the language the user is speaking (e.g., Hindi, Spanish, English). Keep answers concise and helpful."
        }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "";
}

// 7. Live API Connect
export const connectLiveSession = async (
    onOpen: () => void,
    onAudioData: (data: string) => void,
    onClose: () => void
): Promise<{ sendAudio: (blob: any) => void, close: () => void }> => {
    const ai = getAI();
    
    let session: any = null;

    const sessionPromise = ai.live.connect({
        model: MODEL_LIVE,
        callbacks: {
            onopen: () => {
                console.log("Live Session Open");
                onOpen();
            },
            onmessage: (message: LiveServerMessage) => {
                const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    onAudioData(audioData);
                }
            },
            onclose: () => {
                console.log("Live Session Closed");
                onClose();
            },
            onerror: (err) => {
                console.error("Live Session Error", err);
                onClose();
            }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            },
            systemInstruction: "You are a helpful sign language tutor. Listen to the user and help them practice. Be encouraging and concise."
        }
    });

    session = await sessionPromise;

    return {
        sendAudio: (pcmBlob: any) => {
             session.sendRealtimeInput({ media: pcmBlob });
        },
        close: () => {
            session.close();
        }
    };
};

export function createPCMBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);

    return {
        data: b64,
        mimeType: 'audio/pcm;rate=16000',
    };
}