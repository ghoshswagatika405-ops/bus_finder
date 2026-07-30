import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, MessageSquare, Bot, Bus, Navigation } from 'lucide-react';
import { BUSES_LIST, calculateDistanceKm, formatDistanceText, getCrowdIndicator } from '../data/busData';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  buses = BUSES_LIST,
  userLocation = { lat: 20.2785, lng: 85.7892, name: 'Baramunda BSABT' },
  onTrackBus
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('Hello! Ask me "Where is Bus 108?" or "Which bus is nearest?"');
  const [matchedBus, setMatchedBus] = useState(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech Recognition & Synthesis APIs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('Listening for your voice command...');
        };

        recognition.onresult = (event) => {
          const spokenText = event.results[0][0].transcript;
          setTranscript(`"${spokenText}"`);
          processVoiceQuery(spokenText);
        };

        recognition.onerror = (event) => {
          setIsListening(false);
          setTranscript('Could not capture voice cleanly. Try clicking a sample query below.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [buses, userLocation]);

  // Text To Speech (App Speaks Out Loud)
  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop Speech Output
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Start Live Microphone Voice Listening
  const startListening = () => {
    stopSpeech();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      alert('Web Speech API is not supported on this browser. Try Chrome/Edge or click a sample query!');
    }
  };

  // AI Agent Natural Language Understanding & Distance/ETA Processing
  const processVoiceQuery = (query) => {
    const q = query.toLowerCase();

    // Find if user mentioned specific bus number (e.g. 108, 207, 305, 12, 1080...)
    const foundBus = buses.find((b) => {
      const numStr = String(b.number).toLowerCase();
      const nameStr = (b.name || '').toLowerCase();
      return q.includes(numStr) || q.includes(nameStr) || q.includes(`bus ${numStr}`) || q.includes(`bus number ${numStr}`);
    });

    if (foundBus) {
      setMatchedBus(foundBus);
      const distKm = calculateDistanceKm(userLocation.lat, userLocation.lng, foundBus.lat, foundBus.lng);
      const meters = Math.round(distKm * 1000);
      const etaMins = Math.max(1, Math.round((distKm / 25) * 60)); // Avg 25 km/h in city
      const crowd = getCrowdIndicator(foundBus);

      let responseText = '';
      if (meters < 1000) {
        responseText = `Bus ${foundBus.number} (${foundBus.name}) is ${meters} meters away from ${userLocation.name} and will arrive in ${etaMins} minutes. Crowd level is ${crowd.level}.`;
      } else {
        responseText = `Bus ${foundBus.number} (${foundBus.name}) is ${distKm.toFixed(1)} kilometers away and will arrive in approximately ${etaMins} minutes.`;
      }

      setAiResponse(responseText);
      speakText(responseText);
      return;
    }

    // Handle "nearest bus" or "closest bus"
    if (q.includes('nearest') || q.includes('closest') || q.includes('next bus')) {
      let minDistance = Infinity;
      let closestBus = null;

      buses.forEach((b) => {
        const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestBus = b;
        }
      });

      if (closestBus) {
        setMatchedBus(closestBus);
        const distKm = minDistance;
        const meters = Math.round(distKm * 1000);
        const etaMins = Math.max(1, Math.round((distKm / 25) * 60));

        const responseText = `The nearest bus is Bus ${closestBus.number} (${closestBus.name}), located ${formatDistanceText(distKm)} from ${userLocation.name}. Estimated arrival in ${etaMins} minutes.`;
        setAiResponse(responseText);
        speakText(responseText);
        return;
      }
    }

    // Fallback response for unrecognized voice input
    const fallbackText = `I heard: "${query}". Try asking "Where is Bus 108?" or "Where is Bus 207?" or "Which bus is closest?"`;
    setAiResponse(fallbackText);
    speakText(fallbackText);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '28px',
          padding: '24px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #1A5CE5 0%, #7C3AED 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                BEC AI Voice Assistant
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} color="#7C3AED" /> Powered by Voice AI Agent
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32, fontWeight: 800, cursor: 'pointer' }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Pulsing Voice Microphone Core Visualizer */}
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div
            onClick={isListening ? () => recognitionRef.current?.stop() : startListening}
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: isListening
                ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                : isSpeaking
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #1A5CE5 0%, #7C3AED 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              cursor: 'pointer',
              boxShadow: isListening
                ? '0 0 0 12px rgba(239, 68, 68, 0.25)'
                : isSpeaking
                ? '0 0 0 12px rgba(16, 185, 129, 0.25)'
                : '0 8px 24px rgba(26, 92, 229, 0.35)',
              transition: 'all 0.3s ease'
            }}
          >
            {isListening ? (
              <MicOff size={38} className="pulse-icon" />
            ) : isSpeaking ? (
              <Volume2 size={38} className="pulse-icon" />
            ) : (
              <Mic size={38} />
            )}
          </div>

          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isListening ? '#DC2626' : isSpeaking ? '#059669' : '#1A5CE5', marginTop: 12 }}>
            {isListening ? '🎙️ Listening... Speak Now!' : isSpeaking ? '🔊 Speaking Response...' : 'Tap Mic to Speak Voice Command'}
          </div>
        </div>

        {/* User Voice Transcript Speech Bubble */}
        {transcript && (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: 14, fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={16} color="#1A5CE5" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', fontWeight: 800 }}>YOU SAID:</span>
              <span>{transcript}</span>
            </div>
          </div>
        )}

        {/* AI Agent Answer Speech Bubble */}
        <div style={{ background: '#EBF2FF', border: '1.5px solid #BFDBFE', padding: '14px 16px', borderRadius: 18, fontSize: '0.88rem', fontWeight: 800, color: '#1E40AF', marginBottom: 16, lineHeight: 1.45, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.72rem', color: '#1A5CE5', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Bot size={14} /> AI AGENT RESPONSE
            </span>
            {isSpeaking ? (
              <button onClick={stopSpeech} style={{ background: '#DBEAFE', border: 'none', color: '#1E40AF', padding: '2px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                <VolumeX size={12} /> Stop Audio
              </button>
            ) : (
              <button onClick={() => speakText(aiResponse)} style={{ background: '#DBEAFE', border: 'none', color: '#1E40AF', padding: '2px 8px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Volume2 size={12} /> Replay Voice
              </button>
            )}
          </div>

          <p style={{ margin: 0 }}>"{aiResponse}"</p>

          {matchedBus && onTrackBus && (
            <button
              onClick={() => {
                stopSpeech();
                onTrackBus(matchedBus);
                onClose();
              }}
              style={{
                marginTop: 10,
                width: '100%',
                background: '#1A5CE5',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px',
                borderRadius: 12,
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Bus size={15} /> Track Bus {matchedBus.number} Live on Map ➔
            </button>
          )}
        </div>

        {/* Quick Sample Voice Command Chips */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: 8 }}>
            Try 1-Click Voice Command Samples:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: '🗣️ "Where is Bus 108?"', text: 'Where is Bus 108?' },
              { label: '🗣️ "Where is Bus 207?"', text: 'Where is Bus 207?' },
              { label: '🗣️ "Where is Bus 305?"', text: 'Where is Bus 305?' },
              { label: '🗣️ "Which bus is nearest to me?"', text: 'Which bus is nearest to me?' }
            ].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(`"${sample.text}"`);
                  processVoiceQuery(sample.text);
                }}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
