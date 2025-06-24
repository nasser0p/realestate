
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

export type LanguageCode = 'en' | 'ar';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    // Initializer function for useState:
    // Read from localStorage synchronously on initial component render.
    const storedLanguage = localStorage.getItem('appLanguage') as LanguageCode | null;
    return storedLanguage || 'en'; // Default to 'en' if nothing is stored
  });

  useEffect(() => {
    // This effect runs whenever the 'language' state changes,
    // and also on the initial mount after the state is initialized.
    // It's responsible for all side effects related to language change.
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('appLanguage', language);
  }, [language]); // Dependency array ensures this runs when 'language' changes.

  const setLanguage = (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    // The useEffect hook above will handle DOM and localStorage updates.
  };

  const toggleLanguage = () => {
    // Use functional update form of setState if new state depends on old state
    setLanguageState(prevLanguage => (prevLanguage === 'en' ? 'ar' : 'en'));
    // The useEffect hook above will handle DOM and localStorage updates.
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
