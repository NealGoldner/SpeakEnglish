import { useState, useRef } from 'react';
import { Mic, Square, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function SpeechPractice() {
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("Describe your favorite hobby.");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      await analyzeSpeech(audioBlob);
    };
    
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const analyzeSpeech = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: 'audio/webm',
                  data: base64Audio,
                },
              },
              {
                text: `You are an English teacher. Please listen to this student's response to the topic: "${topic}". Provide feedback on their pronunciation, grammar, and fluency. Keep it encouraging and constructive.`,
              },
            ],
          },
        });
        setFeedback(response.text || 'No feedback available.');
      };
    } catch (error) {
      console.error(error);
      setFeedback('Error analyzing speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Topic</h2>
        <p className="text-zinc-600">{topic}</p>
      </div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-6 rounded-full ${isRecording ? 'bg-red-500' : 'bg-emerald-600'} text-white shadow-lg`}
        >
          {isRecording ? <Square size={32} /> : <Mic size={32} />}
        </motion.button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center gap-2 text-zinc-500">
          <Loader2 className="animate-spin" />
          Analyzing your speech...
        </div>
      )}

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200"
        >
          <div className="flex items-center gap-2 mb-4 text-zinc-900 font-semibold">
            <MessageSquare size={20} />
            Feedback
          </div>
          <p className="text-zinc-700 whitespace-pre-line">{feedback}</p>
        </motion.div>
      )}
    </div>
  );
}
