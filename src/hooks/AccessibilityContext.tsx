// src/hooks/AccessibilityContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AccessibilityContextProps {
  isAccessibleMode: boolean;
  toggleAccessibility: () => void;

  ttsEnabled: boolean;
  toggleTTS: () => void;

  highContrast: boolean;
  toggleHighContrast: () => void;

  adhdMode: boolean;
  toggleADHDMode: () => void;

  speakText: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const [ttsEnabled, setTTSEnabled] = useState<boolean>(() => {
    const v = localStorage.getItem('a11y_tts');
    return v ? v === '1' : false;
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const v = localStorage.getItem('a11y_high_contrast');
    return v ? v === '1' : false;
  });
  const [adhdMode, setADHDMode] = useState<boolean>(() => {
    const v = localStorage.getItem('a11y_adhd');
    return v ? v === '1' : false;
  });

  const toggleAccessibility = () => setIsAccessibleMode(prev => !prev);
  const toggleTTS = () => setTTSEnabled(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleADHDMode = () => setADHDMode(prev => !prev);

  // Persist preferences and apply global classes
  useEffect(() => {
    localStorage.setItem('a11y_tts', ttsEnabled ? '1' : '0');
  }, [ttsEnabled]);

  useEffect(() => {
    localStorage.setItem('a11y_high_contrast', highContrast ? '1' : '0');
    const root = document.documentElement;
    if (highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('a11y_adhd', adhdMode ? '1' : '0');
    const root = document.documentElement;
    if (adhdMode) root.classList.add('adhd-mode');
    else root.classList.remove('adhd-mode');
  }, [adhdMode]);

  const speakWithElevenLabs = async (text: string) => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined;
    const voiceId = (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ?? '21m00Tcm4TlvDq8ikWAM';
    if (!apiKey) return false;
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.8 } })
      });
      if (!res.ok) return false;
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
      return true;
    } catch {
      return false;
    }
  };

  const speakText = async (text: string) => {
    if (!ttsEnabled) return;
    const usedExternal = await speakWithElevenLabs(text);
    if (!usedExternal && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Hover and focus announce
  useEffect(() => {
    if (!ttsEnabled) return;

    let lastElement: EventTarget | null = null;
    let lastSpoken = "";
    let hoverTimeout: number | undefined;

    const extractText = (el: HTMLElement): string => {
      const aria = el.getAttribute('aria-label');
      const title = el.getAttribute('title');
      const alt = (el as HTMLImageElement).alt;
      const label = aria || title || alt || "";
      const text = (el.innerText || el.textContent || "").trim();
      const combined = (label || text).replace(/\s+/g, ' ').trim();
      return combined.length > 240 ? combined.slice(0, 240) + '…' : combined;
    };

    const shouldIgnore = (el: HTMLElement | null) => {
      if (!el) return true;
      const role = el.getAttribute('role');
      if (el.classList.contains('non-essential') || el.classList.contains('chatbot')) return true;
      if (role === 'presentation' || role === 'none') return true;
      return false;
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || shouldIgnore(target)) return;
      if (lastElement === e.target) return;
      lastElement = e.target;

      if (hoverTimeout) window.clearTimeout(hoverTimeout);
      hoverTimeout = window.setTimeout(async () => {
        // Find nearest label-bearing ancestor if needed
        let el: HTMLElement | null = target;
        for (let i = 0; i < 3 && el && extractText(el) === ""; i++) {
          el = el.parentElement;
        }
        if (!el) return;
        const text = extractText(el);
        if (!text || text === lastSpoken) return;
        lastSpoken = text;
        await speakText(text);
      }, 120);
    };

    const handleFocus = async (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || shouldIgnore(target)) return;
      const text = extractText(target);
      if (!text || text === lastSpoken) return;
      lastSpoken = text;
      await speakText(text);
    };

    document.addEventListener('mouseover', handleHover, { passive: true });
    document.addEventListener('focusin', handleFocus, { passive: true });
    return () => {
      document.removeEventListener('mouseover', handleHover as any);
      document.removeEventListener('focusin', handleFocus as any);
      if (hoverTimeout) window.clearTimeout(hoverTimeout);
    };
  }, [ttsEnabled, speakText]);

  return (
    <AccessibilityContext.Provider value={{
      isAccessibleMode,
      toggleAccessibility,
      ttsEnabled,
      toggleTTS,
      highContrast,
      toggleHighContrast,
      adhdMode,
      toggleADHDMode,
      speakText
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
};
