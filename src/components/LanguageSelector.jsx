import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' }
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[140px] rounded-2xl glass border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 text-white">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="text-sm font-medium">{currentLanguage.name}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-2xl bg-gray-900/95 backdrop-blur-sm border-white/10">
          {languages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              className="flex items-center gap-2 text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer py-2"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
