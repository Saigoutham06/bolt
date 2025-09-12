import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  isScrolled?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
  isScrolled = false
}) => {
  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te' as Language, name: 'తెలుగు', flag: '🇮🇳' }
  ];

  return (
    <div className="relative group">
      <button className={`flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-lg transition-all duration-300 transform hover:scale-105 ${
        isScrolled 
          ? 'bg-white/20 border-gray-300 text-gray-900 hover:bg-white/40' 
          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
      }`}>
        <Globe size={16} />
        <span className="hidden sm:block">
          {languages.find(lang => lang.code === currentLanguage)?.flag}
        </span>
        <span className="text-sm font-medium">
          {languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl transform hover:scale-105 ${
              currentLanguage === language.code ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;