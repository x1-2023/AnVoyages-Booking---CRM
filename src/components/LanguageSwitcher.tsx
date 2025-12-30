import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const USFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-4 rounded-sm">
    <rect width="512" height="512" fill="#bf0a30"/>
    <rect y="39.4" width="512" height="39.4" fill="#fff"/>
    <rect y="118.2" width="512" height="39.4" fill="#fff"/>
    <rect y="197" width="512" height="39.4" fill="#fff"/>
    <rect y="275.8" width="512" height="39.4" fill="#fff"/>
    <rect y="354.6" width="512" height="39.4" fill="#fff"/>
    <rect y="433.4" width="512" height="39.4" fill="#fff"/>
    <rect width="256" height="275.8" fill="#002868"/>
  </svg>
);

const VNFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-4 rounded-sm">
    <rect width="512" height="512" fill="#da251d"/>
    <polygon points="256,133 283,210 364,210 299,259 323,336 256,291 189,336 213,259 148,210 229,210" fill="#ffff00"/>
  </svg>
);

const languages = [
  { code: 'en', Flag: USFlag },
  { code: 'vi', Flag: VNFlag },
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
          className={`relative px-3 py-1.5 rounded-full transition-colors ${
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
          <span className="relative z-10 flex items-center justify-center">
            <lang.Flag />
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
