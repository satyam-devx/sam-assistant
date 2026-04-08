import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  History, 
  Volume2, 
  VolumeX, 
  Mic, 
  Square, 
  Keyboard 
} from 'lucide-react';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Tap to Start');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am SamAI. How can I help you today?", type: 'ai' }
  ]);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setStatus("I'm Listening...");
      };

      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (transcript.trim()) {
        const newMessage = { id: Date.now(), text: transcript, type: 'user' };
        setMessages(prev => [...prev, newMessage]);

        setTimeout(() => {
          setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: "I'm processing your request. Please wait a moment...", 
            type: 'ai' 
          }]);
        }, 1000);
      }
      setTranscript('');
      setStatus('Processing...');
      setTimeout(() => setStatus('Tap to Start'), 2000);
    } else {
      recognitionRef.current?.start();
      setStatus("I'm Listening...");
    }
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden select-none">
      
      <header className="flex items-center justify-between px-6 pt-12 pb-6 z-10">
        <button className="p-3 rounded-full bg-white/5 active:scale-95 transition-all backdrop-blur-md border border-white/10">
          <ChevronLeft size={20} />
        </button>
        
        <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wider text-purple-200">SamAI 1.0</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] border border-purple-500/30 uppercase font-bold text-purple-400">Beta</span>
        </div>

        <button className="p-3 rounded-full bg-white/5 active:scale-95 transition-all backdrop-blur-md border border-white/10">
          <History size={20} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start relative px-8">
        
        <div className="relative w-64 h-64 mt-4 flex items-center justify-center">
          <div className={`absolute inset-0 bg-purple-600/30 blur-[60px] rounded-full transition-all duration-1000 ${isListening ? 'scale-125 opacity-100' : 'scale-100 opacity-40'}`}></div>
          <div className="absolute inset-0 bg-fuchsia-500/20 blur-[100px] rounded-full animate-pulse"></div>
          
          <div className="relative w-48 h-48 rounded-full overflow-hidden border border-white/20 shadow-[inset_0_0_40px_rgba(255,255,255,0.2)] bg-gradient-to-br from-purple-500/20 to-black/40 backdrop-blur-sm flex items-center justify-center">
            <svg viewBox="0 0 200 200" className={`w-full h-full opacity-80 ${isListening ? 'animate-[spin_10s_linear_infinite]' : 'animate-[spin_20s_linear_infinite]'}`}>
              <defs>
                <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d8b4fe" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
              </defs>
              <path 
                d="M40,100 Q60,40 100,100 T160,100" 
                fill="none" 
                stroke="url(#orbGrad)" 
                strokeWidth="2" 
                className="animate-pulse"
              />
              <circle cx="100" cy="100" r="70" fill="none" stroke="url(#orbGrad)" strokeWidth="0.5" strokeDasharray="10 5" />
              <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" transform="rotate(45 100 100)" />
              <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" transform="rotate(-45 100 100)" />
            </svg>
            
            <div className={`absolute w-24 h-24 bg-white/10 rounded-full blur-2xl transition-all duration-500 ${isListening ? 'scale-150' : 'scale-100'}`}></div>
          </div>
        </div>

        <div className="w-full flex-1 flex flex-col justify-end mt-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10"></div>
          
          <div className="flex flex-col-reverse gap-6 pb-20 overflow-y-auto no-scrollbar">
            {isListening && transcript && (
              <div className="text-center text-xl font-medium text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {transcript}
              </div>
            )}
            
            {messages.slice().reverse().map((msg, index) => (
              <div 
                key={msg.id}
                className="text-center px-4 transition-all duration-700 ease-out"
                style={{ 
                  opacity: Math.max(0, 1 - (index * 0.25)),
                  transform: `scale(${Math.max(0.8, 1 - (index * 0.05))})`
                }}
              >
                <p className={`text-xl ${msg.type === 'ai' ? 'text-purple-300' : 'text-white/60'} font-medium leading-relaxed`}>
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-8 pb-12 pt-4 bg-gradient-to-t from-black to-transparent flex flex-col items-center gap-6">
        
        <div className="text-sm font-medium tracking-widest text-white/40 uppercase transition-all duration-300">
          {status}
        </div>

        <div className="flex items-center justify-between w-full max-w-sm">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all text-white/70 hover:text-white"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button 
            onClick={toggleListening}
            className="relative group flex items-center justify-center"
          >
            {isListening && (
              <>
                <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20 scale-150"></div>
                <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse opacity-40 scale-110"></div>
              </>
            )}
            
            <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
              ? 'bg-white text-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
              : 'bg-purple-600 text-white shadow-[0_10px_40px_rgba(126,34,206,0.4)]'
            }`}>
              {isListening ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}
            </div>
          </button>

          <button className="p-4 rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all text-white/70 hover:text-white">
            <Keyboard size={24} />
          </button>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default App;
