import { useState, useCallback, useRef } from 'react';

export default function useVoice(onResult) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!supported) return alert('Voice not supported in this browser');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = 'en-IN'; // Indian English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart  = () => setListening(true);
    recognition.onend    = () => setListening(false);
    recognition.onerror  = () => setListening(false);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'en-IN';
    utter.rate  = 0.95;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }, []);

  return { listening, supported, startListening, stopListening, speak };
}
