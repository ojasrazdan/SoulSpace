import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Language options for India
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸', native: 'English' },
  { value: 'hi', label: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { value: 'bn', label: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
  { value: 'te', label: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
  { value: 'mr', label: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
  { value: 'ta', label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
  { value: 'gu', label: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' },
  { value: 'kn', label: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  { value: 'ml', label: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
  { value: 'pa', label: 'Punjabi', flag: '🇮🇳', native: 'ਪੰਜਾਬੀ' },
  { value: 'or', label: 'Odia', flag: '🇮🇳', native: 'ଓଡ଼ିଆ' },
  { value: 'as', label: 'Assamese', flag: '🇮🇳', native: 'অসমীয়া' },
];

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (language: string) => void;
  getLanguageLabel: (code: string) => string;
  getLanguageNative: (code: string) => string;
  getLanguageFlag: (code: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Return a fallback context instead of throwing an error
    console.warn('useLanguage used outside of LanguageProvider, using fallback');
    return {
      currentLanguage: 'en',
      setCurrentLanguage: () => {},
      getLanguageLabel: (code: string) => LANGUAGE_OPTIONS.find(lang => lang.value === code)?.label || 'English',
      getLanguageNative: (code: string) => LANGUAGE_OPTIONS.find(lang => lang.value === code)?.native || 'English',
      getLanguageFlag: (code: string) => LANGUAGE_OPTIONS.find(lang => lang.value === code)?.flag || '🇺🇸',
    };
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');

  // Load language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguageState(savedLanguage);
  }, []);

  // Listen for language change events
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { language } = event.detail;
      setCurrentLanguageState(language);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const setCurrentLanguage = (language: string) => {
    setCurrentLanguageState(language);
    localStorage.setItem('preferred-language', language);
  };

  const getLanguageLabel = (code: string): string => {
    return LANGUAGE_OPTIONS.find(lang => lang.value === code)?.label || 'English';
  };

  const getLanguageNative = (code: string): string => {
    return LANGUAGE_OPTIONS.find(lang => lang.value === code)?.native || 'English';
  };

  const getLanguageFlag = (code: string): string => {
    return LANGUAGE_OPTIONS.find(lang => lang.value === code)?.flag || '🇺🇸';
  };

  const value: LanguageContextType = {
    currentLanguage,
    setCurrentLanguage,
    getLanguageLabel,
    getLanguageNative,
    getLanguageFlag,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
