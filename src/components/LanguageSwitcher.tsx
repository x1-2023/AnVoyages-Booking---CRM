import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'US EN', flag: '🇺🇸' },
  { code: 'vi', label: 'VN VI', flag: '🇻🇳' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
      <Globe className="w-4 h-4 text-muted-foreground ml-2" />
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`relative px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            i18n.language === lang.code
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {i18n.language === lang.code && (
            <motion.div
              layoutId="language-indicator"
              className="absolute inset-0 bg-primary rounded-full"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
          <span className="relative z-10 text-base">
            {lang.flag}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
